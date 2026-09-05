# conmeet.moe - Development Roadmap

## Phase 1: Foundation & Infrastructure
**Goal:** Set up the core architecture, repositories, and basic user authentication.

*   **Repository Setup:** Initialize the frontend repository (Next.js, TypeScript, Tailwind CSS) and backend repository (Python).
*   **Database Provisioning:** Set up a PostgreSQL database instance for user data and application state.
*   **Authentication:** Implement the Discord OAuth flow on the backend. Create the login/logout UI on the frontend.
*   **Storage Configuration:** Provision Cloudflare R2 buckets for object storage (images/media) and configure Cloudflare CDN.

## Phase 2: Content Management & Core Pages
**Goal:** Build out the static content structures and the main discovery pages.

*   **CMS Integration:** Integrate Payload CMS to manage official conventions and platform-wide content.
*   **Landing Page:** Build the hero section, active conventions grid, and upcoming conventions list.
*   **Convention Home Pages:** Create dynamic routing for individual conventions, displaying essential details (dates, maps, official links).
*   **Guest vs. Member Access:** Implement route protection and conditional UI rendering based on the user's authentication state.

## Phase 3: The Freebie Tracker
**Goal:** Implement the crowdsourced swag and giveaway features.

*   **Data Models:** Create database schemas for freebies, vendors, and user-saved freebies.
*   **Submission Form:** Build the frontend form for authenticated users to submit new freebies (item details, requirements, location).
*   **Freebie Board:** Develop the main freebie list for each convention, including robust filtering and grouping mechanisms.
*   **User Interactions:** Add "Save" functionality to add freebies to a personal list and a toggle to check off obtained items.

## Phase 4: Meetups & Interactions
**Goal:** Deploy the social gathering and RSVP features, including media support.

*   **Meetup Schemas:** Define models for Official (admin-added) and Unofficial (user-added) meetups.
*   **Meetup Directory:** Build the UI to list all meetups for a specific convention.
*   **RSVP System:** Implement the "Going" button and public headcount logic for logged-in users.
*   **Comment Section:** Develop the discussion threads for meetups.
*   **Image Uploads:** Wire up the frontend image uploader to securely push media to Cloudflare R2 for comments and replies.

## Phase 5: Personal Timeline & Polish
**Goal:** Tie everything together into a personalized user schedule and prepare for launch.

*   **Timeline Engine:** Build the logic to aggregate major Official events and the user's saved Unofficial meetups into a single chronological view.
*   **Schedule UI:** Design a clean, visual timeline interface to help users avoid overlapping commitments.
*   **Performance Optimization:** Ensure all Next.js static assets and R2 images are correctly cached and served via Cloudflare CDN.
*   **Deployment:** Finalize production deployments on Vercel (frontend) and the chosen backend hosting provider (e.g., Railway/AWS).

## Future Considerations (Post-Launch)
*   **Google OAuth:** Integrate secondary login methods.
*   **Interactive Maps:** Venue maps with droppable pins for freebies/meets.
*   **PWA / Offline Mode:** Service workers to ensure core schedules load in convention centers with poor reception.
