#!/usr/bin/env node
/**
 * migrate-sqlite-to-mongo.mjs
 * بيرحّل بيانات study.db (SQLite) → MongoDB Atlas
 * التشغيل: node migrate-sqlite-to-mongo.mjs <MONGODB_URI>
 * ملحوظة: better-sqlite3 لازم يكون مثبت في الـ node_modules
 */
import Database from 'better-sqlite3';
import { MongoClient } from 'mongodb';
import fs from 'fs';

const MONGODB_URI = process.argv[2] || process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error('❌ استخدم: node migrate-sqlite-to-mongo.mjs <MONGODB_URI>');
  process.exit(1);
}

const DB_NAME = process.env.MONGODB_DB || 'islam_site';
const SQLITE_PATH = process.cwd() + '/study.db';

console.log('📦 فتح SQLite:', SQLITE_PATH);
const sqlite = new Database(SQLITE_PATH, { readonly: true });

console.log('🔗 الاتصال بـ MongoDB...');
const client = new MongoClient(MONGODB_URI);
await client.connect();
const db = client.db(DB_NAME);

// الجداول للترحيل
const TABLES = ['tasks', 'notes', 'sessions', 'links', 'rewards', 'settings', 'goals', 'projects', 'habits', 'habit_logs', 'schedule_blocks', 'points_log', 'reminders'];

let total = 0;
for (const table of TABLES) {
  try {
    const rows = sqlite.prepare(`SELECT * FROM ${table}`).all();
    if (rows.length === 0) {
      console.log(`  ⏭️ ${table}: فاضي`);
      continue;
    }
    
    // تنظيف: شيل الـ id (هنخلي Mongo يولّد _id)
    const docs = rows.map(r => {
      const { id, ...rest } = r;
      return rest;
    });
    
    const result = await db.collection(table).insertMany(docs);
    console.log(`  ✅ ${table}: ${result.insertedCount} صف`);
    total += result.insertedCount;
  } catch (e) {
    console.log(`  ⚠️ ${table}: ${e.message}`);
  }
}

console.log(`\n🎉 تم ترحيل ${total} صف إلى MongoDB (${DB_NAME})`);
await client.close();
sqlite.close();
