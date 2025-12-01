const LocationModel = require('../models/locationModel');

class LocationController {
    static async getAll(req, res) {
        try {
            const locations = await LocationModel.getAll();
            res.json(locations);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async getById(req, res) {
        try {
            const location = await LocationModel.getById(req.params.id);
            if (!location) {
                return res.status(404).json({ error: 'Lieu non trouvé' });
            }
            res.json(location);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async create(req, res) {
        try {
            const { name, city, department, capacity, address } = req.body;
            
            if (!name || !city || !department || !capacity) {
                return res.status(400).json({ error: 'Tous les champs obligatoires doivent être remplis' });
            }

            if (capacity <= 0) {
                return res.status(400).json({ error: 'La capacité doit être supérieure à 0' });
            }

            const location = await LocationModel.create({ name, city, department, capacity, address });
            res.status(201).json(location);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async update(req, res) {
        try {
            const { capacity } = req.body;
            if (capacity && capacity <= 0) {
                return res.status(400).json({ error: 'La capacité doit être supérieure à 0' });
            }

            const result = await LocationModel.update(req.params.id, req.body);
            if (result.changes === 0) {
                return res.status(404).json({ error: 'Lieu non trouvé' });
            }
            res.json({ message: 'Lieu mis à jour avec succès' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async delete(req, res) {
        try {
            const result = await LocationModel.delete(req.params.id);
            if (result.changes === 0) {
                return res.status(404).json({ error: 'Lieu non trouvé' });
            }
            res.json({ message: 'Lieu supprimé avec succès' });
        } catch (error) {
            if (error.message.includes('FOREIGN KEY constraint failed')) {
                res.status(400).json({ error: 'Impossible de supprimer ce lieu car il est utilisé par des événements' });
            } else {
                res.status(500).json({ error: error.message });
            }
        }
    }
}

module.exports = LocationController;