
# CyberLawyerHub — Full-Stack Implementation Plan

## Overview
A dark-themed, mobile-first cyber fraud lawyer platform for India with two core features: free FIR PDF generation and paid lawyer consultations. Built with Supabase (auth, database, storage) and Stripe (payments).

---

## Phase 1: Foundation & Landing Page

### Design System
- Dark professional theme: slate-900 background, slate-800/50 cards with backdrop-blur
- Cyan (#22D3EE) and blue (#3B82F6) gradient accents
- Inter font, large rounded gradient buttons, mobile-first responsive layout

### Landing Page (/)
- Hero section: "Cyber Fraud? Get FIR + Lawyer in 5 Minutes"
- Two prominent CTAs: "Generate FIR Free" and "Find a Lawyer"
- Trust indicators: "10K+ FIRs Generated" | "250+ Verified Lawyers"
- Brief "How It Works" section and India-focused helpline info (1930, cybercrime.gov.in)

---

## Phase 2: FIR PDF Generator (Free for All)

### 5-Step Form (/fir-report)
Works for guests AND logged-in users, with a progress bar:
1. **Incident Type** — Dropdown: UPI Fraud, Phishing, Banking Fraud, Investment Scam, Aadhaar Fraud
2. **Details** — Amount lost (₹), date, transaction ID, bank name
3. **Evidence** — Optional screenshot upload
4. **Contact Info** — Phone/WhatsApp (+91 formatted)
5. **Summary & Download** — Preview with severity indicator (Low/Medium/High based on amount), download PDF button

### PDF Content (client-side via jsPDF)
- Victim details, incident summary, amount & transaction info
- Cybercrime.gov.in link, state-wise Cyber Crime Cell contacts
- 1930 helpline number, RBI complaint process
- "Need Lawyer Help?" CTA linking to /lawyers

---

## Phase 3: Authentication

### Supabase Auth Setup
- Email/password + Google OAuth sign-in
- Phone number collected as profile field (+91 format)

### Two User Types
- **User Signup**: Email, phone, password, Google OAuth
- **Lawyer Signup**: Email, phone, password, Bar Council ID, profile photo upload, hourly rate (₹500–₹4000)

### Pages
- **/login** — Email/phone + password + Google button, link to signup
- **/signup** — Toggle between "User" and "Lawyer" mode with appropriate fields

### Database
- `profiles` table (name, phone, role reference)
- `user_roles` table (user/lawyer roles, security definer function)
- `lawyers` table (bar_council_id, photo_url, hourly_rate, city, specializations, rating, review_count)
- Storage bucket for lawyer photos

---

## Phase 4: Lawyer Directory & Profiles

### Lawyer Directory (/lawyers)
- Search bar (by name or specialization)
- Filters: City (Delhi, Mumbai, Bangalore, Chennai, Hyderabad, Pune, Kolkata), Rate range (₹500–₹4000), Rating (4+)
- Responsive card grid showing: photo, name, rating/reviews, rate, specialization badges, "Book Now" button

### Lawyer Profile (/lawyers/[id])
- Full profile with bio, specializations, experience
- Available time slots calendar
- Reviews from past clients
- "Book Consultation" button

---

## Phase 5: Booking & Stripe Payments

### Booking Flow (3 Steps)
1. **Select Duration** — 30 min or 60 min (price auto-calculated with 25% platform fee)
2. **Pick Date/Time** — From lawyer's available slots
3. **Payment** — Stripe Checkout (e.g., 30 min at ₹1500/hr = ₹750 + ₹188 fee = ₹938 total)

### Post-Payment
- Booking confirmation page with details
- Email confirmation to both user and lawyer
- WhatsApp notification link

### Database
- `bookings` table (user_id, lawyer_id, duration, start_time, status, stripe_payment_id, platform_fee)
- `lawyer_availability` table (lawyer_id, date, time slots)

---

## Phase 6: Dashboards

### User Dashboard (/dashboard)
- Recent FIR reports (re-download PDFs)
- Upcoming consultations with lawyer details
- Payment history
- Quick action: "New FIR Report"

### Lawyer Dashboard (/lawyer/dashboard)
- Pending bookings (Accept/Reject actions)
- Monthly earnings summary (e.g., "₹24,500 this month")
- Calendar view of upcoming sessions
- Client reviews
- Manage availability slots

---

## Phase 7: FIR History & Polish

### Saved FIRs (for logged-in users)
- FIR reports saved to database when user is logged in
- Re-downloadable from dashboard
- Guest FIRs are generated but not persisted

### Final Polish
- Loading spinners on all async operations
- Error boundaries and toast notifications
- Mobile-optimized layouts for all pages
- India-specific formatting (₹ currency, +91 phone, city names)
