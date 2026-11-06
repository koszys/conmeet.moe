# Implementation Plan: Meetups & Photo Collections System

## Branch Name
```bash
git checkout -b feature/meetups-and-collections
```

---

## Commit Stopping Points

### Milestone 1: Meetups Backend API & Core Models
- **Commit 1.1**: `feat(meetups): add Meetup serializers, views, and convention router endpoints`
- **Commit 1.2**: `feat(meetups): implement meetup save and going toggle actions`
- **Commit 1.3**: `test(meetups): add test suite for meetup CRUD, saves, and rsvp status`

### Milestone 2: Meetups Frontend UI
- **Commit 2.1**: `feat(meetups): add react-query hooks and api methods for meetups`
- **Commit 2.2**: `feat(meetups): implement convention meetup list and date/filter view`
- **Commit 2.3**: `feat(meetups): implement host meetup form with official/community toggle`
- **Commit 2.4**: `feat(meetups): implement dedicated meetup detail page with save/going buttons`
- **Commit 2.5**: `feat(navigation): connect meetups in convention sidebar and overview cards`

### Milestone 3: Photo Collections & Social Credits Backend
- **Commit 3.1**: `feat(collections): add MeetupAlbum, MeetupPhoto, and like/favorite models with migrations`
- **Commit 3.2**: `feat(collections): implement album list, create, detail, update, and delete endpoints`
- **Commit 3.3**: `feat(collections): implement album and photo like/favorite toggle endpoints`
- **Commit 3.4**: `feat(admin): register meetup albums and photos with unfold django admin`
- **Commit 3.5**: `test(collections): add backend test suite for album creation, photo limits, and social credits`

### Milestone 4: Photo Collections Frontend UI & In-Browser Download Engine
- **Commit 4.1**: `feat(collections): add client-side image compression and upload helpers`
- **Commit 4.2**: `feat(collections): implement meetup collections gallery tab and album cards`
- **Commit 4.3**: `feat(collections): implement new album creation form with social links and multi-image dropzone`
- **Commit 4.4**: `feat(collections): implement album detail page with social credit badges and engagement actions`
- **Commit 4.5**: `feat(collections): implement photo lightbox with photo likes and single download`
- **Commit 4.6**: `feat(collections): implement multi-select mode and client-side zip download with JSZip`
- **Commit 4.7**: `feat(collections): implement album editing, photo management, and delete modal`

---

## Cost & Storage Strategy Summary
1. **Cloudflare R2**: Bandwidth/egress is **$0**. Views and downloads cost nothing.
2. **Public-Only Albums**: Do NOT allow private albums. Restricting to public community galleries ensures every byte serves convention attendees and prevents the platform from being abused as a private cloud dump.
3. **Client-Side WebP Compression**: Downscale camera photos to max 2048px and compress to WebP in the browser before upload (cuts file size by ~97% from 15MB to ~300KB).
4. **Client-Side ZIP Downloads**: Generate album ZIPs in the user's browser using `JSZip`, keeping server CPU and memory usage at zero.
