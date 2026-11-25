# StudyOS design and secure cloud sync

## Confirmed direction
- Clean neutral light/dark appearance inspired by Notion and Linear, with generous whitespace, compact items and no decorative effects.
- Visible theme toggle on phone and desktop; remember the selection.
- Keep all StudyOS sections and six editable starter subjects.

## Accounts and storage
Lovable Cloud is connected. Add email/password signup and signin, confirmation-email states, forgotten-password emails, and a public password-reset page. Protect private pages and offer sign-out.

**Required decision:** Do you need user profile data, such as a display name, avatar, or preferences? Account implementation will wait for your answer. If yes, create a private profile automatically on signup; if no, use built-in accounts without a separate profile table. Existing study settings remain part of your private study data.

## Safe migration and sync
- Leave existing device data intact as a recoverable backup.
- After signin, offer an explicit import of existing device data. Never automatically overwrite an existing cloud workspace.
- Store all study modules under the signed-in owner, with owner-only access enforced by database policies.
- Preserve local pending changes per account during connection failures and clearly distinguish “Pending sync”, “Offline”, “Sync failed” and verified cloud saves.
- Detect conflicting changes from another device rather than silently replacing them; offer a recoverable choice.
- Refresh cloud data on reconnect and when returning to the app, without discarding pending edits.

## Usable app
Make the existing module pages usable for their core workflows: tasks, chapters and editable subjects, deadlines, weekly study blocks, focus sessions, revision scheduling, study summaries and settings. Include loading, error, retry and empty states.

## Verification
Test signin, creating and reading real saved study data, access isolation between accounts, migration safety, offline recovery, theme persistence and phone/desktop layouts. Email delivery and a second physical device will be marked unverified unless actually exercised.

## Technical details
- Retain TanStack Start and the supported generated Cloud client and authentication gate.
- Use database migrations with explicit grants and owner-scoped row-level policies; no privileged browser credentials.
- Use a versioned owner workspace with optimistic concurrency to preserve the existing serializable study model safely.
- Keep any profile table separate from study data, based on the required profile decision.