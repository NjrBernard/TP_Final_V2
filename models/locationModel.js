// models/locationModel.js
const db = require('../config/database');

class LocationModel {
    static getAll() {
        return new Promise((resolve, reject) => {
            db.all('SELECT * FROM locations ORDER BY name', [], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    }

    static getById(id) {
        return new Promise((resolve, reject) => {
            db.get('SELECT * FROM locations WHERE id = ?', [id], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
    }

static create(data) {
    return new Promise((resolve, reject) => {
        const { name, city, department, capacity, address } = data;
        db.run(  // ← Ajout du "db." manquant
            'INSERT INTO locations (name, city, department, capacity, address) VALUES (?, ?, ?, ?, ?)',
            [name, city, department, capacity, address],
            function(err) {
                if (err) reject(err);
                else resolve({ id: this.lastID, ...data });
            }
        );
    });
}

    static update(id, data) {
        return new Promise((resolve, reject) => {
            const { name, city, department, capacity, address } = data;
            db.run(
                'UPDATE locations SET name = ?, city = ?, department = ?, capacity = ?, address = ? WHERE id = ?',
                [name, city, department, capacity, address, id],
                function(err) {
                    if (err) reject(err);
                    else resolve({ id, changes: this.changes });
                }
            );
        });
    }

    static delete(id) {
        return new Promise((resolve, reject) => {
            db.run('DELETE FROM locations WHERE id = ? ', [id], function(err) {
                if (err) reject(err);
                else resolve({ changes: this.changes });
            });
        });
    }
}

module.exports = LocationModel;