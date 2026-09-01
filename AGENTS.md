# InstaImage AI Agent Instructions & Memory

These rules are critical for maintaining the project's infrastructure costs and data integrity. Read and follow them carefully before making any modifications.

## Vercel Cost Management (CRITICAL)
The project is hosted on Vercel and is highly sensitive to billing spikes. Do NOT make any changes that would increase Vercel usage costs:

1. **Image Optimization:** 
   - Next.js `<Image>` components route through Vercel's proprietary image optimization API, which is extremely expensive for marketplace sites. 
   - **RULE:** DO NOT remove `unoptimized: true` from `frontend/next.config.ts`. All images must bypass Vercel's optimization server. If using `<Image>` tags manually without the global config, always include the `unoptimized` prop.
   - **NOTE:** To maintain Core Web Vitals, image optimization (resizing and conversion to WebP) is instead handled on the backend API via the `sharp` library during file uploads before saving to Backblaze B2.

2. **Serverless Function Execution (Compute):**
   - The frontend pages heavily rely on Incremental Static Regeneration (ISR) using `export const revalidate = 60;`.
   - **RULE:** DO NOT change `revalidate: 60` to `force-dynamic`, `no-store`, or `cache: 'no-cache'`. Forcing dynamic rendering on every request will cause Vercel serverless compute costs to skyrocket.

3. **Vercel Paid Features:**
   - **RULE:** DO NOT install or configure `@vercel/analytics` or `@vercel/speed-insights`.

## Codebase Nuances & Known Bugs

1. **Backend Validation (`whitelist: true`):**
   - The global `ValidationPipe` in NestJS strips out any properties not explicitly defined in DTOs.
   - **RULE:** Whenever adding nested object arrays (like `addons: { name, price }[]`), you MUST create a specific class for the nested object and use `@ValidateNested()` + `@Type(() => ClassName)`. Otherwise, the array items will be saved as empty objects.

2. **Category Data Normalization:**
   - The frontend dynamically generates the category list directly from the `category` string property on existing `services`, NOT from the `categories` database collection.
   - **RULE:** If you modify a category's name in the `categories` database, remember that it does NOT automatically update the `category` string inside existing `services`. A manual migration or Mongoose hook is required to keep them perfectly synced.

3. **API Routing Mismatches:**
   - The local frontend `.env.local` points directly to the live production API (`NEXT_PUBLIC_API_URL=https://api.instaimage.in/api/v1`).
   - **RULE:** Be very careful when making frontend API calls locally, as they will modify the live production database.

## Infrastructure & VPS Deployment

1. **MongoDB Connection String (`MONGODB_URI`):**
   - The backend API relies on MongoDB running via Docker Compose.
   - **RULE:** If the `MONGO_INITDB_ROOT_PASSWORD` contains special characters (like `!`, `@`, `#`), they MUST be URL-encoded in the `MONGODB_URI` connection string (e.g., `!` becomes `%21`). Failing to encode special characters will cause the `api` and `workers` containers to crash continuously with a `MongoServerError: Authentication failed` error.

2. **Nginx Reverse Proxy & Double Slash Bug:**
   - **RULE:** When configuring Nginx `proxy_pass` to the NestJS API, DO NOT use `proxy_pass http://api:3000/;` (with a trailing slash) if inside a location block like `location /api/`. Nginx appends the remaining URI to the root `/`, generating double slashes (e.g., `//v1/categories`), which NestJS automatically rejects with a 404 Not Found.
   - **SOLUTION:** Always use `rewrite ^/api/(.*) /$1 break;` and `proxy_pass http://api:3000;` (without trailing slash).

## WhatsApp Cloud API Configuration

1. **Meta Account Details:**
   - **WABA ID:** 912697385227149
   - **Phone Number ID:** 1302518772938870
   - **Business Manager ID:** 2304624620305829
   - **Billing:** Postpaid Auto-Pay via MasterCard ending in 7370.

2. **OTP Template Workaround (CRITICAL):**
   - Meta blocked the creation of AUTHENTICATION templates (Error 2388185).
   - **Current Hack:** The backend whatsapp.service.ts temporarily uses an approved UTILITY template (ooking_confirmation_alert) to send OTPs, passing the OTP as the booking number. This keeps costs at ~?0.30 per login.
   - **Future Fix:** A MARKETING template named instaimage_promo_code was submitted. If approved, switch to it for better UX. Once Meta Support manually unlocks Authentication templates, switch to instaimage_otp to reduce costs to ~?0.11.
