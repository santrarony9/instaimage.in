# AI Handover & Context Document: On-Demand Photography Platform

**To the AI Assistant reading this file:** 
You have just been handed over a sophisticated, modern web application project. This document contains the entire "brain state" of the previous AI (Antigravity) that built the foundation of this platform. Please read this entirely before making any architectural decisions or modifications.

## 1. Project Overview
This is an **On-Demand Photography & Production Booking Platform** (similar to Uber for photographers). Customers can browse services, select packages, purchase add-ons, choose flexible or strict timelines, log in securely, and book a photographer at a specific location and time. 

## 2. Technology Stack
*   **Frontend**: Next.js 14 (App Router), React, TypeScript, Tailwind CSS v3, Zustand (Global State Management).
*   **Backend**: NestJS (Monorepo architecture), TypeScript, Mongoose v9 (MongoDB), Passport.js (JWT Authentication).
*   **Infrastructure**: Docker, Docker Compose, Nginx (Reverse Proxy on VPS).
*   **Deployment**: Frontend on Vercel, Backend (API + Workers + Mongo + Redis) on a Debian VPS.

## 3. Architecture & Security 

### Frontend (`/frontend`)
*   **Routing & SEO**: Uses Next.js App Router. We use **clean slug URLs** (e.g., `/services/podcast-shoot`) for SEO instead of database IDs. The frontend `getService` function has custom fallback logic to find services by slug locally if the backend doesn't support direct slug lookup.
*   **Theme & UI**: The platform uses a **Quick-Commerce / Instamart style design** (square tiles, clean grids, left-side vertical tabs for categories). 
    *   **Theme Color**: The primary accent color is **Blue** (`blue-600`, `blue-50`) to perfectly match the "InstaImage" logo. Do not use green or dark cinematic themes.
    *   **Categories**: The homepage dynamically extracts categories from the `/services` API array instead of calling the `/categories` API, as it is currently returning 401 Unauthorized for public users.
*   **Booking Flow**: Located in `src/components/booking/`. Layout is highly compacted (no heavy padding or margins) to ensure it fits in a single window without extensive scrolling.

### Backend (`/backend`)
*   **Users & Auth Module**: Fully implemented in `apps/api/src/modules/users` and `modules/auth`. We use `bcrypt` for password hashing and `@nestjs/jwt` for token signing. 
*   **Security**: All routes are protected by default via `JwtAuthGuard` and `RolesGuard` (`@app/auth`). Use `@Public()` to bypass, or `@Roles(Role.CUSTOMER, Role.ADMIN)` to restrict access.
*   **Database Pattern**: We strictly use the **Repository Pattern**. Look at `libs/database/src/abstract/abstract.repository.ts`. All feature repositories (e.g., `BookingsRepository`) must extend this. (Note: Mongoose v9 uses `Record<string, any>` instead of `FilterQuery`).

## 4. Key Business Logic (MUST READ)

### Strict vs. Flexible Time
*   **Strict Time**: The default. Customer gets exactly the package duration.
*   **Flexible Time**: Customer can pre-purchase *Extra Hours*. 
*   *Pricing Engine*: The logic to calculate `totalPrice` = `basePrice` + `addonsPrice` + (`extraHoursBooked` * `extraHourRate`) + `surcharges` + `deliveryCharge` - `discount` is securely calculated in `BookingsService.createBooking`. **Do not duplicate this logic on the frontend.**
*   *UI Handling*: If a service does not support flexible pricing, the flexible timing option boxes are completely hidden in the UI rather than disabled/greyed out.

### Addons & Communications
*   Customers can select multiple addons. This is managed via an array of `addonIds` in the Zustand store.
*   Service details pages include a direct WhatsApp integration for pre-booking consultation (using the official number).

## 5. Deployment Setup & Scripts (CRITICAL)
*   **Frontend (Vercel)**: Pushed to GitHub. Vercel automatically deploys `master`. Custom domain `instaimage.in` is configured with Full SSL in Cloudflare.
*   **Backend (VPS)**: Debian 12, 6GB RAM. 
    *   **CRITICAL CONSTRAINT**: The VPS has limited memory. NEVER run `npm run build` twice in parallel, it will trigger OOM and crash the server requiring a hard reboot. 
    *   **Dockerfile Architecture**: Uses a single multi-stage build. In `nest-cli.json`, `"deleteOutDir": false` is strictly required so `api` and `workers` builds do not overwrite each other.
    *   **Nginx & Cloudflared**: The VPS runs `cloudflared` (locally managed via `/etc/cloudflared/config.yml`) which routes `api.instaimage.in` to the local Nginx container on port 80. Nginx proxies `/v1/` to the `api` container on port 3000. Nginx `client_max_body_size` is set to `50M` to allow large image uploads.
*   **Deployment Script**: ALWAYS use `node deploy_now.js` to deploy backend changes. It tars `backend/`, uploads it via SSH, rebuilds Docker safely, and runs `docker system prune -af` to prevent disk full issues.

## 6. Current State & Pending Tasks
The core database, API endpoints, Authentication (Local + Google OAuth), Dashboards, Resend Email Integration (Forgot Password, Welcome), and full End-to-End Booking Flow are **completely finished and wired together.** 

**Recently Completed Milestones:**
1.  **Quick Commerce Redesign**: Transformed UI to an Instamart-style grid with a Blue brand theme, removing heavy banners.
2.  **SEO Slug URLs**: Services are now accessed via clean slugs (e.g. `/services/podcast-shoot`).
3.  **Booking Compaction**: Consolidated booking wizard UI to fit single screens.
4.  **Admin Uploads**: Increased Nginx body size limit to solve 413 errors during image uploads.

**Next Immediate Steps for the NEW AI to Execute:**
1.  **Iterative UI Refinements**: Final polish on the booking flow and dashboards.
2.  **Meta Developer Console**: Help the user resolve the WhatsApp Business API registration block (+91 94778 33176).
3.  **Payments (Optional)**: If the user decides to move past manual (WhatsApp) payments, integrate Stripe/Razorpay.

---
*Generated by Antigravity AI - August 2026*
