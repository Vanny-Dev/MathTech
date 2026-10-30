# Lessons and activities

Teachers open **Lessons & Activities** in the sidebar to add or edit content.
Save the lesson first, then add practice or graded questions. Up/down controls
save question order immediately. The lesson preview uses the student discussion
and worked-example components.

New lessons always start unpublished with no release date. In **Schedule**,
**Publish & schedule** publishes the topic with a future opening date; **Publish
& open now** publishes it immediately. Clearing the date locks access again.
Published topics and their questions use the existing student pages, grading,
progress, feedback and teacher monitoring.

## Existing data

No reset or destructive migration is needed. Content edits retain lesson and
question IDs. They do not reset student accounts, scores, attempts, progress,
reflections or completed activities. A student who already completed an activity
keeps that record; a perfect attempt still closes that lesson's graded set.
Create a new lesson to assign a new assessment to everyone.

Each new submission stores a snapshot of its questions. Before editing an older
question, its original content is added to legacy answers that do not yet have
snapshots. This preserves the original question, correct answer, explanation and
points in historical feedback, without changing scores or timestamps.
Questions referenced by submissions cannot be deleted. Startup seeding never
replaces existing question sets or overrides teacher edits; seeded lessons get
a stable key so renaming them does not create duplicates after restart.

## API contract

All routes require a bearer token. Content writes require the `teacher` role
(401 without authentication, 403 for students). Invalid content returns 400;
missing resources return 404. Fields not listed for authoring are ignored.

| Route | Behavior |
| --- | --- |
| `GET /api/modules` | Teachers see all topics; students see published topics only. |
| `GET /api/modules/:id` | Full content for teachers; students require published and released content. |
| `POST /api/modules` | Create an unpublished lesson; `title` is required. |
| `PUT /api/modules/:id` | Update provided lesson fields, preserving availability and identity. |
| `PUT /api/modules/:id/release` | `{releaseDate: ISO-date}` publishes and schedules; `null` clears the date and locks content. |
| `GET /api/activities?moduleId=...&isPractice=true` | Ordered questions, optionally filtered by category; only teachers receive correct answers and explanations. |
| `POST /api/activities` | Create a question assigned to an existing lesson. |
| `PUT /api/activities/:id` | Update question fields; lesson assignment and identity stay unchanged. |
| `PUT /api/activities/reorder` | `{moduleId, activityIds}` must contain every question ID in that lesson exactly once, in desired order. |
| `DELETE /api/activities/:id` | Delete an unused question; 409 if any submission references it. |
| `POST /api/activities/submit` | Existing grading flow; rejects duplicate, foreign-lesson, wrong-category or incomplete graded answer sets. |

Lesson fields: `title`, `subject`, `gradeLevel`, `quarter`, `week`,
`topicNumber`, `objectives`, `competencies`, `discussion`, `concepts`,
`examples`, `references`, `developer`. List fields contain strings. Examples
contain `title`, `content` and optional `image`. Week/topic are nonnegative
integers. Discussion is HTML, sanitized on save; `<h3>` starts a comic panel,
and `<p><strong>Teacher:</strong> ...</p>` creates dialogue.

Question fields: `moduleId` on creation, `type` (`multiple_choice`, `true_false`,
`fill_blank`), nonempty `question`, `choices`, `correctAnswer`, `explanation`,
positive `points`, boolean `isPractice`, nonnegative integer `order`.
Multiple choice requires at least two distinct choices and an answer matching
one choice. True/false accepts booleans or the strings `true` / `false`.

## Verification

Run `npm run test:content` in `backend` and `npm run build` in `frontend`.
The integration suite starts a temporary MongoDB 7.0.14 instance and uses real
Express routes, authentication, Mongoose persistence and grading. It never
loads `.env` or connects to the app database. The first run downloads a MongoDB
test binary. No running production database or credentials are needed.
