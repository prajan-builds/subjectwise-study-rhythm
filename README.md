# Subjectwise Study Rhythm

Build a polished, mobile-first student productivity web app called StudyOS. It is for a Tamil Nadu Class 12 student but must be reusable for college later. Create a functional MVP, not just a static mockup. Use a calm, modern, minimal dashboard with excellent mobile responsiveness, clear typography, light/dark mode, accessible controls, and a simple bottom navigation on mobile / sidebar on desktop.

Core sections and functionality:
1) Dashboard: today's date, greeting, today's study plan, tasks due today, upcoming deadlines, syllabus completion overview, subject progress cards, weekly study-time summary, and quick-add actions.
2) To-do manager: create/edit/delete tasks; title, subject, due date/time, priority, estimated duration, notes, repeat option; mark complete; filters for today/upcoming/overdue/completed and subject; progress counts.
3) Syllabus tracker: subjects and chapters/topics; status not started / in progress / completed; progress percentage per subject and overall; optional confidence rating and last-revised date; add/edit/reorder chapters; support subtopics.
4) Deadline & exam planner: assignments, practicals, tests, project deadlines, board exams; calendar and list views; reminders configurable in advance; overdue state; recurring reminders where practical. Use browser notifications only after permission is granted and clearly explain notification limitations. Also show in-app reminders.
5) Timetable: weekly schedule with editable study blocks and school/tuition/personal commitments; avoid hardcoding unavailable schedule assumptions.
6) Study sessions: focus timer with configurable durations, break timer, subject/task association, session history, daily/weekly study time totals.
7) Revision planner: mark chapters for revision, set next revision date, show due revisions and quick completion.
8) Analytics: study time by day/subject, tasks completed, syllabus progress over time, simple charts and encouraging neutral insights.
9) Settings: edit subjects, theme, notification preferences, export/import data (JSON), and reset with confirmation.

Seed the six subjects Tamil, English, Mathematics, Physics, Chemistry, Computer Science, but let the student rename/add/remove subjects. Do not invent chapter lists; provide editable empty chapter lists and a clear add-chapter flow. Add a sample task or two only if clearly labeled as examples and easy to remove.

Implementation requirements: make all primary interactions work; persist data locally across refreshes using a reliable browser storage approach; provide useful empty states, validation, confirmation for destructive actions, and sensible date handling in Asia/Kolkata. Do not require sign-in or paid APIs for the MVP. Do not claim background notifications will work when the browser is closed; explain browser support/permission constraints. Keep the architecture ready for optional cloud sync later, but do not add authentication or external services now. Avoid unnecessary animations and heavy assets. Build the complete app shell and functional core flows first.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/6e807e71-2659-4e0a-a5be-eabba2da64a3).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
