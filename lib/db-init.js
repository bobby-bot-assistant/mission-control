const Database = require('better-sqlite3')
const fs = require('fs')
const path = require('path')

const DB_PATH = path.join(__dirname, '..', 'data', 'mission-control.db')
const SCHEMA_PATH = path.join(__dirname, '..', 'data', 'schema.sql')

// Ensure data directory exists
const dataDir = path.dirname(DB_PATH)
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true })
}

console.log('Initializing database...')
console.log('Database path:', DB_PATH)

// Remove existing database if it exists (for fresh start)
if (fs.existsSync(DB_PATH)) {
  console.log('Removing existing database...')
  fs.unlinkSync(DB_PATH)
}

// Create new database
const db = new Database(DB_PATH)
db.pragma('foreign_keys = ON')

// Read and execute schema
const schema = fs.readFileSync(SCHEMA_PATH, 'utf8')
db.exec(schema)

console.log('Schema applied successfully!')

// Verify tables were created
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name").all()
console.log('Created tables:', tables.map(t => t.name).join(', '))

db.close()
console.log('Database initialization complete!')
