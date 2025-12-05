// models/attendeeModel.js
const db = require('../config/database');

class AttendeeModel {
    static getAll() {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT a.*, e.name as event_name, e.start_date, e.end_date
                FROM attendees a
                LEFT JOIN events e ON a.event_id = e.id
                ORDER BY a.last_name, a.first_name
            `;
            db.all(query, [], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    }

    static getById(id) {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT a.*, e.name as event_name, e.start_date, e.end_date
                FROM attendees a
                LEFT JOIN events e ON a.event_id = e.id
                WHERE a.id = ? 
            `;
            db.get(query, [id], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
    }

    static create(data) {
        return new Promise((resolve, reject) => {
            // AJOUT du champ companions_count
            const { first_name, last_name, email, phone, event_id, companions_count } = data;
            const finalCompanionsCount = companions_count || 1; // Valeur par défaut = 1
            
            db.run(
                'INSERT INTO attendees (first_name, last_name, email, phone, event_id, companions_count) VALUES (?, ?, ?, ?, ?, ?)',
                [first_name, last_name, email, phone, event_id, finalCompanionsCount],
                function(err) {
                    if (err) reject(err);
                    else resolve({ id: this.lastID, ...data, companions_count: finalCompanionsCount });
                }
            );
        });
    }

    static update(id, data) {
        return new Promise((resolve, reject) => {
            // AJOUT du champ companions_count
            const { first_name, last_name, email, phone, event_id, companions_count } = data;
            const finalCompanionsCount = companions_count || 1; // Valeur par défaut = 1
            
            db.run(
                'UPDATE attendees SET first_name = ?, last_name = ?, email = ?, phone = ?, event_id = ?, companions_count = ? WHERE id = ?',
                [first_name, last_name, email, phone, event_id, finalCompanionsCount, id],
                function(err) {
                    if (err) reject(err);
                    else resolve({ id, changes: this.changes });
                }
            );
        });
    }

    static delete(id) {
        return new Promise((resolve, reject) => {
            db.run('DELETE FROM attendees WHERE id = ? ', [id], function(err) {
                if (err) reject(err);
                else resolve({ changes: this.changes });
            });
        });
    }
}

module.exports = AttendeeModel;