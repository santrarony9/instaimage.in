import { Injectable, Logger, ConflictException } from '@nestjs/common';

@Injectable()
export class AvailabilityService {
  private readonly logger = new Logger(AvailabilityService.name);

  // In a real application, this would use Redis to store locks
  // e.g., key: `lock:date:2024-10-10:time:10:00-14:00`, value: `bookingId`
  private mockRedisLocks = new Map<string, string>();

  /**
   * Checks if a specific date and time slot is available for a booking.
   * In Phase 1 (in-house), we ensure at least one in-house photographer is free.
   */
  async checkAvailability(
    date: Date,
    startTime: string,
    endTime: string,
  ): Promise<boolean> {
    const lockKey = this.generateLockKey(date, startTime, endTime);
    this.logger.log(`Checking availability for slot: ${lockKey}`);

    // Simulate checking against existing locks
    if (this.mockRedisLocks.has(lockKey)) {
      return false; // Slot is already taken/locked
    }

    // Additional logic would query the Bookings repository to see if
    // ALL photographers are booked at this time.
    return true; // Available
  }

  /**
   * Acquires a temporary lock on a time slot while the customer pays.
   * If payment fails or times out (e.g., 10 minutes), the lock expires.
   */
  async lockSlot(
    date: Date,
    startTime: string,
    endTime: string,
    bookingId: string,
  ): Promise<boolean> {
    const isAvailable = await this.checkAvailability(date, startTime, endTime);
    if (!isAvailable) {
      throw new ConflictException(
        'The selected time slot is no longer available.',
      );
    }

    const lockKey = this.generateLockKey(date, startTime, endTime);
    this.mockRedisLocks.set(lockKey, bookingId);
    this.logger.log(`Locked slot: ${lockKey} for Booking: ${bookingId}`);

    // In real Redis, we'd set an expiry: `await redis.set(lockKey, bookingId, 'EX', 600)`

    return true;
  }

  /**
   * Releases a lock (e.g., if booking is cancelled or payment fails).
   */
  async releaseLock(
    date: Date,
    startTime: string,
    endTime: string,
  ): Promise<void> {
    const lockKey = this.generateLockKey(date, startTime, endTime);
    this.mockRedisLocks.delete(lockKey);
    this.logger.log(`Released lock: ${lockKey}`);
  }

  private generateLockKey(
    date: Date,
    startTime: string,
    endTime: string,
  ): string {
    const dateString = date.toISOString().split('T')[0];
    return `lock:date:${dateString}:time:${startTime}-${endTime}`;
  }
}
