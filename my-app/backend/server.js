const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const { createDecipheriv, createCipheriv, randomBytes } = require('crypto');
const QRCode = require('qrcode');
const path = require('path');
const connectDB = require('./db');
const User = require('./models/User');

const app = express();
const port = 3001;

connectDB();

app.use(bodyParser.json());
app.use(cors());

const keyFilePath = 'secret.key';
const ivFilePath = 'iv.key';
const savesDir = path.join(__dirname, 'saves');

// Funktion zum Generieren und Speichern des Schlüssels
const generateAndSaveKey = () => {
  const key = randomBytes(32).toString('hex'); // Generieren eines 256-Bit-Schlüssels (32 Bytes)
  fs.writeFileSync(keyFilePath, key, 'utf8');
  return key;
};

// Funktion zum Generieren und Speichern des IV
const generateAndSaveIV = () => {
  const iv = randomBytes(16).toString('hex'); // Generieren eines 128-Bit-IV (16 Bytes)
  fs.writeFileSync(ivFilePath, iv, 'utf8');
  return iv;
};

// Funktion zum Laden des Schlüssels aus der Datei
const loadKey = () => {
  if (!fs.existsSync(keyFilePath) || fs.readFileSync(keyFilePath, 'utf8').trim() === '') {
    return generateAndSaveKey();
  }
  return fs.readFileSync(keyFilePath, 'utf8').trim();
};

// Funktion zum Laden des IV aus der Datei
const loadIV = () => {
  if (!fs.existsSync(ivFilePath) || fs.readFileSync(ivFilePath, 'utf8').trim() === '') {
    return generateAndSaveIV();
  }
  return fs.readFileSync(ivFilePath, 'utf8').trim();
};

const key = loadKey(); // Laden des Schlüssels
const iv = loadIV(); // Laden des IV

// Sicherstellen, dass der saves-Ordner existiert
if (!fs.existsSync(savesDir)) {
  fs.mkdirSync(savesDir);
}

app.post('/api/qr-code', async (req, res) => {
  console.log('Empfangene Anfrage:', req.body); // Loggen der gesamten Anfrage
  const { data } = req.body; // Verwenden von req.body statt req.data
  console.log('Empfangene QR-Code-Daten:', data);

  if (!data) {
    return res.status(400).json({ message: 'Ungültige QR-Code-Daten' });
  }

  try {
    const decipher = createDecipheriv('aes-256-cbc', Buffer.from(key, 'hex'), Buffer.from(iv, 'hex'));
    let decrypted = decipher.update(data, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    console.log('Entschlüsselter Inhalt:', decrypted);

    // Überprüfen, ob die E-Mail in der Datenbank vorhanden ist
    const user = await User.findOne({ email: decrypted });
    if (user) {
      console.log('E-Mail in der Datenbank gefunden:', user);
      res.json({ message: 'QR-Code-Daten erfolgreich empfangen', data: decrypted, name: user.name, participated: user.participated });
    } else {
      res.status(404).json({ message: 'E-Mail nicht in der Datenbank gefunden' });
    }
  } catch (error) {
    console.error('Fehler beim Entschlüsseln der QR-Code-Daten:', error);
    res.status(500).json({ message: 'Fehler beim Entschlüsseln der QR-Code-Daten' });
  }
});

app.post('/api/generate-qr-code', (req, res) => {
  const { email } = req.body;
  console.log('Empfangene E-Mail-Adresse:', email);

  try {
    const cipher = createCipheriv('aes-256-cbc', Buffer.from(key, 'hex'), Buffer.from(iv, 'hex'));
    let encrypted = cipher.update(email, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const qrCodePath = path.join(savesDir, `${Date.now()}.png`);
    QRCode.toFile(qrCodePath, encrypted, (err) => {
      if (err) {
        console.error('Fehler beim Erstellen des QR-Codes:', err);
        return res.status(500).json({ message: 'Fehler beim Erstellen des QR-Codes' });
      }
      console.log('QR-Code erfolgreich erstellt und gespeichert:', qrCodePath);
      res.json({ message: 'QR-Code erfolgreich erstellt und gespeichert', path: qrCodePath });
    });
  } catch (error) {
    console.error('Fehler beim Verschlüsseln der E-Mail-Adresse:', error);
    res.status(500).json({ message: 'Fehler beim Verschlüsseln der E-Mail-Adresse' });
  }
});

app.post('/api/confirm-participation', async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOneAndUpdate({ email }, { participated: true }, { new: true });
    if (user) {
      console.log('Teilnahme bestätigt:', user);
      res.json({ message: 'Teilnahme bestätigt', user });
    } else {
      res.status(404).json({ message: 'E-Mail nicht in der Datenbank gefunden' });
    }
  } catch (error) {
    console.error('Fehler beim Bestätigen der Teilnahme:', error);
    res.status(500).json({ message: 'Fehler beim Bestätigen der Teilnahme' });
  }
});

// Neue Route zum Hinzufügen eines Benutzers
app.post('/api/add-user', async (req, res) => {
  const { email, name } = req.body;
  try {
    const newUser = new User({ email, name });
    await newUser.save();
    res.json({ message: 'Benutzer erfolgreich hinzugefügt', user: newUser });
  } catch (error) {
    console.error('Fehler beim Hinzufügen des Benutzers:', error);
    res.status(500).json({ message: 'Fehler beim Hinzufügen des Benutzers' });
  }
});

app.listen(port, () => {
  console.log(`Server läuft auf http://localhost:${port}`);
});