# Changelog

## [Unreleased] - 2026-01-15

### Added
- **Single Source of Truth**: Created `services/api/prisma/seed.ts` to populate all engines with consistent data and production URLs.
- **Internal Engine Pages**: Added `apps/hub/src/app/engines/[slug]/page.tsx` to serve as a detail page for each engine, boosting SEO and user journey control.
- **Production URLs**: API now serves `launchUrl` (e.g. `https://facebook.smarthustlermarketing.com`) to replace localhost links.
- **SmartHustler Domain Support**: Updated CORS in API to allow requests from `*.smarthustlermarketing.com`.

### Changed
- **Homepage**: "Popular Engines" now link directly to the production tools (external).
- **Engine Directory**: 
  - Cards now link to the *internal* detail page (`/engines/slug`) instead of the external tool directly.
  - "No results" state now shows "Popular Engines" instead of a dead end.

### Deployment Instructions

1. **Environment Variables**:
   Ensure `NEXT_PUBLIC_API_BASE_URL` is set to your production API URL (e.g., `https://api.signalengines.com`) in your Vercel project settings for `apps/hub`.

2. **Database Seeding**:
   You must run the seed script to populate the database with the new engine definitions.
   Run the following from the root of the repo (or locally):
   ```bash
   cd services/api
   npx ts-node prisma/seed.ts
   ```

### Quick Smoke Test Checklist

1. **Homepage Links**:
   - Go to Homepage.
   - Hover over "Open Engine" on a popular card.
   - internalVerify it points to `https://[subdomain].smarthustlermarketing.com` (or similar).

2. **Directory & Search**:
   - Go to `/engines`.
   - Verify all engines are listed.
   - Type "gibberish" in search. Verify "Popular Engines" appear below "No engines found".

3. **Detail Page**:
   - Click "View Details" on any engine card.
   - Verify you land on `/engines/[slug]`.
   - Verify "Run Scan Now" button opens the tool in a new tab.
   - Verify "Join Prevention Club" button exists.

4. **API Response**:
   - Check `https://api.signalengines.com/public/engines` (or local equivalent).
   - Verify response includes `launchUrl` and `category`.
