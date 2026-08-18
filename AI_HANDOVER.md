# AI Handover & Context Document: On-Demand Photography Platform

**To the AI Assistant reading this file:** 
You have just been handed over a sophisticated, modern web application project. This document contains the entire "brain state" of the previous AI (Antigravity) that built the foundation of this platform. Please read this entirely before making any architectural decisions or modifications.

## 1. Project Overview
This is an **On-Demand Photography Booking Platform** (similar to Uber for photographers). Customers can browse services, select packages, purchase add-ons, choose flexible or strict timelines, log in securely, and book a photographer at a specific location and time. 

## 2. Technology Stack
*   **Frontend**: Next.js 14 (App Router), React, TypeScript, Tailwind CSS v3, Zustand (Global State Management).
*   **Backend**: NestJS (Monorepo architecture), TypeScript, Mongoose v9 (MongoDB), Passport.js (JWT Authentication).
*   **Infrastructure**: Docker, Docker Compose, Nginx (Reverse Proxy on VPS).
*   **Deployment**: Frontend on Vercel, Backend (API + Workers + Mongo + Redis) on a Debian VPS.

## 3. Architecture & Security 

### Frontend (`/frontend`)
*   **Routing**: Uses Next.js App Router with Route Groups (`(marketing)`, `(booking)`, `(dashboard)`, `(auth)`).
*   **State & API Client**: We use `Zustand` for state. The API Client (`src/lib/api.ts`) automatically intercepts requests and attaches the JWT `Authorization: Bearer <token>` from the local storage.
*   **Booking Flow**: Located in `src/components/booking/`. 
    *   *Step 6 (Customer)* checks authentication. If logged out, it prompts the user to log in/register inline without losing cart state.
    *   *Step 8 (Confirmation)* constructs the `CreateBookingDto` and executes the secure `POST /bookings` request.
*   **Dashboards**: Located in `src/app/(dashboard)`.
    *   `admin/page.tsx`: Analytics overview (Total Revenue, Total Bookings).
    *   `admin/bookings/page.tsx`: Data table listing all global bookings.
    *   `customer/page.tsx`: Personal portal for customers to see their exact spend and booking history.

### Backend (`/backend`)
*   **Users & Auth Module**: Fully implemented in `apps/api/src/modules/users` and `modules/auth`. We use `bcrypt` for password hashing and `@nestjs/jwt` for token signing. 
*   **Security**: All routes are protected by default via `JwtAuthGuard` and `RolesGuard` (`@app/auth`). Use `@Public()` to bypass, or `@Roles(Role.CUSTOMER, Role.ADMIN)` to restrict access.
*   **Database Pattern**: We strictly use the **Repository Pattern**. Look at `libs/database/src/abstract/abstract.repository.ts`. All feature repositories (e.g., `BookingsRepository`) must extend this. (Note: Mongoose v9 uses `Record<string, any>` instead of `FilterQuery`).

## 4. Key Business Logic (MUST READ)

### Strict vs. Flexible Time
*   **Strict Time**: The default. Customer gets exactly the package duration.
*   **Flexible Time**: Customer can pre-purchase *Extra Hours*. 
*   *Pricing Engine*: The logic to calculate `totalPrice` = `basePrice` + `addonsPrice` + (`extraHoursBooked` * `extraHourRate`) + `surcharges` + `deliveryCharge` - `discount` is securely calculated in `BookingsService.createBooking`. **Do not duplicate this logic on the frontend.**

### Addons
Customers can select multiple addons (Drone, Video, Express Edit). This is managed via an array of `addonIds` in the Zustand store and resolved to their actual prices in the Backend `BookingsService`.

## 5. Deployment Setup
*   The VPS is Debian 12.
*   We use a custom `deploy.ps1` PowerShell script at the root directory to securely zip the backend, SCP it to the VPS, and run `docker-compose up -d --build`.
*   `docker-compose.yml` spins up: `nginx`, `api` (port 3000), `workers`, `mongodb` (local volume), and `redis`.
*   Nginx routes `/api` to the backend container. 
*   **DO NOT PUSH `node_modules` OR `.env` TO GIT.** 

## 6. Current State & Pending Tasks (Phase 3)
The core database, API endpoints, Authentication, Dashboards, and full End-to-End Booking Flow are **completely finished and wired together.** 

**The User explicitly decided to SKIP Payments, S3 Storage, and BullMQ for now. They will proceed manually (e.g., WhatsApp payments).**

**Recently Completed Milestones:**
1.  **Deployment**: Frontend is deployed via Vercel (CI/CD via GitHub). Backend is deployed on the Debian VPS via Docker Compose and proxied via a Cloudflare Tunnel (bypassing Nginx).
2.  **Surcharges**: Implemented manual Surcharge additions directly within the Admin Bookings table.
3.  **Photographer Dashboard**: Implemented "Pro Portal" for photographers to view their Schedule and Assignments.
4.  **Admin Catalog UI**: Implemented unified Catalog UI with tabs to manage Services, Packages, and Add-ons dynamically.

**Next Immediate Steps for the NEW AI to Execute:**
1.  **Iterative UI Refinements**: Final polish on the booking flow and dashboards.
2.  **Notification System**: Consider adding email or SMS alerts for bookings and assignment updates.
3.  **Payments (Optional)**: If the user changes their mind, integrate Stripe/Razorpay into the booking checkout.

---
*Generated by Antigravity AI - August 2026*
