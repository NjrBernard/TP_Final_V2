// controllers/eventController.js
const EventModel = require('../models/eventModel');

class EventController {
    static async getAll(req, res) {
        try {
            const events = await EventModel.getAll();
            res.json(events);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async getById(req, res) {
        try {
            const event = await EventModel.getById(req.params.id);
            if (!event) {
                return res.status(404).json({ error: 'Événement non trouvé' });
            }
            res.json(event);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async create(req, res) {
        try {
            const { name, description, start_date, end_date, location_id, category_id } = req.body;
            
            if (!name || !start_date || !end_date || !location_id || !category_id) {
                return res.status(400).json({ error: 'Tous les champs obligatoires doivent être remplis' });
            }

            if (new Date(end_date) <= new Date(start_date)) {
                return res.status(400).json({ error: 'La date de fin doit être postérieure à la date de début' });
            }

            const event = await EventModel.create({ name, description, start_date, end_date, location_id, category_id });
            res.status(201).json(event);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async update(req, res) {
        try {
            const { start_date, end_date } = req.body;
            
            if (start_date && end_date && new Date(end_date) <= new Date(start_date)) {
                return res.status(400).json({ error: 'La date de fin doit être postérieure à la date de début' });
            }

            const result = await EventModel.update(req.params.id, req.body);
            if (result.changes === 0) {
                return res.status(404).json({ error: 'Événement non trouvé' });
            }
            res.json({ message: 'Événement mis à jour avec succès' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async delete(req, res) {
        try {
            const result = await EventModel.delete(req.params.id);
            if (result.changes === 0) {
                return res.status(404).json({ error: 'Événement non trouvé' });
            }
            res.json({ message: 'Événement supprimé avec succès' });
        } catch (error) {
            if (error.message.includes('FOREIGN KEY constraint failed')) {
                res.status(400).json({ error: 'Impossible de supprimer cet événement car il a des participants inscrits' });
            } else {
                res.status(500).json({ error: error.message });
            }
        }
    }
}

module.exports = EventController;