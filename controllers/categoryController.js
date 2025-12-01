const CategoryModel = require('../models/categoryModel');

class CategoryController {
    static async getAll(req, res) {
        try {
            const categories = await CategoryModel.getAll();
            res.json(categories);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async getById(req, res) {
        try {
            const category = await CategoryModel.getById(req.params.id);
            if (!category) {
                return res.status(404).json({ error: 'Catégorie non trouvée' });
            }
            res.json(category);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async create(req, res) {
        try {
            const { name, color, description } = req.body;
            
            if (!name || ! color) {
                return res.status(400).json({ error: 'Le nom et la couleur sont requis' });
            }

            const category = await CategoryModel.create({ name, color, description });
            res.status(201).json(category);
        } catch (error) {
            if (error.message.includes('UNIQUE constraint failed')) {
                res.status(400).json({ error: 'Cette catégorie existe déjà' });
            } else {
                res.status(500).json({ error: error.message });
            }
        }
    }

    static async update(req, res) {
        try {
            const result = await CategoryModel.update(req.params.id, req.body);
            if (result.changes === 0) {
                return res.status(404).json({ error: 'Catégorie non trouvée' });
            }
            res.json({ message: 'Catégorie mise à jour avec succès' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async delete(req, res) {
        try {
            const result = await CategoryModel.delete(req.params.id);
            if (result.changes === 0) {
                return res.status(404).json({ error: 'Catégorie non trouvée' });
            }
            res.json({ message: 'Catégorie supprimée avec succès' });
        } catch (error) {
            if (error.message.includes('FOREIGN KEY constraint failed')) {
                res.status(400).json({ error: 'Impossible de supprimer cette catégorie car elle est utilisée par des événements' });
            } else {
                res.status(500).json({ error: error.message });
            }
        }
    }
}

module.exports = CategoryController;