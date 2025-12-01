// models/categoryModel.js
const db = require('../config/database');

class CategoryModel {
    static getAll() {
        return new Promise((resolve, reject) => {
            db.all('SELECT * FROM categories ORDER BY name', [], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    }

    static getById(id) {
        return new Promise((resolve, reject) => {
            db.get('SELECT * FROM categories WHERE id = ?', [id], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
    }

    static create(data) {
        return new Promise((resolve, reject) => {
            const { name, color, description } = data;
            db.run(
                'INSERT INTO categories (name, color, description) VALUES (?, ?, ?)',
                [name, color, description],
                function(err) {
                    if (err) reject(err);
                    else resolve({ id: this.lastID, ...data });
                }
            );
        });
    }

    static update(id, data) {
        return new Promise((resolve, reject) => {
            const { name, color, description } = data;
            db.run(
                'UPDATE categories SET name = ?, color = ?, description = ?  WHERE id = ?',
                [name, color, description, id],
                function(err) {
                    if (err) reject(err);
                    else resolve({ id, changes: this.changes });
                }
            );
        });
    }

    static delete(id) {
        return new Promise((resolve, reject) => {
            db.run('DELETE FROM categories WHERE id = ? ', [id], function(err) {
                if (err) reject(err);
                else resolve({ changes: this.changes });
            });
        });
    }
}

module.exports = CategoryModel;