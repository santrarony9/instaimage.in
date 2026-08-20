export enum Role {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  OPERATIONS = 'OPERATIONS',
  FINANCE = 'FINANCE',
  SUPPORT = 'SUPPORT',
  QC_INSPECTOR = 'QC_INSPECTOR',
  EDITOR = 'EDITOR',
  SELLER = 'SELLER',
  PHOTOGRAPHER = 'PHOTOGRAPHER', // Legacy/Migration
  CUSTOMER = 'CUSTOMER',
}

export enum Permission {
  // Booking Permissions
  BOOKING_CREATE = 'booking:create',
  BOOKING_READ_ALL = 'booking:read_all',
  BOOKING_READ_OWN = 'booking:read_own',
  BOOKING_CANCEL = 'booking:cancel',
  BOOKING_ASSIGN = 'booking:assign',

  // QC & Gallery Permissions
  QC_APPROVE = 'qc:approve',
  QC_REJECT = 'qc:reject',
  GALLERY_PUBLISH = 'gallery:publish',

  // Financial Permissions
  PAYMENT_REFUND = 'payment:refund',
  PAYOUT_TRIGGER = 'payout:trigger',
}
