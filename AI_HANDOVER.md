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

## 5. Deployment Setup & Scripts (CRITICAL)
*   **Frontend (Vercel)**: Pushed to GitHub. Vercel automatically deploys `master`. Custom domain `instaimage.in` is configured with Full SSL in Cloudflare.
*   **Backend (VPS)**: 135.125.9.81 (Debian 12, 6GB RAM). 
    *   **CRITICAL CONSTRAINT**: The VPS has limited memory. NEVER run `npm run build` twice in parallel, it will trigger OOM and crash the server requiring a hard reboot. 
    *   **Dockerfile Architecture**: Uses a single multi-stage build. In `nest-cli.json`, `"deleteOutDir": false` is strictly required so `api` and `workers` builds do not overwrite each other.
    *   **Nginx & Cloudflared**: The VPS runs `cloudflared` (locally managed via `/etc/cloudflared/config.yml`) which routes `api.instaimage.in` to the local Nginx container on port 80. Nginx proxies `/v1/` to the `api` container on port 3000.
*   **Deployment Script**: ALWAYS use `node deploy_now.js` to deploy backend changes. It tars `backend/`, uploads it via SSH, rebuilds Docker safely, and runs `docker system prune -af` to prevent disk full issues.

## 6. Current State & Pending Tasks
The core database, API endpoints, Authentication (Local + Google OAuth), Dashboards, Resend Email Integration (Forgot Password, Welcome), and full End-to-End Booking Flow are **completely finished and wired together.** 

**Recently Completed Milestones:**
1.  **Architecture Split**: Moved Frontend to Vercel and Backend to VPS behind Cloudflare Tunnel (`api.instaimage.in`) to prevent memory/fail2ban server bans.
2.  **Auth & Emails**: Implemented Resend for password resets and welcome emails. Integrated Google OAuth natively.
3.  **Docker Optimization**: Merged API and Workers into a unified image build, solving OOM crashes and disk space issues.

**Next Immediate Steps for the NEW AI to Execute:**
1.  **Verify Edge Cases**: Monitor Cloudflare Tunnel stability and Vercel routing.
2.  **Iterative UI Refinements**: Final polish on the booking flow and dashboards.
3.  **Payments (Optional)**: If the user decides to move past manual (WhatsApp) payments, integrate Stripe/Razorpay.

---
*Generated by Antigravity AI - August 2026*
