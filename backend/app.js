const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const multer = require('multer');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();

// Activer CORS et BodyParser
app.use(cors());
app.use(bodyParser.json());

// Configuration du stockage des images avec Multer
const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        const uploadDir = './images';
        callback(null, uploadDir);
    },
    filename: (req, file, callback) => {
        const fileName = `${Date.now()}-${file.originalname}`;
        callback(null, fileName);
    }
});
const upload = multer({ storage: storage });

// Dossier statique pour les images
app.use('/images', express.static('images'));

// Connexion à MySQL
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'vetement',
    port: '3306'
});

connection.connect(err => {
    if (err) {
        console.error('Erreur de connexion à MySQL :', err);
    } else {
        console.log('Connexion à MySQL réussie !');
    }
});

// Routes pour les sélections de base de données
app.get('/vetements', (req, res) => {
    connection.query('SELECT * FROM vetement', (error, results) => {
        if (error) {
            console.error('Erreur lors de la requête SELECT :', error);
            res.status(500).json({ error: 'Erreur serveur lors de la requête SELECT.' });
        } else {
            res.status(200).json(results);
        }
    });
});

app.get('/articles', (req, res) => {
    connection.query('SELECT * FROM article', (error, results) => {
        if (error) {
            console.error('Erreur lors de la requête SELECT :', error);
            res.status(500).json({ error: 'Erreur serveur lors de la requête SELECT.' });
        } else {
            res.status(200).json(results);
        }
    });
});

app.get('/utilisateurs', (req, res) => {
    connection.query('SELECT * FROM utilisateur', (error, results) => {
        if (error) {
            console.error('Erreur lors de la requête SELECT :', error);
            res.status(500).json({ error: 'Erreur serveur lors de la requête SELECT.' });
        } else {
            res.status(200).json(results);
        }
    });
});

app.get('/commandes', (req, res) => {
    connection.query('SELECT * FROM commande', (error, results) => {
        if (error) {
            console.error('Erreur lors de la requête SELECT :', error);
            res.status(500).json({ error: 'Erreur serveur lors de la requête SELECT.' });
        } else {
            res.status(200).json(results);
        }
    });
});

app.get('/commande_articles', (req, res) => {
    connection.query('SELECT * FROM commande_article', (error, results) => {
        if (error) {
            console.error('Erreur lors de la requête SELECT :', error);
            res.status(500).json({ error: 'Erreur serveur lors de la requête SELECT.' });
        } else {
            res.status(200).json(results);
        }
    });
});

app.get('/utilisateurs/:email', (req, res) => {
    const userEmail = req.params.email;
    connection.query('SELECT email FROM utilisateur WHERE email = ?', [userEmail], (error, results) => {
        if (error) {
            console.error('Erreur lors de la requête SELECT :', error);
            res.status(500).json({ error: 'Erreur serveur lors de la requête SELECT.' });
        } else {
            if (results.length > 0) {
                res.status(200).json({ email: results[0].email });
            } else {
                res.status(404).json({ error: 'Aucun utilisateur trouvé avec cet email.' });
            }
        }
    });
});

app.get('/:id', (req, res) => {
    const vetementId = req.params.id;
    connection.query('SELECT * FROM vetement WHERE id = ?', [vetementId], (error, results) => {
        if (error) {
            console.error('Erreur lors de la requête SELECT :', error);
            res.status(500).json({ error: 'Erreur serveur lors de la requête SELECT.' });
        } else {
            if (results.length > 0) {
                res.status(200).json(results[0]);
            } else {
                res.status(404).json({ error: 'Aucun vêtement trouvé avec cet ID.' });
            }
        }
    });
});

app.put('/:id', (req, res) => {
    const vetementId = req.params.id;
    const updatedVetementData = req.body;
    connection.query('UPDATE vetement SET ? WHERE id = ?', [updatedVetementData, vetementId], (error) => {
        if (error) {
            console.error('Erreur lors de la requête UPDATE :', error);
            res.status(500).json({ error: 'Erreur serveur lors de la requête UPDATE.' });
        } else {
            connection.query('SELECT * FROM vetement WHERE id = ?', [vetementId], (selectError, selectResults) => {
                if (selectError) {
                    console.error('Erreur lors de la récupération des données mises à jour :', selectError);
                    res.status(500).json({ error: 'Erreur serveur lors de la récupération des données mises à jour.' });
                } else {
                    if (selectResults.length > 0) {
                        res.status(200).json(selectResults[0]);
                    } else {
                        res.status(404).json({ error: 'L\'objet n\'existe pas.' });
                    }
                }
            });
        }
    });
});

app.post('/upload', upload.single('image'), (req, res) => {
    if (req.file) {
        const imageUrl = `http://localhost:3001/images/${req.file.filename}`;
        const vetementId = req.body.vetementId;
        connection.query('UPDATE vetement SET cover = ? WHERE id = ?', [imageUrl, vetementId], (error) => {
            if (error) {
                console.error('Erreur mise à jour du champ cover dans MySQL :', error);
                res.status(500).json({ error: 'Erreur serveur lors de la mise à jour de l\'image.' });
            } else {
                res.status(200).json({ imageUrl });
            }
        });
    } else {
        res.status(400).json({ error: 'Aucun fichier téléchargé.' });
    }
});

app.post('/addCommande', (req, res) => {
    const { utilisateurId, articles } = req.body;
    const date = new Date();
    connection.query('INSERT INTO commande (date, id_utilisateur) VALUES (?, ?)', [date, utilisateurId], (error, results) => {
        if (error) {
            console.error('Erreur lors de l\'insertion de la commande :', error);
            res.status(500).json({ error: 'Erreur serveur lors de l\'insertion de la commande.' });
            return;
        }

        const commandeId = results.insertId;
        const commandeArticles = articles.map(article => [commandeId, article.id, article.amount]);

        connection.query('INSERT INTO commande_article (id_commande, id_article, quantite) VALUES ?', [commandeArticles], (error) => {
            if (error) {
                console.error('Erreur lors de l\'insertion des articles de la commande :', error);
                res.status(500).json({ error: 'Erreur serveur lors de l\'insertion des articles de la commande.' });
            } else {
                res.status(200).json({ message: 'Commande ajoutée avec succès.' });
            }
        });
    });
});


// Route pour mettre à jour un vêtement
app.put('/vetements/:id', (req, res) => {
    const vetementId = req.params.id;
    const updatedData = req.body;

    connection.query('UPDATE vetement SET ? WHERE id = ?', [updatedData, vetementId], (error, results) => {
        if (error) {
            console.error('Erreur lors de la mise à jour du vêtement :', error);
            res.status(500).json({ error: 'Erreur serveur lors de la mise à jour du vêtement.' });
        } else {
            res.status(200).json({ message: 'Vêtement mis à jour avec succès.' });
        }
    });
});






app.post('/login', (req, res) => {
    const { email, password } = req.body;
    connection.query('SELECT * FROM utilisateur WHERE email = ?', [email], (error, results) => {
        if (error) {
            console.error('Erreur lors de la recherche de l\'utilisateur dans la base de données :', error);
            res.status(500).json({ error: 'Erreur serveur lors de l\'authentification.' });
        } else {
            if (results.length > 0) {
                const hashedPasswordFromDB = results[0].password;
                bcrypt.compare(password, hashedPasswordFromDB, (compareError, match) => {
                    if (compareError) {
                        console.error('Erreur lors de la comparaison des mots de passe :', compareError);
                        res.status(500).json({ error: 'Erreur serveur lors de l\'authentification.' });
                    } else {
                        if (match) {
                            const userId = results[0].id;
                            const token = jwt.sign({ userId }, 'votre_clé_secrète', { expiresIn: '24h' });
                            res.status(200).json({ message: 'Authentification réussie.', userId, token });
                        } else {
                            res.status(401).json({ error: 'Identifiants incorrects.' });
                        }
                    }
                });
            } else {
                res.status(401).json({ error: 'Identifiants incorrects.' });
            }
        }
    });
});

app.post('/signup', async (req, res) => {
    const { email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const sql = 'INSERT INTO utilisateur (email, password) VALUES (?, ?)';
    connection.query(sql, [email, hashedPassword], (error, results) => {
        if (error) {
            res.status(500).json({ error: 'Erreur lors de l\'insertion.' });
        } else {
            res.status(201).json({ message: 'Utilisateur ajouté avec succès.', id: results.insertId });
        }
    });
});

module.exports = app;
