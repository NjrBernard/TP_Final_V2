// models/eventModel.js
const db = require('../config/database');

class EventModel {
static getAll() {
    return new Promise((resolve, reject) => {
        const query = `
            SELECT 
                e.*,
                l.name as location_name,
                l.city as location_city,
                l. capacity as location_capacity,
                c.name as category_name,
                c.color as category_color,
                COUNT(a.id) as registered_count
            FROM events e
            LEFT JOIN locations l ON e.location_id = l.id
            LEFT JOIN categories c ON e.category_id = c.id
            LEFT JOIN attendees a ON e.id = a.event_id
            GROUP BY e.id
            ORDER BY e.start_date DESC
        `;
        
        db. all(query, [], (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
}

    static getById(id) {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT e.*, c.name as category_name, c.color as category_color,
                       l.name as location_name, l.city as location_city
                FROM events e
                LEFT JOIN categories c ON e.category_id = c.id
                LEFT JOIN locations l ON e.location_id = l.id
                WHERE e.id = ?
            `;
            db.get(query, [id], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
    }

    static create(data) {
        return new Promise((resolve, reject) => {
            const { name, description, start_date, end_date, location_id, category_id } = data;
            db.run(
                'INSERT INTO events (name, description, start_date, end_date, location_id, category_id) VALUES (?, ?, ?, ?, ?, ?)',
                [name, description, start_date, end_date, location_id, category_id],
                function(err) {
                    if (err) reject(err);
                    else resolve({ id: this.lastID, ...data });
                }
            );
        });
    }

    static update(id, data) {
        return new Promise((resolve, reject) => {
            const { name, description, start_date, end_date, location_id, category_id } = data;
            db.run(
                'UPDATE events SET name = ?, description = ?, start_date = ?, end_date = ?, location_id = ?, category_id = ? WHERE id = ?',
                [name, description, start_date, end_date, location_id, category_id, id],
                function(err) {
                    if (err) reject(err);
                    else resolve({ id, changes: this.changes });
                }
            );
        });
    }

    static delete(id) {
        return new Promise((resolve, reject) => {
            db.run('DELETE FROM events WHERE id = ?', [id], function(err) {
                if (err) reject(err);
                else resolve({ changes: this.changes });
            });
        });
    }
}

module.exports = EventModel;