import sqlite3 from 'better-sqlite3'
import path from 'path'

let db

export function initDatabase(userDataPath) {
  const dbPath = path.join(userDataPath, 'lawranpad.db')
  db = new sqlite3(dbPath)

  console.log(`Database initialized at ${dbPath}`)

  // Use WAL mode for better concurrency and performance.
  db.pragma('journal_mode = WAL')

  // Create tables if they don't exist.
  createTables()
}

function createTables() {
  const createDocumentsTable = `
    CREATE TABLE IF NOT EXISTS documents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL DEFAULT 'Untitled',
      content TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `

  const createSettingsTable = `
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT
    );
  `

  const createTagsTable = `
    CREATE TABLE IF NOT EXISTS tags (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE
    );
  `

  const createDocumentTagsTable = `
    CREATE TABLE IF NOT EXISTS document_tags (
      document_id INTEGER NOT NULL,
      tag_id INTEGER NOT NULL,
      PRIMARY KEY (document_id, tag_id),
      FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE,
      FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
    );
  `

  db.exec(createDocumentsTable)
  db.exec(createSettingsTable)
  db.exec(createTagsTable)
  db.exec(createDocumentTagsTable)

  console.log('Database tables created or already exist.')
}

export function getDb() {
  if (!db) {
    throw new Error('Database has not been initialized. Call initDatabase first.')
  }
  return db
}

// Document CRUD operations

export function listDocuments() {
  const stmt = db.prepare('SELECT id, title, updated_at FROM documents ORDER BY updated_at DESC')
  return stmt.all()
}

export function getDocument(id) {
  const stmt = db.prepare('SELECT * FROM documents WHERE id = ?')
  return stmt.get(id)
}

export function createDocument({ title = 'Untitled', content = '' } = {}) {
  const stmt = db.prepare(
    "INSERT INTO documents (title, content, created_at, updated_at) VALUES (?, ?, datetime('now'), datetime('now'))"
  )
  const info = stmt.run(title, content)
  return getDocument(info.lastInsertRowid)
}

export function updateDocument(id, { title, content }) {
  const stmt = db.prepare(
    "UPDATE documents SET title = ?, content = ?, updated_at = datetime('now') WHERE id = ?"
  )
  const info = stmt.run(title, content, id)
  if (info.changes > 0) {
    return getDocument(id)
  }
  return null
}

export function deleteDocument(id) {
  const stmt = db.prepare('DELETE FROM documents WHERE id = ?')
  const info = stmt.run(id)
  return info.changes > 0
}
