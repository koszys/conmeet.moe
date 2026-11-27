# Phase 4 Implementation Plan: Dedicated Collections Hub & Upload Form

To ensure a gradual progression without introducing too many changes at once, **Phase 4** is broken down into **4 sequential, testable sub-steps**:

---

## 4A. Reusable Album Card & Meetup Detail Page Preview

### Objective
Build the core album card primitive and connect the Meetup Detail page's Collections section to live backend data.

### Proposed Changes
1. **[`frontend/src/features/meetups/components/collections/AlbumCard.tsx`](file:///Users/koszy/Desktop/Black%20Hole/programming/projects/conmeet.moe/frontend/src/features/meetups/components/collections/AlbumCard.tsx)**:
   - Neobrutalist album preview card featuring:
     - 4-photo thumbnail mosaic (or single cover photo with overlay if < 4 photos).
     - Photo count badge (`Photos (N)`).
     - Album title with hover accent.
     - Photographer credit (`by @username`).
     - Action bar: Public like counter badge and favorite bookmark button.
   - Linked to `/conventions/[slug]/meetups/[id]/collections/[albumId]`.
2. **[`frontend/src/features/meetups/components/collections/AlbumCardSkeleton.tsx`](file:///Users/koszy/Desktop/Black%20Hole/programming/projects/conmeet.moe/frontend/src/features/meetups/components/collections/AlbumCardSkeleton.tsx)**:
   - Skeleton placeholder for album cards during initial load.
3. **Update [`frontend/src/features/meetups/components/detail/MeetupDetailView.tsx`](file:///Users/koszy/Desktop/Black%20Hole/programming/projects/conmeet.moe/frontend/src/features/meetups/components/detail/MeetupDetailView.tsx)**:
   - Replace placeholder in the "Photo Collections & Albums" section with `useMeetupAlbums(meetupId, 'popular')`.
   - When albums exist: renders the top albums in a responsive grid with a primary "View Collections (N)" button linking to `/conventions/[slug]/meetups/[id]/collections`.
   - When no albums exist yet: shows a clean EmptyState with a "View Collections" call-to-action button.

### Verification
- `npm --prefix frontend run typecheck`
- `npm --prefix frontend run lint`
- View `/conventions/[slug]/meetups/[id]` to inspect the new live section.

---

## 4B. Dedicated Collections Gallery Page

### Objective
Create the dedicated gallery page listing all albums for a meetup with interactive sorting tabs.

### Proposed Changes
1. **Route**: [`frontend/src/app/(app)/conventions/[slug]/meetups/[id]/collections/page.tsx`](file:///Users/koszy/Desktop/Black%20Hole/programming/projects/conmeet.moe/frontend/src/app/(app)/conventions/[slug]/meetups/[id]/collections/page.tsx)
2. **Component [`frontend/src/features/meetups/components/collections/MeetupCollectionsView.tsx`](file:///Users/koszy/Desktop/Black%20Hole/programming/projects/conmeet.moe/frontend/src/features/meetups/components/collections/MeetupCollectionsView.tsx)**:
   - Header with `BackLink` to meetup, convention uppercase badge, meetup title, and "Add Photos" action button (`CONBLOCK_PRIMARY`).
   - Sorting toolbar with standard `FilterTab`: **"All Collections"** (default), **"Most Popular"**, and **"Newest"** with horizontal scroll affordance fade slider and trailing spacer to prevent cutoff.
   - Grid rendering `AlbumCard`s with responsive layout and skeleton loading states.
   - Empty state when no albums exist with a link to upload.

### Verification
- Navigate from the Meetup Detail page to the Collections gallery.
- Test sorting order tabs and check mobile/desktop responsive layout.

---

## 4C. Social Credits & Album Upload Form (Using Previous Form Patterns)

### Objective
Create the social credit handle inputs and assemble the complete Album Upload form wired to `useCreateAlbum()`, following the exact patterns, primitives, and styling of existing forms (`MeetupForm`, `FreebieForm`).

### Proposed Changes
1. **Component [`frontend/src/features/meetups/components/collections/SocialLinksField.tsx`](file:///Users/koszy/Desktop/Black%20Hole/programming/projects/conmeet.moe/frontend/src/features/meetups/components/collections/SocialLinksField.tsx)**:
   - Clean inputs for Instagram (`@handle`), X / Twitter (`@handle`), TikTok (`@handle`), Bluesky (`@handle`), and Website / Portfolio (`https://...`).
   - Standardized using [`TextInput`](file:///Users/koszy/Desktop/Black%20Hole/programming/projects/conmeet.moe/frontend/src/shared/components/ui/primitives/TextInput.tsx).
   - Wrapped in a neobrutalist section box matching `MeetupForm`'s sections (`border-ink border-2 bg-zinc-50/70 p-3.5 shadow-[3px_3px_0_var(--ink)] sm:p-5 dark:bg-zinc-950/60`).
2. **Route**: [`frontend/src/app/(app)/conventions/[slug]/meetups/[id]/collections/new/page.tsx`](file:///Users/koszy/Desktop/Black%20Hole/programming/projects/conmeet.moe/frontend/src/app/(app)/conventions/[slug]/meetups/[id]/collections/new/page.tsx)
   - Protected with `<RequireAuth>`.
   - Max width container matching `NewMeetupPage` (`mx-auto max-w-3xl px-4 py-8 sm:px-6`).
3. **Component [`frontend/src/features/meetups/components/collections/AlbumUploadForm.tsx`](file:///Users/koszy/Desktop/Black%20Hole/programming/projects/conmeet.moe/frontend/src/features/meetups/components/collections/AlbumUploadForm.tsx)**:
   - Header with `BackLink` to `/conventions/[slug]/meetups/[id]/collections`.
   - Card container matching `MeetupForm` (`border-ink space-y-6 border-2 bg-white p-6 shadow-[6px_6px_0_var(--ink)] sm:p-8 dark:bg-zinc-900`).
   - **Album Title**: Required [`TextInput`](file:///Users/koszy/Desktop/Black%20Hole/programming/projects/conmeet.moe/frontend/src/shared/components/ui/primitives/TextInput.tsx) with [`CharCounter`](file:///Users/koszy/Desktop/Black%20Hole/programming/projects/conmeet.moe/frontend/src/shared/components/ui/primitives/CharCounter.tsx) (max 120), clear button, and validation.
   - **Description**: Optional [`TextArea`](file:///Users/koszy/Desktop/Black%20Hole/programming/projects/conmeet.moe/frontend/src/shared/components/ui/primitives/TextArea.tsx) with [`CharCounter`](file:///Users/koszy/Desktop/Black%20Hole/programming/projects/conmeet.moe/frontend/src/shared/components/ui/primitives/CharCounter.tsx) (max 1000).
   - **Social Credits**: `SocialLinksField`.
   - **Photos Input**: Initial multi-file image selector accepting multiple images (up to 30), validating that at least 1 image is selected, with selected file count and preview list.
   - **Form Actions**: [`FormActions`](file:///Users/koszy/Desktop/Black%20Hole/programming/projects/conmeet.moe/frontend/src/shared/components/ui/actions/FormActions.tsx) with `CONBLOCK_PRIMARY` submit button ("Publish Album" / "Publish"), cancel link, and loading state.
   - **Submission**: Prepares `FormData` and executes `useCreateAlbum(meetupId)`, redirecting to `/conventions/[slug]/meetups/[id]/collections` on success.
4. **Re-export**: Export `AlbumUploadForm` and `SocialLinksField` from [`frontend/src/features/meetups/components/collections/index.ts`](file:///Users/koszy/Desktop/Black%20Hole/programming/projects/conmeet.moe/frontend/src/features/meetups/components/collections/index.ts) and [`frontend/src/features/meetups/index.ts`](file:///Users/koszy/Desktop/Black%20Hole/programming/projects/conmeet.moe/frontend/src/features/meetups/index.ts).

### Verification
- Navigate to `/conventions/[slug]/meetups/[id]/collections/new`.
- Verify form validates empty title and empty photos.
- Fill out title, description, social handles, and select photos.
- Submit and verify album is created in the database and visible in the collections gallery.

---

## 4D. Multi-Photo Dropzone, Thumbnail Grid & Client-Side Compression

### Objective
Upgrade the photo selection area into an interactive drag-and-drop file picker with a rich thumbnail preview grid, individual remove buttons, and automatic client-side WebP downscaling.

### Proposed Changes
1. **Component [`frontend/src/features/meetups/components/collections/PhotoUploadDropzone.tsx`](file:///Users/koszy/Desktop/Black%20Hole/programming/projects/conmeet.moe/frontend/src/features/meetups/components/collections/PhotoUploadDropzone.tsx)**:
   - Drag-and-drop dropzone + file browser accepting images (`image/jpeg`, `image/png`, `image/webp`).
   - Live counter indicator showing `N / 30 photos`.
   - Thumbnail preview grid with remove (`X`) buttons on each photo and cover photo badge on the 1st photo.
   - Client-side WebP compression: scales large photos (e.g. 15MB DSLR raw) to max 2048px in browser before uploading to prevent mobile memory crashes.
2. **Integration into `AlbumUploadForm.tsx`**:
   - Replace the standard file input with `PhotoUploadDropzone`.

### Verification
- Drag and drop multiple photos into the zone.
- Verify thumbnail previews render and remove buttons work.
- Test large image downscaling before upload.
