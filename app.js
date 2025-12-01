// app.js
const express = require('express');
const path = require('path');
const cors = require('cors');

// Import des routes
const eventRoutes = require('./routes/eventRoutes');
const locationRoutes = require('./routes/locationRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const attendeeRoutes = require('./routes/attendeeRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express. json());
app.use(express.urlencoded({ extended: true }));

// Servir les fichiers statiques
app.use(express.static(path.join(__dirname, 'public')));

// Routes API
app.use('/api/events', eventRoutes);
app. use('/api/locations', locationRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/attendees', attendeeRoutes);

// Route par défaut pour servir index.html
app.get('/', (req, res) => {
    res.sendFile(path. join(__dirname, 'public', 'index.html'));
});

// Gestion des erreurs 404
app.use((req, res) => {
    res.status(404).json({ error: 'Route non trouvée' });
});

// Gestion des erreurs globales
app.use((err, req, res, next) => {
    console.error(err. stack);
    res.status(500).json({ error: 'Erreur interne du serveur' });
});

app.listen(PORT, () => {
    console.log(`Serveur démarré sur http://localhost:${PORT}`);
});

module.exports = app;