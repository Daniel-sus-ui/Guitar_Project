const path = require('path');
const fs = require('fs');

const DB_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DB_DIR, 'db.json');

function ensureDb() {
  if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true });
  if (!fs.existsSync(DB_FILE)) {
    const base = { lessons: [], tokens: [] };
    fs.writeFileSync(DB_FILE, JSON.stringify(base, null, 2));
  }
}

function readDb() {
  ensureDb();
  const raw = fs.readFileSync(DB_FILE, 'utf8');
  return JSON.parse(raw || '{"lessons":[],"tokens":[]}');
}

function writeDb(obj) {
  fs.writeFileSync(DB_FILE, JSON.stringify(obj, null, 2));
}

async function init() {
  ensureDb();
}

async function getAllLessons() {
  const db = readDb();
  return db.lessons;
}

async function getLessonById(id) {
  const db = readDb();
  return db.lessons.find(l => l.id === id) || null;
}

async function createLesson({ title, description, price, topics }) {
  const db = readDb();
  const id = `lesson_${Date.now()}`;
  const newLesson = { id, title, description, price: Number(price || 0), topics: topics || [] };
  db.lessons.push(newLesson);
  writeDb(db);
  return newLesson;
}

async function storeToken(token, lessonId, sessionId) {
  const db = readDb();
  const createdAt = Date.now();
  const existingIndex = db.tokens.findIndex(t => t.token === token);
  const record = { token, lessonId, sessionId, createdAt };
  if (existingIndex >= 0) db.tokens[existingIndex] = record; else db.tokens.push(record);
  writeDb(db);
}

module.exports = { init, getAllLessons, getLessonById, createLesson, storeToken };
