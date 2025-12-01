const AttendeeModel = require('../models/attendeeModel');

class AttendeeController {
    static async getAll(req, res) {
        try {
            const attendees = await AttendeeModel.getAll();
            res.json(attendees);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async getById(req, res) {
        try {
            const attendee = await AttendeeModel.getById(req.params.id);
            if (!attendee) {
                return res.status(404).json({ error: 'Participant non trouvé' });
            }
            res.json(attendee);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async create(req, res) {
        try {
            const { first_name, last_name, email, phone, event_id } = req.body;
            
            if (!first_name || !last_name || ! email || !phone || !event_id) {
                return res.status(400).json({ error: 'Tous les champs sont obligatoires' });
            }

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return res.status(400).json({ error: 'Format email invalide' });
            }

            const attendee = await AttendeeModel.create({ first_name, last_name, email, phone, event_id });
            res.status(201).json(attendee);
        } catch (error) {
            if (error.message.includes('UNIQUE constraint failed')) {
                res.status(400).json({ error: 'Ce participant est déjà inscrit à cet événement' });
            } else {
                res.status(500).json({ error: error.message });
            }
        }
    }

    static async update(req, res) {
        try {
            const { email } = req.body;
            
            if (email) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(email)) {
                    return res.status(400).json({ error: 'Format email invalide' });
                }
            }

            const result = await AttendeeModel.update(req.params.id, req.body);
            if (result.changes === 0) {
                return res.status(404).json({ error: 'Participant non trouvé' });
            }
            res.json({ message: 'Participant mis à jour avec succès' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async delete(req, res) {
        try {
            const result = await AttendeeModel.delete(req.params.id);
            if (result.changes === 0) {
                return res.status(404).json({ error: 'Participant non trouvé' });
            }
            res.json({ message: 'Participant supprimé avec succès' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = AttendeeController;