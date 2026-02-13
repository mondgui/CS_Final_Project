# Capstone 15-Minute Presentation – Content to Paste into Your PowerPoint

Use this with your template: **Capstone_Project_15_Min_presentation.pptx**

Copy each section below into the matching slide. Replace the template placeholders with the text under each slide.

---

## Slide 1 – Title

**Replace "Capstone Project Title" with:**
- **MusicOnTheGo: A Mobile Platform for Connecting Music Teachers with Nearby Students**

**Replace "Presented by: Team Members" with:**
- **Presented by:** Guimond Pierre Louis

**Replace "Under the guidance of Supervisor Name" with:**
- **Under the guidance of:** Swapnil Saurav

**Replace "BSc CS (Academic Year)" with:**
- **BSc Computer Science (Online Mode) – BITS Pilani (2026)**

---

## Slide 2 – Problem Statement

**Title:** Problem Statement

**Bullets (replace template text):**
- **Background:** Finding qualified music teachers is difficult; students rely on word-of-mouth, classifieds, or music schools with limited availability.
- **Gap:** No streamlined platform to connect independent teachers with students (discovery, communication, scheduling, progress tracking).
- **Importance:** Growing demand for personalized music education; smartphones and on-demand services make a dedicated app both feasible and valuable for teachers (visibility, scheduling) and students (discovery, practice tracking, community).

---

## Slide 3 – Objectives & Scope

**Title:** Objectives & Scope

**Objectives:**
- Develop a cross-platform mobile app (React Native/Expo) with role-specific experiences for students and teachers.
- Implement secure auth (JWT, bcrypt, password reset via email).
- Enable real-time messaging (Supabase Realtime + Socket.io for notifications).
- Build a booking system with availability, approval/rejection, and conflict handling.
- Create practice logging with gamification (streaks, badges).
- Enable resource sharing (teachers upload/assign PDFs, videos, links).
- Build a community feed (posts, likes, comments).
- Deploy to production (Google Play Store, cloud backend).

**Scope:**
- In scope: Mobile app (student + teacher), backend API, admin panel, deployment.
- Out of scope: Payment processing (future), video calling (future).

---

## Slide 4 – Existing System / Literature Review

**Title:** Existing System / Literature Review

**Bullets:**
- **Existing approaches:** General tutoring/marketplace apps; music-school portals; classifieds and social media for finding teachers.
- **Limitations:** No single platform for discovery + booking + messaging + practice tracking; little focus on music education and teacher–student workflow.

---

## Slide 5 – Proposed System Architecture

**Title:** Proposed System Architecture

**Bullets:**
- **System overview:** (1) Mobile app (Expo/React Native) – student and teacher UIs; (2) Backend API (Node.js/Express) – REST + Socket.io; (3) PostgreSQL (Prisma) + Supabase Realtime; (4) Admin panel (React); (5) Cloudinary for media; Render for backend.
- **Architecture diagram:** Use a simple diagram: Mobile App ↔ Backend API ↔ Database; Backend ↔ Cloudinary, Supabase, Socket.io.
- **Modules:** Auth, Teacher discovery & profiles, Availability & bookings, Messaging (HTTP + Realtime), Resources & assignments, Practice tracking & gamification, Community feed, Admin dashboard.

---

## Slide 6 – Tools & Technologies

**Title:** Tools & Technologies

**Bullets:**
- **Programming language:** JavaScript/TypeScript (frontend and backend).
- **Frameworks:** React Native (Expo), Express.js, React (admin panel).
- **Database:** PostgreSQL with Prisma ORM; Supabase for Realtime.
- **Tools:** Socket.io (real-time), Cloudinary (media), JWT (auth), EAS (builds), Render (hosting).

---

## Slide 7 – Implementation / Demo

**Title:** Implementation / Demo

**Bullets:**
- **Feature 1:** Teacher discovery and booking – search teachers, view availability, request lesson, teacher approves/rejects; real-time updates via Socket.io.
- **Feature 2:** Real-time messaging – chat between student and teacher; typing indicators; unread counts; Supabase Realtime.
- **Screenshots / flow:** Use app screenshots: student dashboard, teacher profile, booking flow, chat screen, practice log, community feed (from your report or device).

---

## Slide 8 – Results & Analysis

**Title:** Results & Analysis

**Bullets:**
- **Output:** Working app on Google Play (closed testing); backend on Render; admin panel; real-time chat and booking notifications.
- **Performance:** REST API response times; real-time message delivery; practice stats and streaks computed correctly.
- **Comparison:** Before: fragmented discovery and scheduling; After: single app for discovery, booking, messaging, practice tracking, and community.

---

## Slide 9 – Challenges & Limitations

**Title:** Challenges & Limitations

**Bullets:**
- **Technical challenges:** Coordinating Supabase Realtime with Socket.io; ensuring production app uses correct API URL (EAS env); Cloudinary and env vars on hosted backend.
- **Limitations:** No in-app payments yet; no video calling; admin panel is separate web app.

---

## Slide 10 – Conclusion & Future Work

**Title:** Conclusion & Future Work

**Conclusion:**
- MusicOnTheGo delivers a full-stack mobile platform connecting music teachers and students with discovery, booking, messaging, practice tracking, and community. It demonstrates RESTful API design, role-based access, real-time communication, and cloud deployment.

**Future work:**
- In-app payments; video lesson integration; richer recommendations; rate limiting and monitoring; offline support for practice logging.

---

## Tips for the 15-minute presentation

- **Slides 1–2:** ~1–2 min (title + problem).
- **Slides 3–4:** ~2 min (objectives, scope, literature).
- **Slides 5–6:** ~2–3 min (architecture, tech stack).
- **Slide 7:** ~3–4 min (demo + screenshots).
- **Slides 8–10:** ~2–3 min (results, challenges, conclusion).

If you tell me your exact time limit and which parts you want to stress (e.g. demo vs architecture), I can shorten or expand bullets and suggest talking points.
