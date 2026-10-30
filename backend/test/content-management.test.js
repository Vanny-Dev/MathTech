import { before, after, test } from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import mongoose from 'mongoose';
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server-core';
import moduleRoutes from '../src/routes/moduleRoutes.js';
import activityRoutes from '../src/routes/activityRoutes.js';
import feedbackRoutes from '../src/routes/feedbackRoutes.js';
import teacherRoutes from '../src/routes/teacherRoutes.js';
import { errorHandler } from '../src/middleware/errorHandler.js';
import User from '../src/models/User.js';
import Module from '../src/models/Module.js';
import Activity from '../src/models/Activity.js';
import Submission from '../src/models/Submission.js';
import Progress from '../src/models/Progress.js';
import generateToken from '../src/utils/generateToken.js';
import { seedModuleWithActivities } from '../src/config/seedHelper.js';

let mongo, teacher, student, student2, studentId;
const app = express();
app.use(express.json());
app.use('/api/modules', moduleRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/teacher', teacherRoutes);
app.use(errorHandler);
const call = (method, url, token, data) => request(app)[method](url).set('Authorization', `Bearer ${token}`).send(data);
const lesson = async (title) => (await call('post', '/api/modules', teacher, { title })).body;
const question = async (moduleId, data = {}) => {
  const response = await call('post', '/api/activities', teacher, { moduleId, type: 'fill_blank', question: '2 + 2?', correctAnswer: '4', points: 3, ...data });
  assert.equal(response.status, 201, JSON.stringify(response.body));
  return response.body;
};
const publish = (id, date = new Date().toISOString()) => call('put', `/api/modules/${id}/release`, teacher, { releaseDate: date });

before(async () => {
  // Never reads a project .env or connects to the application's database.
  process.env.JWT_SECRET = 'content-tests-only';
  mongo = await MongoMemoryServer.create({ binary: { version: '7.0.14' } });
  await mongoose.connect(mongo.getUri());
  const users = await User.create([
    { username: 'teacher', fullname: 'Teacher', role: 'teacher', password: 'test-only' },
    { username: 'student', role: 'student' },
    { username: 'student2', role: 'student' },
  ]);
  [teacher, student, student2] = users.map(user => generateToken(user._id));
  studentId = users[1]._id;
});
after(async () => { await mongoose.disconnect(); await mongo?.stop(); });

test('authoring is teacher-only and draft content is inaccessible to students', async () => {
  assert.equal((await request(app).post('/api/modules').send({ title: 'Private' })).status, 401);
  assert.equal((await call('post', '/api/modules', student, { title: 'Forbidden' })).status, 403);
  const draftResponse = await call('post', '/api/modules', teacher, { title: 'Draft', isPublished: true, releaseDate: new Date().toISOString() });
  assert.equal(draftResponse.status, 201);
  const draft = draftResponse.body;
  assert.equal(draft.isPublished, false);
  assert.equal(draft.releaseDate, null);
  assert.equal((await call('get', `/api/modules/${draft._id}`, student)).status, 403);
  assert.ok(!(await call('get', '/api/modules', student)).body.some(item => item._id === draft._id));
  await question(draft._id);
  assert.equal((await call('get', `/api/activities?moduleId=${draft._id}`, student)).status, 403);
  assert.equal((await call('post', '/api/activities', student, {})).status, 403);
  assert.equal((await call('put', '/api/activities/reorder', student, {})).status, 403);
  assert.equal((await call('put', `/api/modules/${draft._id}/release`, student, { releaseDate: null })).status, 403);
});

test('lesson fields round trip and schedule publishing enforces release time', async () => {
  const module = await lesson('Scheduled');
  const fields = { title: 'Future lesson', objectives: ['Understand'], competencies: ['Calculate'], discussion: '<h3>Panel 1 — Hello</h3><p style="text-align:center" onclick="alert(1)">Lesson</p><script>alert(1)</script>', concepts: ['A concept'], examples: [{ title: 'Example', content: 'Step 1: calculate\nAnswer: 4', image: '' }], references: ['Textbook'], week: 3, topicNumber: 5 };
  const saved = await call('put', `/api/modules/${module._id}`, teacher, fields);
  assert.equal(saved.status, 200);
  assert.deepEqual(saved.body.objectives, fields.objectives);
  assert.deepEqual(saved.body.references, fields.references);
  assert.ok(!saved.body.discussion.includes('<script>'));
  assert.ok(saved.body.discussion.includes('<h3>'));
  assert.ok(saved.body.discussion.includes('text-align:center'));
  assert.ok(!saved.body.discussion.includes('onclick'));
  assert.equal((await publish(module._id, new Date(Date.now() + 3600000).toISOString())).body.isPublished, true);
  assert.equal((await call('get', `/api/modules/${module._id}/lesson`, student)).status, 423);
  await publish(module._id);
  assert.equal((await call('get', `/api/modules/${module._id}/lesson`, student)).status, 200);
  await publish(module._id, null);
  assert.equal((await call('get', `/api/modules/${module._id}`, student)).status, 423);
});

test('all question formats grade with configured points, track progress and appear in monitoring', async () => {
  const module = await lesson('Formats');
  const mc = await question(module._id, { type: 'multiple_choice', choices: ['3', '4'], correctAnswer: '4', points: 2 });
  const tf = await question(module._id, { type: 'true_false', correctAnswer: false, points: 4 });
  const blank = await question(module._id, { points: 5 });
  const practice = await question(module._id, { isPractice: true });
  await publish(module._id);
  const teacherList = (await call('get', `/api/activities?moduleId=${module._id}`, teacher)).body;
  assert.equal(teacherList.find(item => item._id === tf._id).correctAnswer, false);
  const studentList = (await call('get', `/api/activities?moduleId=${module._id}&isPractice=false`, student)).body;
  assert.equal(studentList.length, 3);
  assert.ok(studentList.every(item => !('correctAnswer' in item) && !('explanation' in item)));
  const payload = { moduleId: module._id, isPractice: false, answers: [mc, tf, blank].map(item => ({ activityId: item._id, givenAnswer: item.correctAnswer })) };
  const result = await call('post', '/api/activities/submit', student, payload);
  assert.equal(result.status, 201, JSON.stringify(result.body));
  assert.equal(result.body.totalScore, 11);
  assert.equal(result.body.maxScore, 11);
  assert.equal(result.body.percentage, 100);
  const progress = await Progress.findOne({ userId: studentId, moduleId: module._id });
  assert.equal(progress.attempts, 1);
  assert.equal(progress.completedSections.activities, true);
  const monitor = (await call('get', `/api/teacher/monitor/${module._id}`, teacher)).body.find(row => row.student._id === String(studentId));
  assert.equal(monitor.status, 'completed');
  assert.equal(monitor.latestScore, 100);
  const reorder = [practice, blank, tf, mc].map(item => item._id);
  assert.equal((await call('put', '/api/activities/reorder', teacher, { moduleId: module._id, activityIds: reorder })).status, 200);
  assert.deepEqual((await call('get', `/api/activities?moduleId=${module._id}`, teacher)).body.map(item => item._id), reorder);
  assert.equal((await call('put', '/api/activities/reorder', teacher, { moduleId: module._id, activityIds: [mc._id, mc._id] })).status, 400);
  const foreign = await question((await lesson('Other'))._id);
  for (const answers of [[{ activityId: foreign._id, givenAnswer: '4' }], [{ activityId: practice._id, givenAnswer: '4' }], [payload.answers[0], payload.answers[0]], [payload.answers[0]]]) {
    assert.equal((await call('post', '/api/activities/submit', student2, { ...payload, answers })).status, 400);
  }
  const practiceResult = await call('post', '/api/activities/submit', student2, { moduleId: module._id, isPractice: true, answers: [{ activityId: practice._id, givenAnswer: '4' }] });
  assert.equal(practiceResult.status, 201);
  assert.equal((await call('put', `/api/activities/${mc._id}`, teacher, { points: 10, explanation: 'Updated explanation', correctAnswer: '3' })).status, 200);
  const historical = (await call('get', `/api/feedback/${result.body.submissionId}/answers`, student)).body.find(item => item.activityId === mc._id);
  assert.equal(historical.correctAnswer, '4');
  assert.equal(historical.points, 2);
  assert.equal(historical.isCorrect, true);
});

test('invalid authoring input is rejected without creating records', async () => {
  assert.equal((await call('post', '/api/modules', teacher, { title: '  ' })).status, 400);
  const module = await lesson('Validation');
  for (const data of [
    { type: 'unknown' }, { points: -1 }, { correctAnswer: '' },
    { type: 'multiple_choice', choices: ['4', '4'], correctAnswer: '4' },
    { type: 'multiple_choice', choices: ['1', '2'], correctAnswer: '4' },
    { type: 'true_false', correctAnswer: 'maybe' },
  ]) {
    const result = await call('post', '/api/activities', teacher, { moduleId: module._id, question: 'Test', type: 'fill_blank', correctAnswer: '4', ...data });
    assert.equal(result.status, 400, JSON.stringify(result.body));
  }
  assert.equal(await Activity.countDocuments({ moduleId: module._id }), 0);
});

test('editing content preserves legacy scores, completion and original feedback through reseeding', async () => {
  const module = await Module.create({ title: 'Original seeded title', isPublished: true, releaseDate: new Date(), week: 1, topicNumber: 1 });
  const original = await question(module._id, { explanation: 'Original explanation' });
  // Simulate an old submission from before this feature, without a snapshot.
  const old = await Submission.create({ userId: studentId, moduleId: module._id, answers: [{ activityId: original._id, givenAnswer: '4', isCorrect: true, pointsEarned: 3 }], totalScore: 3, maxScore: 3, percentage: 100, attempt: 1 });
  const progress = await Progress.create({ userId: studentId, moduleId: module._id, attempts: 1, completedSections: { activities: true } });
  const progressBefore = JSON.parse(JSON.stringify(progress.toObject()));
  const seed = { label: 'Legacy seed', moduleData: { title: module.title, week: 1, topicNumber: 1 }, practiceActivities: [], gradedActivities: [] };
  await seedModuleWithActivities(seed); // Even a mismatched seed count must preserve activity ids.
  assert.ok(await Activity.findById(original._id));
  assert.equal((await call('put', `/api/modules/${module._id}`, teacher, { title: 'Renamed lesson', week: 7 })).status, 200);
  assert.equal((await call('put', `/api/activities/${original._id}`, teacher, { question: 'New question', correctAnswer: '9', points: 9, explanation: 'New explanation' })).status, 200);
  await question(module._id); // Adding questions must not reset a completed student.
  await seedModuleWithActivities(seed);
  assert.equal(await Module.countDocuments({ seedKey: 'Legacy seed' }), 1);
  assert.equal((await Module.findById(module._id)).title, 'Renamed lesson');
  assert.equal((await Module.findById(module._id)).week, 7);
  assert.equal(await Activity.countDocuments({ moduleId: module._id }), 2);
  const stored = await Submission.findById(old._id);
  assert.equal(stored.totalScore, 3);
  assert.equal(stored.maxScore, 3);
  assert.equal(stored.percentage, 100);
  assert.equal(stored.attempt, 1);
  assert.equal(stored.updatedAt.toISOString(), old.updatedAt.toISOString());
  assert.deepEqual(JSON.parse(JSON.stringify((await Progress.findById(progress._id)).toObject())), progressBefore);
  const feedback = (await call('get', `/api/feedback/${old._id}/answers`, student)).body[0];
  assert.equal(feedback.question, original.question);
  assert.equal(feedback.correctAnswer, '4');
  assert.equal(feedback.explanation, 'Original explanation');
  assert.equal(feedback.points, 3);
  assert.equal((await call('delete', `/api/activities/${original._id}`, teacher)).status, 409);
  const latest = await call('get', `/api/feedback/latest/${module._id}`, student);
  assert.equal(latest.body.locked, true);
  assert.equal(latest.body.attempts, 1);
  const monitor = (await call('get', `/api/teacher/monitor/${module._id}`, teacher)).body.find(row => row.student._id === String(studentId));
  assert.equal(monitor.status, 'completed');
  assert.equal(monitor.bestScore, 100);
});
