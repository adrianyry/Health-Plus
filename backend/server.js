const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');

const app = express();
app.use(express.json());
app.use(cors());

// Conexiunea la PostgreSQL folosind variabilele de mediu din Kubernetes
const pool = new Pool({
  host: process.env.DB_HOST || 'postgres-service',
  user: process.env.DB_USER || 'health_user',
  password: process.env.DB_PASSWORD || 'health_password_123',
  database: process.env.DB_NAME || 'health_plus_db',
  port: 5432,
});

// Ruta de Login
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Email sau parolă incorectă' });
    }

    const user = result.rows[0];

    // Pentru test, dacă parolele din DB nu au fost criptate cu bcrypt, 
    // poți face o verificare simplă sau folosi bcrypt.compare
    // (Presupunând că ai pus un hash sau parola direct, ajustează după caz)
    //const isPasswordValid = password === user.password_hash || await bcrypt.compare(password, user.password_hash);
    const isPasswordValid = password === user.password || await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Email sau parolă incorectă' });
    }

    // Generăm JWT-ul cu rolul inclus
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role, name: user.full_name },
      process.env.JWT_SECRET || 'secret_key_super_sigur',
      { expiresIn: '2h' }
    );

    res.json({
      message: 'Autentificare reușită',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.full_name,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Eroare la login:', error);
    res.status(500).json({ message: 'Eroare internă de server' });
  }
});

const PORT = process.env.PORT || 5000;
// Endpoint de Health Check pentru Kubernetes
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'UP', message: 'Backend is healthy!' });
});
app.listen(PORT, () => {
  console.log(`Backend-ul rulează pe portul ${PORT}`);
});

// Endpoint pentru înregistrare
app.post('/api/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email-ul și parola sunt obligatorii!' });
    }

    // Criptarea parolei
    const hashedPassword = await bcrypt.hash(password, 10);

    // Inserarea în baza de date
    const query = 'INSERT INTO users (email, password, name) VALUES ($1, $2, $3) RETURNING id, email, name';
    const values = [email, hashedPassword, name || 'Utilizator'];
    
    const result = await pool.query(query, values);
    
    res.status(201).json({ 
      message: 'Cont creat cu succes!', 
      user: result.rows[0] 
    });
  } catch (err) {
    console.error('Eroare la înregistrare:', err);
    if (err.code === '23505') { // Codul PostgreSQL pentru duplicate key (email existent)
      return res.status(400).json({ error: 'Acest email este deja folosit!' });
    }
    res.status(500).json({ error: 'Eroare internă de server' });
  }
});

// Endpoint pentru adăugarea programărilor
app.post('/api/appointments', async (req, res) => {
  const { patientName, phone, gender, appointmentTime, mode } = req.body;
  try {
    const query = `INSERT INTO appointments (patient_name, phone, gender, appointment_time, mode) VALUES ($1, $2, $3, $4, $5) RETURNING *`;
    const values = [patientName, phone, gender, appointmentTime, mode];
    const result = await pool.query(query, values);
    
    // Mesaj de confirmare vizibil în logurile backend-ului
    console.log(`Programare nouă înregistrată cu succes pentru: ${patientName} (${phone})`);
    
    res.status(201).json({ success: true, appointment: result.rows[0] });
  } catch (err) {
    console.error('Eroare la salvarea programării:', err);
    res.status(500).json({ error: 'Eroare la salvarea programării în baza de date.' });
  }
});
