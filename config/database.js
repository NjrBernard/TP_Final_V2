// config/database.js - VERSION CORRIGÉE
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database.sqlite');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Erreur lors de l\'ouverture de la base de données:', err.message);
    } else {
        console.log('Connecté à la base de données SQLite.');
        initializeTables();
    }
});

function initializeTables() {
    // Table categories
    db.run(`CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        color TEXT NOT NULL,
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`, (err) => {
        if (err) console.error('Erreur création table categories:', err.message);
    });

    // Table locations
    db.run(`CREATE TABLE IF NOT EXISTS locations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        city TEXT NOT NULL,
        department TEXT NOT NULL,
        capacity INTEGER NOT NULL CHECK(capacity > 0),
        address TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`, (err) => {
        if (err) console.error('Erreur création table locations:', err.message);
    });

    // Table events
    db.run(`CREATE TABLE IF NOT EXISTS events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        start_date DATETIME NOT NULL,
        end_date DATETIME NOT NULL,
        location_id INTEGER,
        category_id INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (location_id) REFERENCES locations (id),
        FOREIGN KEY (category_id) REFERENCES categories (id),
        CHECK (end_date > start_date)
    )`, (err) => {
        if (err) console.error('Erreur création table events:', err.message);
    });

    // ✅ Table attendees CORRIGÉE - EMAIL/PHONE OPTIONNELS
    db.run(`CREATE TABLE IF NOT EXISTS attendees (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        email TEXT,
        phone TEXT,
        event_id INTEGER NOT NULL,
        companions_count INTEGER DEFAULT 1 CHECK(companions_count > 0),
        registration_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (event_id) REFERENCES events (id)
    )`, (err) => {
        if (err) {
            console.error('Erreur création table attendees:', err.message);
        } else {
            console.log('✅ Table attendees créée avec email/phone optionnels');
        }
    });

    console.log('Tables initialisées avec succès.');
}

module.exports = db;