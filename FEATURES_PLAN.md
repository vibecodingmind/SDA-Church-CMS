# Church CMS – Feature Plan

Use this to track what's done and what to add. **Share your plan** or edit this file so we can implement it tomorrow.

---

## ✅ Implemented (Current)

### IAM Core
- [x] Login / Logout / JWT auth
- [x] Password reset (forgot-password flow)
- [x] User invites (by email, with role + scope)
- [x] Accept invite
- [x] Refresh tokens

### RBAC
- [x] Roles (CRUD)
- [x] Permissions (CRUD)
- [x] Role–Permission assignment
- [x] Scope-based access (church / district / conference)

### Organization
- [x] Conferences (CRUD)
- [x] Districts (CRUD)
- [x] Churches (CRUD)
- [x] Hierarchy: Conference → District → Church

### Members
- [x] Members (CRUD, scope-filtered by church)
- [x] Full name, email

### Users
- [x] Users list (scope-filtered)
- [x] Create user
- [x] Invite user
- [x] Update user
- [x] Delete user

### Audit
- [x] Audit logs (scope-filtered)
- [x] Query by resource, action

### Admin UI
- [x] Dashboard
- [x] Members
- [x] Users
- [x] Roles
- [x] Permissions
- [x] Organization
- [x] Audit

---

## 📋 Possible Additions (Church CMS)

### Member Management
- [x] Member profile (phone, address, birth date)
- [x] Member status (active, inactive, transferred, deceased)
- [x] Membership date
- [ ] Family / household grouping
- [ ] Ministry assignments (via Ministries)

### Tithes & Offerings
- [x] Record tithes/offerings
- [x] Categories (tithe, offering, special)
- [ ] Reports by period, church, member

### Events & Attendance
- [x] Events (services, meetings, programs)
- [x] Attendance tracking (record attendance per event)
- [ ] Check-in / check-out UI

### Ministries
- [x] Ministries (e.g. Youth, Music, Ushering)
- [x] Assign members to ministries (API)
- [ ] Ministry leaders UI

### Reports & Dashboard
- [ ] Member count by church/district/conference
- [ ] Growth trends
- [ ] Export (CSV, PDF)

### Settings & Profile
- [ ] User profile (change password, avatar)
- [ ] Church/district settings
- [ ] System settings (superadmin)

### Other
- [ ] Notifications
- [ ] Bulk import (members, users)
- [ ] Mobile-friendly / PWA

---

## Your Plan

**Add your priorities here** (or tell me tomorrow):

1. 
2. 
3. 

---

## Notes

- Start with one feature at a time
- API first, then Admin UI
- Keep RBAC and scope in mind for new features
