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
    const isPasswordValid = password === user.password_hash || await bcrypt.compare(password, user.password_hash);

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
app.listen(PORT, () => {
  console.log(`Backend-ul rulează pe portul ${PORT}`);
});
