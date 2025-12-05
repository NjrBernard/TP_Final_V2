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

    // ===== FONCTION CREATE MODIFIÉE ===== 
    static async create(req, res) {
        try {
            const { first_name, last_name, email, phone, event_id, companions_count } = req.body;
            
            // ✅ NOUVELLE VALIDATION : Seuls prénom, nom et événement obligatoires
            if (!first_name || !last_name || ! event_id) {
                return res.status(400).json({ 
                    error: 'Le prénom, nom et événement sont obligatoires' 
                });
            }

            // ✅ VALIDATION EMAIL OPTIONNELLE : Si rempli, doit être valide
            if (email && email.trim() !== '') {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(email.trim())) {
                    return res.status(400).json({ error: 'Format email invalide' });
                }
            }

            // ✅ NETTOYER LES DONNÉES : NULL si vides
            const cleanData = {
                first_name: first_name.trim(),
                last_name: last_name.trim(),
                email: email && email.trim() !== '' ? email.trim() : null,
                phone: phone && phone.trim() !== '' ? phone.trim() : null,
                event_id: parseInt(event_id),
                companions_count: parseInt(companions_count) || 1
            };

            const attendee = await AttendeeModel.create(cleanData);
            res.status(201).json(attendee);
        } catch (error) {
            if (error.message.includes('UNIQUE constraint failed')) {
                res.status(400).json({ 
                    error: 'Ce participant est déjà inscrit à cet événement' 
                });
            } else {
                res.status(500).json({ error: error.message });
            }
        }
    }

    // ===== FONCTION UPDATE MODIFIÉE ===== 
    static async update(req, res) {
        try {
            const { first_name, last_name, email, phone, event_id, companions_count } = req.body;
            
            // ✅ VALIDATION DES CHAMPS OBLIGATOIRES POUR UPDATE
            if (first_name !== undefined && ! first_name.trim()) {
                return res.status(400).json({ error: 'Le prénom est obligatoire' });
            }
            
            if (last_name !== undefined && !last_name.trim()) {
                return res.status(400).json({ error: 'Le nom est obligatoire' });
            }
            
            if (event_id !== undefined && ! event_id) {
                return res.status(400).json({ error: 'L\'événement est obligatoire' });
            }

            // ✅ VALIDATION EMAIL OPTIONNELLE POUR UPDATE
            if (email !== undefined && email && email.trim() !== '') {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(email.trim())) {
                    return res.status(400).json({ error: 'Format email invalide' });
                }
            }

            // ✅ NETTOYER LES DONNÉES POUR UPDATE
            const cleanData = { ...req.body };
            
            if (first_name !== undefined) {
                cleanData.first_name = first_name.trim();
            }
            
            if (last_name !== undefined) {
                cleanData.last_name = last_name.trim();
            }
            
            if (email !== undefined) {
                cleanData.email = email && email.trim() !== '' ? email.trim() : null;
            }
            
            if (phone !== undefined) {
                cleanData.phone = phone && phone.trim() !== '' ? phone.trim() : null;
            }
            
            if (event_id !== undefined) {
                cleanData.event_id = parseInt(event_id);
            }
            
            if (companions_count !== undefined) {
                cleanData.companions_count = parseInt(companions_count) || 1;
            }

            const result = await AttendeeModel.update(req.params.id, cleanData);
            if (result.changes === 0) {
                return res.status(404).json({ error: 'Participant non trouvé' });
            }
            res.json({ message: 'Participant mis à jour avec succès' });
        } catch (error) {
            if (error.message.includes('UNIQUE constraint failed')) {
                res.status(400).json({ 
                    error: 'Ce participant est déjà inscrit à cet événement' 
                });
            } else {
                res.status(500).json({ error: error.message });
            }
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