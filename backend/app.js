const express = require('express'); //on importe express
const cors = require('cors'); // Importez le module cors
const mysql = require('mysql2'); //on importe mysql2 
const bodyParser = require('body-parser');
// Middleware pour gérer les fichiers images
const multer = require('multer'); 

//app sera notre application express
const app = express();


//on importe bcrypt
const bcrypt = require('bcrypt'); 

//on importe le token JWT
const jwt = require('jsonwebtoken');












    // suite slide suivant 
// Activez CORS pour toutes les routes
app.use(cors());// Connexion à MySQL
app.use(bodyParser.json());


// Configuration du dossier où les images seront stockées
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

// Définir le dossier contenant vos images comme dossier statique
app.use('/images', express.static('images'));


const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'vetement',
    port :'3306'
});
connection.connect(err => {
    if (err) {
        console.error('Erreur de connexion à MySQL :', err);
    } else {
        console.log('Connexion à MySQL réussie !');
    }
});
// Exemple de requête SELECT à partir de votre table vêtement
app.get('/vetements', (req, res, next) => {
    connection.query('SELECT * FROM vetement', (error, results) => {
        if (error) {
            console.error('Erreur lors de la requête SELECT :', error);
            res.status(500).json({ error: 'Erreur serveur lors de la requête SELECT.' });
        } else {
            res.status(200).json(results);
        }
    });
});


// Exemple de requête SELECT à partir de votre table vêtement
app.get('/articles', (req, res, next) => {
    connection.query('SELECT * FROM article', (error, results) => {
        if (error) {
            console.error('Erreur lors de la requête SELECT :', error);
            res.status(500).json({ error: 'Erreur serveur lors de la requête SELECT.' });
        } else {
            res.status(200).json(results);
        }
    });
});

// Exemple de requête SELECT à partir de votre table utilisateur
app.get('/utilisateurs', (req, res, next) => {
    connection.query('SELECT * FROM utilisateur', (error, results) => {
        if (error) {
            console.error('Erreur lors de la requête SELECT :', error);
            res.status(500).json({ error: 'Erreur serveur lors de la requête SELECT.' });
        } else {
            res.status(200).json(results);
        }
    });
});

// Exemple de requête SELECT à partir de votre table utilisateur pour récupérer un seul utilisateur par son email
app.get('/utilisateurs/:email', (req, res, next) => {
    const userEmail = req.params.email;
    connection.query('SELECT email FROM utilisateur WHERE email = ?', [userEmail], (error, results) => {
        if (error) {
            console.error('Erreur lors de la requête SELECT :', error);
            res.status(500).json({ error: 'Erreur serveur lors de la requête SELECT.' });
        } else {
            if (results.length > 0) {
                // Si des résultats sont trouvés, renvoyer l'email de l'utilisateur trouvé
                res.status(200).json({ email: results[0].email });
            } else {
                // Si aucun résultat n'est trouvé, renvoyer une réponse 404
                res.status(404).json({ error: 'Aucun utilisateur trouvé avec cet email.' });
            }
        }
    });
});


//je récupère un seul vêtement en fonction de son id
app.get('/:id', (req, res, next) => {
    const vetementId = req.params.id;
    connection.query('SELECT * FROM vetement WHERE id = ?', [vetementId], (error, results) => {
        if (error) {
            console.error('Erreur lors de la requête SELECT :', error);
            res.status(500).json({ error: 'Erreur serveur lors de la requête SELECT.' });
        } else {
            if (results.length > 0) {
                // Si des résultats sont trouvés, renvoyer le premier élément (le vêtement trouvé)
                res.status(200).json(results[0]);
            } else {
                // Si aucun résultat n'est trouvé, renvoyer une réponse 404
                res.status(404).json({ error: 'Aucun vêtement trouvé avec cet ID.' });
            }
        }
    });
});
//on modifie un seul vêtement en fonction de son id   
app.put('/:id', (req, res, next) => {
    const vetementId = req.params.id;
    const updatedVetementData = req.body;
    connection.query('UPDATE vetement SET ? WHERE id = ?', [updatedVetementData, vetementId], (error, results) => {
        if (error) {
            console.error('Erreur lors de la requête UPDATE :', error);
            res.status(500).json({ error: 'Erreur serveur lors de la requête UPDATE.' });
        } else {
            // Après la mise à jour, récupérez à nouveau les données mises à jour
            const selectQuery = 'SELECT * FROM vetement WHERE id = ?';
            connection.query(selectQuery, [vetementId], (selectError, selectResults) => {
                if (selectError) {
                    console.error('Erreur lors récupération données mises à jour :', selectError);
                    res.status(500).json({ error: 'Erreur serveur récupération données mises à jour.' });
                } else {
                    if (selectResults.length > 0) {                                    
                        res.status(200).json(selectResults[0]); // Renvoyez données mises à jour en réponse
                    } else {
                        res.status(404).json({ error: 'L\'objet n\'existe pas.' }); }   
                }   
            });
        }
    });
});

// Route pour gérer le téléchargement d'images
app.post('/upload', upload.single('image'), async (req, res) => {
    try {
        // req.file contient les informations sur le fichier téléchargé
        if (req.file) { // Si true, le fichier a été téléchargé avec succès
            const imageUrl = `http://localhost:3001/images/${req.file.filename}`;
            // Mise à jour du champ 'cover' dans MySQL avec la nouvelle URL de l'image
            const vetementId = req.body.vetementId; // Assurez-vous d'envoyer l'ID du vêtement avec
            // la requête POST (côté Front)
            const updateQuery = 'UPDATE vetement SET cover = ? WHERE id = ?';
            connection.query(updateQuery, [imageUrl, vetementId], (error, results) => {
                if (error) {
                    console.error('Erreur mise à jour du champ cover dans MySQL :', error);
                    res.status(500).json({ error: 'Erreur serveur lors mise à jour image.' });
                } else {
                    // Après la MAJ image, on peut renvoyer l'URL de l'image comme réponse si besoin
                    res.status(200).json({ imageUrl: imageUrl }); 
                }
            });
        } else {
            res.status(400).json({ error: 'Aucun fichier téléchargé.' }); 
        }
    } catch (error) {
        console.error('Erreur mise à jour du champ cover dans MySQL :', error);
        res.status(500).json({ error: 'Erreur serveur lors mise à jour image.' });
    }
    
});




// Route pour gérer l'authentification de l'utilisateur
app.post('/login', (req, res, next) => {
    const { email, password } = req.body;
    // Récupérer le mot de passe haché de l'utilisateur depuis la base de données
    connection.query('SELECT * FROM utilisateur WHERE email = ?', [email], (error, results) => {
    if (error) {
    console.error('Erreur lors recherche utilisateur dans base de données :', error);
    res.status(500).json({ error: 'Erreur serveur lors authentification.' });
    } else {
        if (results.length > 0) {
            const hashedPasswordFromDB = results[0].password;
            // Comparer le mot de passe fourni avec le mot de passe haché stocké dans MySQL
            bcrypt.compare(password, hashedPasswordFromDB, (compareError, match) => {
                if (compareError) {
                    console.error('Erreur lors comparaison des mots de passe :', compareError);
                    res.status(500).json({ error: 'Erreur serveur lors authentification.' });
                } else {
                    if (match) {
                        const userId = results[0].id; // 'id' est la colonne contenant l'ID utilisateur
                        // Générer un token JWT
                        const token = jwt.sign({ userId }, 'votre_clé_secrète', { expiresIn: '24h' });
                        res.status(200).json({ message: 'Authentification réussie.', userId: userId, token : token });
                    } else {
                        res.status(401).json({ error: 'Identifiants incorrects.' });
                    }
                }
            });
        } else {
            res.status(401).json({ error: 'Identifiants incorrects.' });
} } });});



//signup

app.post('/signup',async (req, res, next) => {
    const { email, password } = req.body;
    // Récupérer le mot de passe haché de l'utilisateur depuis la base de données
    const sql='INSERT INTO utilisateur (email,password) VALUES (?,?) ';
    const hashedpasswpord= await bcrypt.hash(password,10)
    try{
    connection.query(sql,[email,hashedpasswpord], (error, results) => {
        if (error) {
            res.status(500).json({ error: 'Error during insertion.' });
        } else {
            res.status(201).json({ message: 'User added successfully.', id: results.insertId });
        }
    });
} catch (error) {
    res.status(500).json({ error: 'Failed to hash password.' });
}

 
});



module.exports = app;
