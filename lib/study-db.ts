import { MongoClient, Db, Collection, ObjectId, WithId } from 'mongodb';

// ═══════════════════════════════════════════════════════════════
// study-db.ts — MongoDB version (same API as SQLite version)
// ═══════════════════════════════════════════════════════════════

// MongoDB connection
const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME = process.env.MONGODB_DB || 'islam_site';

let client: MongoClient | null = null;
let db: Db | null = null;
let isConnected = false;

async function connect(): Promise<Db> {
  if (isConnected && db) return db;
  
  if (!client) {
    client = new MongoClient(MONGO_URI, {
      maxPoolSize: 10,
      minPoolSize: 1,
    });
    await client.connect();
    isConnected = true;
  }
  
  db = client.db(DB_NAME);
  
  // Create indexes
  await createIndexes();
  
  return db;
}

async function createIndexes() {
  if (!db) return;
  
  await db.collection('tasks').createIndex({ day: 1 });
  await db.collection('tasks').createIndex({ done: 1 });
  await db.collection('notes').createIndex({ created_at: -1 });
  await db.collection('sessions').createIndex({ date: 1 });
  await db.collection('links').createIndex({ created_at: -1 });
  await db.collection('habits').createIndex({ created_at: -1 });
  await db.collection('habit_logs').createIndex({ habit_id: 1, date: 1 }, { unique: true });
  await db.collection('goals').createIndex({ created_at: -1 });
  await db.collection('projects').createIndex({ goal_id: 1 });
  await db.collection('schedule_blocks').createIndex({ date: 1 });
  await db.collection('points_log').createIndex({ created_at: -1 });
  await db.collection('reminders').createIndex({ date: 1, time: 1 });
}

function toObjectId(id: number | string | ObjectId): ObjectId {
  if (id instanceof ObjectId) return id;
  return new ObjectId(String(id));
}

function fromMongoDoc<T>(doc: WithId<T>): T & { id: number } {
  const { _id, ...rest } = doc;
  return { ...rest, id: parseInt(_id.toString().slice(-8), 16) } as T & { id: number };
}

// ═══════════════════════════════════════════════════════════════
// Types (same as SQLite version)
// ═══════════════════════════════════════════════════════════════

export interface TaskRow {
  id: number;
  day: string;
  text: string;
  priority: 'low' | 'medium' | 'high';
  done: number;
  link: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  order_index: number;
  project_id: number | null;
  start_time: string | null;
  end_time: string | null;
  date: string | null;
  recurring: string;
  status: string;
  vacation: number;
}

export interface NoteRow {
  id: number;
  title: string;
  content: string;
  tags: string | null;
  created_at: string;
  updated_at: string;
}

export interface SessionRow {
  id: number;
  type: 'work' | 'break' | 'longBreak';
  duration_seconds: number;
  planned_seconds: number;
  task_id: number | null;
  date: string;
  created_at: string;
}

export interface LinkRow {
  id: number;
  name: string;
  url: string;
  description: string | null;
  tags: string | null;
  created_at: string;
}

export interface RewardRow {
  id: number;
  badges: string;
  points: number;
  level: number;
  streak_days: number;
  last_study_date: string | null;
  updated_at: string;
}

export interface SettingRow {
  key: string;
  value: string;
}

// ═══════════════════════════════════════════════════════════════
// Collections
// ═══════════════════════════════════════════════════════════════

function tasksCol() { return (connect() as Promise<Db>).then(d => d.collection('tasks')); }
function notesCol() { return (connect() as Promise<Db>).then(d => d.collection('notes')); }
function sessionsCol() { return (connect() as Promise<Db>).then(d => d.collection('sessions')); }
function linksCol() { return (connect() as Promise<Db>).then(d => d.collection('links')); }
function rewardsCol() { return (connect() as Promise<Db>).then(d => d.collection('rewards')); }
function settingsCol() { return (connect() as Promise<Db>).then(d => d.collection('settings')); }
function goalsCol() { return (connect() as Promise<Db>).then(d => d.collection('goals')); }
function projectsCol() { return (connect() as Promise<Db>).then(d => d.collection('projects')); }
function habitsCol() { return (connect() as Promise<Db>).then(d => d.collection('habits')); }
function habitLogsCol() { return (connect() as Promise<Db>).then(d => d.collection('habit_logs')); }
function scheduleBlocksCol() { return (connect() as Promise<Db>).then(d => d.collection('schedule_blocks')); }
function pointsLogCol() { return (connect() as Promise<Db>).then(d => d.collection('points_log')); }
function remindersCol() { return (connect() as Promise<Db>).then(d => d.collection('reminders')); }

// ═══════════════════════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════════════════════

function now(): string {
  return new Date().toISOString();
}

function toTask(doc: any): TaskRow {
  return {
    id: parseInt(doc._id.toString().slice(-8), 16),
    day: doc.day,
    text: doc.text,
    priority: doc.priority,
    done: doc.done,
    link: doc.link,
    notes: doc.notes,
    created_at: doc.created_at,
    updated_at: doc.updated_at,
    order_index: doc.order_index || 0,
    project_id: doc.project_id ? parseInt(doc.project_id.toString().slice(-8), 16) : null,
    start_time: doc.start_time,
    end_time: doc.end_time,
    date: doc.date,
    recurring: doc.recurring || 'none',
    status: doc.status || 'pending',
    vacation: doc.vacation || 0,
  };
}

function toNote(doc: any): NoteRow {
  return {
    id: parseInt(doc._id.toString().slice(-8), 16),
    title: doc.title,
    content: doc.content,
    tags: doc.tags,
    created_at: doc.created_at,
    updated_at: doc.updated_at,
  };
}

function toSession(doc: any): SessionRow {
  return {
    id: parseInt(doc._id.toString().slice(-8), 16),
    type: doc.type,
    duration_seconds: doc.duration_seconds,
    planned_seconds: doc.planned_seconds,
    task_id: doc.task_id ? parseInt(doc.task_id.toString().slice(-8), 16) : null,
    date: doc.date,
    created_at: doc.created_at,
  };
}

function toLink(doc: any): LinkRow {
  return {
    id: parseInt(doc._id.toString().slice(-8), 16),
    name: doc.name,
    url: doc.url,
    description: doc.description,
    tags: doc.tags,
    created_at: doc.created_at,
  };
}

function toReward(doc: any): RewardRow {
  return {
    id: parseInt(doc._id.toString().slice(-8), 16),
    badges: doc.badges,
    points: doc.points,
    level: doc.level,
    streak_days: doc.streak_days,
    last_study_date: doc.last_study_date,
    updated_at: doc.updated_at,
  };
}

// ═══════════════════════════════════════════════════════════════
// TASKS
// ═══════════════════════════════════════════════════════════════

export async function getTasks(): Promise<TaskRow[]> {
  const col = await tasksCol();
  const docs = await col.find({}).sort({ order_index: 1 }).toArray();
  return docs.map(toTask);
}

export async function getTasksByDay(day: string): Promise<TaskRow[]> {
  const col = await tasksCol();
  const docs = await col.find({ day }).sort({ order_index: 1 }).toArray();
  return docs.map(toTask);
}

export async function getTask(id: number): Promise<TaskRow | undefined> {
  const col = await tasksCol();
  const doc = await col.findOne({ _id: toObjectId(id) });
  return doc ? toTask(doc) : undefined;
}

export async function createTask(task: {
  day: string;
  text: string;
  priority: string;
  link?: string | null;
  notes?: string | null;
  project_id?: number | null;
  start_time?: string | null;
  end_time?: string | null;
  date?: string | null;
  recurring?: string | null;
  status?: string | null;
}): Promise<TaskRow> {
  const col = await tasksCol();
  const nowStr = now();
  const maxOrder = await col.find({ day: task.day }).sort({ order_index: -1 }).limit(1).toArray();
  const order_index = maxOrder.length > 0 ? (maxOrder[0].order_index || 0) + 1 : 0;

  const doc = {
    day: task.day,
    text: task.text,
    priority: task.priority,
    done: 0,
    link: task.link || null,
    notes: task.notes || null,
    created_at: nowStr,
    updated_at: nowStr,
    order_index,
    project_id: task.project_id ? toObjectId(task.project_id) : null,
    start_time: task.start_time || null,
    end_time: task.end_time || null,
    date: task.date || null,
    recurring: task.recurring || 'none',
    status: task.status || 'pending',
    vacation: 0,
  };

  const result = await col.insertOne(doc);
  return toTask({ ...doc, _id: result.insertedId });
}

export async function updateTask(id: number, patch: Partial<TaskRow>): Promise<TaskRow | undefined> {
  const col = await tasksCol();
  const { id: _id, created_at, ...updateData } = patch;
  
  const result = await col.findOneAndUpdate(
    { _id: toObjectId(id) },
    { $set: { ...updateData, updated_at: now() } },
    { returnDocument: 'after' }
  );
  
  return result ? toTask(result) : undefined;
}

export async function deleteTask(id: number): Promise<boolean> {
  const col = await tasksCol();
  const result = await col.deleteOne({ _id: toObjectId(id) });
  return result.deletedCount > 0;
}

// ═══════════════════════════════════════════════════════════════
// NOTES
// ═══════════════════════════════════════════════════════════════

export async function getNotes(): Promise<NoteRow[]> {
  const col = await notesCol();
  const docs = await col.find({}).sort({ created_at: -1 }).toArray();
  return docs.map(toNote);
}

export async function getNote(id: number): Promise<NoteRow | undefined> {
  const col = await notesCol();
  const doc = await col.findOne({ _id: toObjectId(id) });
  return doc ? toNote(doc) : undefined;
}

export async function createNote(note: {
  title: string;
  content: string;
  tags?: string | null;
}): Promise<NoteRow> {
  const col = await notesCol();
  const nowStr = now();
  const doc = {
    title: note.title,
    content: note.content,
    tags: note.tags || null,
    created_at: nowStr,
    updated_at: nowStr,
  };
  const result = await col.insertOne(doc);
  return toNote({ ...doc, _id: result.insertedId });
}

export async function updateNote(id: number, patch: Partial<NoteRow>): Promise<NoteRow | undefined> {
  const col = await notesCol();
  const { id: _id, created_at, ...updateData } = patch;
  const result = await col.findOneAndUpdate(
    { _id: toObjectId(id) },
    { $set: { ...updateData, updated_at: now() } },
    { returnDocument: 'after' }
  );
  return result ? toNote(result) : undefined;
}

export async function deleteNote(id: number): Promise<boolean> {
  const col = await notesCol();
  const result = await col.deleteOne({ _id: toObjectId(id) });
  return result.deletedCount > 0;
}

// ═══════════════════════════════════════════════════════════════
// SESSIONS
// ═══════════════════════════════════════════════════════════════

export async function getSessions(): Promise<SessionRow[]> {
  const col = await sessionsCol();
  const docs = await col.find({}).sort({ created_at: -1 }).toArray();
  return docs.map(toSession);
}

export async function getSessionsByDate(date: string): Promise<SessionRow[]> {
  const col = await sessionsCol();
  const docs = await col.find({ date }).sort({ created_at: -1 }).toArray();
  return docs.map(toSession);
}

export async function createSession(session: {
  type: string;
  duration_seconds: number;
  planned_seconds: number;
  task_id?: number | null;
  date: string;
}): Promise<SessionRow> {
  const col = await sessionsCol();
  const nowStr = now();
  const doc = {
    type: session.type,
    duration_seconds: session.duration_seconds,
    planned_seconds: session.planned_seconds,
    task_id: session.task_id ? toObjectId(session.task_id) : null,
    date: session.date,
    created_at: nowStr,
  };
  const result = await col.insertOne(doc);
  return toSession({ ...doc, _id: result.insertedId });
}

export async function deleteSession(id: number): Promise<boolean> {
  const col = await sessionsCol();
  const result = await col.deleteOne({ _id: toObjectId(id) });
  return result.deletedCount > 0;
}

// ═══════════════════════════════════════════════════════════════
// LINKS
// ═══════════════════════════════════════════════════════════════

export async function getLinks(): Promise<LinkRow[]> {
  const col = await linksCol();
  const docs = await col.find({}).sort({ created_at: -1 }).toArray();
  return docs.map(toLink);
}

export async function createLink(link: {
  name: string;
  url: string;
  description?: string | null;
  tags?: string | null;
}): Promise<LinkRow> {
  const col = await linksCol();
  const nowStr = now();
  const doc = {
    name: link.name,
    url: link.url,
    description: link.description || null,
    tags: link.tags || null,
    created_at: nowStr,
  };
  const result = await col.insertOne(doc);
  return toLink({ ...doc, _id: result.insertedId });
}

export async function deleteLink(id: number): Promise<boolean> {
  const col = await linksCol();
  const result = await col.deleteOne({ _id: toObjectId(id) });
  return result.deletedCount > 0;
}

export async function updateLink(id: number, patch: Partial<LinkRow>): Promise<LinkRow | undefined> {
  const col = await linksCol();
  const { id: _id, created_at, ...updateData } = patch;
  const result = await col.findOneAndUpdate(
    { _id: toObjectId(id) },
    { $set: { ...updateData } },
    { returnDocument: 'after' }
  );
  return result ? toLink(result) : undefined;
}

// ═══════════════════════════════════════════════════════════════
// REWARDS (singleton)
// ═══════════════════════════════════════════════════════════════

export async function getRewards(): Promise<RewardRow> {
  const col = await rewardsCol();
  let doc = await col.findOne({});
  if (!doc) {
    const nowStr = now();
    const defaultDoc = {
      badges: '',
      points: 0,
      level: 1,
      streak_days: 0,
      last_study_date: null,
      updated_at: nowStr,
    };
    const result = await col.insertOne(defaultDoc);
    doc = { ...defaultDoc, _id: result.insertedId };
  }
  return toReward(doc);
}

export async function updateRewards(patch: Partial<RewardRow>): Promise<RewardRow> {
  const col = await rewardsCol();
  const { id: _id, ...updateData } = patch;
  const result = await col.findOneAndUpdate(
    {},
    { $set: { ...updateData, updated_at: now() } },
    { returnDocument: 'after', upsert: true }
  );
  return toReward(result!);
}

// ═══════════════════════════════════════════════════════════════
// SETTINGS
// ═══════════════════════════════════════════════════════════════

export async function getSetting(key: string): Promise<string | null> {
  const col = await settingsCol();
  const doc = await col.findOne({ key });
  return doc?.value || null;
}

export async function setSetting(key: string, value: string): Promise<void> {
  const col = await settingsCol();
  await col.updateOne(
    { key },
    { $set: { key, value } },
    { upsert: true }
  );
}

export async function getAllSettings(): Promise<Record<string, string>> {
  const col = await settingsCol();
  const docs = await col.find({}).toArray();
  return Object.fromEntries(docs.map(d => [d.key, d.value]));
}

// ═══════════════════════════════════════════════════════════════
// STATS
// ═══════════════════════════════════════════════════════════════

export async function getStats() {
  const [tasksCol_, sessionsCol_, notesCol_, linksCol_, rewardsCol_] = await Promise.all([
    tasksCol(), sessionsCol(), notesCol(), linksCol(), rewardsCol()
  ]);

  const [totalTasks, doneTasks, totalSessions, totalMinutes, totalNotes, totalLinks, rewards] = await Promise.all([
    tasksCol_.countDocuments({}),
    tasksCol_.countDocuments({ done: 1 }),
    sessionsCol_.countDocuments({}),
    sessionsCol_.aggregate([
      { $group: { _id: null, total: { $sum: '$duration_seconds' } } }
    ]).toArray(),
    notesCol_.countDocuments({}),
    linksCol_.countDocuments({}),
    getRewards(),
  ]);

  return {
    totalTasks,
    doneTasks,
    completionRate: totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0,
    totalSessions,
    totalMinutes: Math.round((totalMinutes[0]?.total || 0) / 60),
    totalNotes,
    totalLinks,
    ...rewards,
  };
}

// ═══════════════════════════════════════════════════════════════
// RAW (for complex queries)
// ═══════════════════════════════════════════════════════════════

export async function raw<T = any>(collectionName: string, pipeline: any[]): Promise<T[]> {
  const db = await connect();
  return db.collection(collectionName).aggregate(pipeline).toArray() as Promise<T[]>;
}

export async function rawGet<T = any>(collectionName: string, filter: any): Promise<T | undefined> {
  const db = await connect();
  return db.collection(collectionName).findOne(filter) as Promise<T | undefined>;
}

// ═══════════════════════════════════════════════════════════════
// GOALS
// ═══════════════════════════════════════════════════════════════

function toGoal(doc: any) {
  return {
    id: parseInt(doc._id.toString().slice(-8), 16),
    title: doc.title,
    description: doc.description,
    color: doc.color,
    target_date: doc.target_date,
    created_at: doc.created_at,
    updated_at: doc.updated_at,
  };
}

export async function getGoals(): Promise<any[]> {
  const col = await goalsCol();
  const docs = await col.find({}).sort({ created_at: -1 }).toArray();
  return docs.map(toGoal);
}

export async function createGoal(g: { title: string; description?: string; color?: string; target_date?: string }): Promise<any> {
  const col = await goalsCol();
  const nowStr = now();
  const doc = { ...g, created_at: nowStr, updated_at: nowStr };
  const result = await col.insertOne(doc);
  return toGoal({ ...doc, _id: result.insertedId });
}

export async function updateGoal(id: number, patch: any): Promise<any | undefined> {
  const col = await goalsCol();
  const { id: _id, created_at, ...updateData } = patch;
  const result = await col.findOneAndUpdate(
    { _id: toObjectId(id) },
    { $set: { ...updateData, updated_at: now() } },
    { returnDocument: 'after' }
  );
  return result ? toGoal(result) : undefined;
}

export async function deleteGoal(id: number): Promise<boolean> {
  const col = await goalsCol();
  const result = await col.deleteOne({ _id: toObjectId(id) });
  // Also delete related projects
  await projectsCol().then(c => c.deleteMany({ goal_id: toObjectId(id) }));
  return result.deletedCount > 0;
}

// ═══════════════════════════════════════════════════════════════
// PROJECTS
// ═══════════════════════════════════════════════════════════════

function toProject(doc: any) {
  return {
    id: parseInt(doc._id.toString().slice(-8), 16),
    goal_id: doc.goal_id ? parseInt(doc.goal_id.toString().slice(-8), 16) : null,
    title: doc.title,
    description: doc.description,
    color: doc.color,
    created_at: doc.created_at,
    updated_at: doc.updated_at,
  };
}

export async function getProjects(): Promise<any[]> {
  const col = await projectsCol();
  const docs = await col.find({}).sort({ created_at: -1 }).toArray();
  return docs.map(toProject);
}

export async function createProject(p: { goal_id?: number | null; title: string; description?: string; color?: string }): Promise<any> {
  const col = await projectsCol();
  const nowStr = now();
  const doc = {
    goal_id: p.goal_id ? toObjectId(p.goal_id) : null,
    title: p.title,
    description: p.description,
    color: p.color,
    created_at: nowStr,
    updated_at: nowStr,
  };
  const result = await col.insertOne(doc);
  return toProject({ ...doc, _id: result.insertedId });
}

export async function updateProject(id: number, patch: any): Promise<any | undefined> {
  const col = await projectsCol();
  const { id: _id, created_at, ...updateData } = patch;
  const result = await col.findOneAndUpdate(
    { _id: toObjectId(id) },
    { $set: { ...updateData, updated_at: now() } },
    { returnDocument: 'after' }
  );
  return result ? toProject(result) : undefined;
}

export async function deleteProject(id: number): Promise<boolean> {
  const col = await projectsCol();
  const result = await col.deleteOne({ _id: toObjectId(id) });
  return result.deletedCount > 0;
}

// ═══════════════════════════════════════════════════════════════
// HABITS
// ═══════════════════════════════════════════════════════════════

function toHabit(doc: any) {
  return {
    id: parseInt(doc._id.toString().slice(-8), 16),
    name: doc.name,
    description: doc.description,
    frequency: doc.frequency,
    target_count: doc.target_count,
    color: doc.color,
    created_at: doc.created_at,
    updated_at: doc.updated_at,
  };
}

export async function getHabits(): Promise<any[]> {
  const col = await habitsCol();
  const docs = await col.find({}).sort({ created_at: -1 }).toArray();
  return docs.map(toHabit);
}

export async function createHabit(h: { name: string; description?: string; frequency: string; target_count: number; color?: string }): Promise<any> {
  const col = await habitsCol();
  const nowStr = now();
  const doc = { ...h, created_at: nowStr, updated_at: nowStr };
  const result = await col.insertOne(doc);
  return toHabit({ ...doc, _id: result.insertedId });
}

export async function updateHabit(id: number, patch: any): Promise<any | undefined> {
  const col = await habitsCol();
  const { id: _id, created_at, ...updateData } = patch;
  const result = await col.findOneAndUpdate(
    { _id: toObjectId(id) },
    { $set: { ...updateData, updated_at: now() } },
    { returnDocument: 'after' }
  );
  return result ? toHabit(result) : undefined;
}

export async function deleteHabit(id: number): Promise<boolean> {
  const col = await habitsCol();
  const result = await col.deleteOne({ _id: toObjectId(id) });
  // Also delete related logs
  await habitLogsCol().then(c => c.deleteMany({ habit_id: toObjectId(id) }));
  return result.deletedCount > 0;
}

// ═══════════════════════════════════════════════════════════════
// HABIT LOGS
// ═══════════════════════════════════════════════════════════════

function toHabitLog(doc: any) {
  return {
    id: parseInt(doc._id.toString().slice(-8), 16),
    habit_id: parseInt(doc.habit_id.toString().slice(-8), 16),
    date: doc.date,
    count: doc.count,
    created_at: doc.created_at,
  };
}

export async function getHabitLogs(habit_id: number): Promise<any[]> {
  const col = await habitLogsCol();
  const docs = await col.find({ habit_id: toObjectId(habit_id) }).sort({ date: -1 }).toArray();
  return docs.map(toHabitLog);
}

export async function createHabitLog(log: { habit_id: number; date: string; count: number }): Promise<any> {
  const col = await habitLogsCol();
  const nowStr = now();
  const doc = {
    habit_id: toObjectId(log.habit_id),
    date: log.date,
    count: log.count,
    created_at: nowStr,
  };
  const result = await col.updateOne(
    { habit_id: doc.habit_id, date: doc.date },
    { $set: doc },
    { upsert: true }
  );
  // اجيب الـ doc النهائي (upserted أو الموجود)
  const finalDoc = await col.findOne({ habit_id: doc.habit_id, date: doc.date });
  return toHabitLog(finalDoc);
}

// ═══════════════════════════════════════════════════════════════
// SCHEDULE BLOCKS
// ═══════════════════════════════════════════════════════════════

function toScheduleBlock(doc: any) {
  return {
    id: parseInt(doc._id.toString().slice(-8), 16),
    date: doc.date,
    title: doc.title,
    start_time: doc.start_time,
    end_time: doc.end_time,
    color: doc.color,
    created_at: doc.created_at,
  };
}

export async function getScheduleBlocks(date: string): Promise<any[]> {
  const col = await scheduleBlocksCol();
  const docs = await col.find({ date }).sort({ start_time: 1 }).toArray();
  return docs.map(toScheduleBlock);
}

export async function createScheduleBlock(b: { date: string; title: string; start_time: string; end_time: string; color?: string }): Promise<any> {
  const col = await scheduleBlocksCol();
  const nowStr = now();
  const doc = { ...b, created_at: nowStr };
  const result = await col.insertOne(doc);
  return toScheduleBlock({ ...doc, _id: result.insertedId });
}

export async function deleteScheduleBlock(id: number): Promise<boolean> {
  const col = await scheduleBlocksCol();
  const result = await col.deleteOne({ _id: toObjectId(id) });
  return result.deletedCount > 0;
}

// ═══════════════════════════════════════════════════════════════
// POINTS LOG
// ═══════════════════════════════════════════════════════════════

function toPointsLog(doc: any) {
  return {
    id: parseInt(doc._id.toString().slice(-8), 16),
    points: doc.points,
    reason: doc.reason,
    created_at: doc.created_at,
  };
}

export async function getPointsLogs(): Promise<any[]> {
  const col = await pointsLogCol();
  const docs = await col.find({}).sort({ created_at: -1 }).toArray();
  return docs.map(toPointsLog);
}

export async function createPointsLog(log: { points: number; reason: string }): Promise<any> {
  const col = await pointsLogCol();
  const nowStr = now();
  const doc = { ...log, created_at: nowStr };
  const result = await col.insertOne(doc);
  return toPointsLog({ ...doc, _id: result.insertedId });
}

// ═══════════════════════════════════════════════════════════════
// REMINDERS
// ═══════════════════════════════════════════════════════════════

function toReminder(doc: any) {
  return {
    id: parseInt(doc._id.toString().slice(-8), 16),
    title: doc.title,
    date: doc.date,
    time: doc.time,
    repeat: doc.repeat,
    created_at: doc.created_at,
  };
}

export async function getReminders(): Promise<any[]> {
  const col = await remindersCol();
  const docs = await col.find({}).sort({ date: 1, time: 1 }).toArray();
  return docs.map(toReminder);
}

export async function createReminder(r: { title: string; date: string; time: string; repeat?: string }): Promise<any> {
  const col = await remindersCol();
  const nowStr = now();
  const doc = { ...r, created_at: nowStr };
  const result = await col.insertOne(doc);
  return toReminder({ ...doc, _id: result.insertedId });
}

export async function deleteReminder(id: number): Promise<boolean> {
  const col = await remindersCol();
  const result = await col.deleteOne({ _id: toObjectId(id) });
  return result.deletedCount > 0;
}

// ═══════════════════════════════════════════════════════════════
// Close connection (for cleanup)
// ═══════════════════════════════════════════════════════════════

export async function closeConnection(): Promise<void> {
  if (client) {
    await client.close();
    client = null;
    db = null;
    isConnected = false;
  }
}

// ═══════════════════════════════════════════════════════════════
// ANALYTICS (for AI/telegram/analytics routes)
// ═══════════════════════════════════════════════════════════════

export async function getAnalytics() {
  const stats = await getStats();
  const today = new Date().toISOString().split('T')[0];
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  
  const [tasksCol_, sessionsCol_] = await Promise.all([tasksCol(), sessionsCol()]);
  
  const [todayTasks, todayDone, thisWeekSessions, thisWeekMinutes] = await Promise.all([
    tasksCol_.countDocuments({ day: today }),
    tasksCol_.countDocuments({ day: today, done: 1 }),
    sessionsCol_.countDocuments({ date: { $gte: weekAgo } }),
    sessionsCol_.aggregate([
      { $match: { date: { $gte: weekAgo } } },
      { $group: { _id: null, total: { $sum: '$duration_seconds' } } }
    ]).toArray(),
  ]);
  
  return {
    ...stats,
    today: {
      total: todayTasks,
      done: todayDone,
      rate: todayTasks > 0 ? Math.round((todayDone / todayTasks) * 100) : 0,
    },
    thisWeek: {
      sessions: thisWeekSessions,
      minutes: Math.round((thisWeekMinutes[0]?.total || 0) / 60),
    },
  };
}

export async function getWeekPoints(): Promise<number> {
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const col = await pointsLogCol();
  const result = await col.aggregate([
    { $match: { created_at: { $gte: weekAgo } } },
    { $group: { _id: null, total: { $sum: '$points' } } }
  ]).toArray();
  return result[0]?.total || 0;
}

// ═══════════════════════════════════════════════════════════════
// HABIT TOGGLE (for habits route)
// ═══════════════════════════════════════════════════════════════

export async function toggleHabitLog(habit_id: number, date: string): Promise<any> {
  const col = await habitLogsCol();
  const existing = await col.findOne({ habit_id: toObjectId(habit_id), date });
  
  if (existing) {
    const newCount = (existing.count || 0) + 1;
    await col.updateOne(
      { _id: existing._id },
      { $set: { count: newCount } }
    );
    return { count: newCount, toggled: true };
  } else {
    const nowStr = now();
    const doc = {
      habit_id: toObjectId(habit_id),
      date,
      count: 1,
      created_at: nowStr,
    };
    const result = await col.insertOne(doc);
    return { count: 1, toggled: true };
  }
}

// ═══════════════════════════════════════════════════════════════
// POINTS (for points route)
// ═══════════════════════════════════════════════════════════════

export async function addPoints(points: number, reason: string): Promise<any> {
  const col = await pointsLogCol();
  const nowStr = now();
  const doc = { points, reason, created_at: nowStr };
  const result = await col.insertOne(doc);
  return { ...doc, _id: result.insertedId };
}

export async function getPointsLog(): Promise<any[]> {
  const col = await pointsLogCol();
  const docs = await col.find({}).sort({ created_at: -1 }).toArray();
  return docs.map(toPointsLog);
}

// ═══════════════════════════════════════════════════════════════
// REMINDERS MARK SENT (for reminders route)
// ═══════════════════════════════════════════════════════════════

export async function markReminderSent(id: number): Promise<boolean> {
  const col = await remindersCol();
  const result = await col.updateOne(
    { _id: toObjectId(id) },
    { $set: { sent: true } }
  );
  return result.modifiedCount > 0;
}

// ═══════════════════════════════════════════════════════════════
// Default export (updated with new functions)
// ═══════════════════════════════════════════════════════════════

export default {
  getTasks,
  getTasksByDay,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  getNotes,
  getNote,
  createNote,
  updateNote,
  deleteNote,
  getSessions,
  getSessionsByDate,
  createSession,
  deleteSession,
  getLinks,
  createLink,
  deleteLink,
  updateLink,
  getRewards,
  updateRewards,
  getSetting,
  setSetting,
  getAllSettings,
  getStats,
  getAnalytics,
  getWeekPoints,
  raw,
  rawGet,
  getGoals,
  createGoal,
  updateGoal,
  deleteGoal,
  getProjects,
  createProject,
  updateProject,
  deleteProject,
  getHabits,
  createHabit,
  updateHabit,
  deleteHabit,
  getHabitLogs,
  createHabitLog,
  toggleHabitLog,
  getScheduleBlocks,
  createScheduleBlock,
  deleteScheduleBlock,
  getPointsLogs,
  createPointsLog,
  addPoints,
  getPointsLog,
  getReminders,
  createReminder,
  deleteReminder,
  markReminderSent,
  closeConnection,
};