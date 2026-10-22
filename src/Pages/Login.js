import React, { useState } from 'react';
import axios from 'axios';

function Login() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const endpoint = isRegistering ? '/api/register' : '/api/login';
    const payload = isRegistering ? { email, password, name } : { email, password };

    try {
      const response = await axios.post(endpoint, payload);
      
      if (isRegistering) {
        setSuccess('Cont creat cu succes! Acum te poți autentifica.');
        setIsRegistering(false); // Comută automat înapoi la formularul de login
        setPassword('');
      } else {
        // Dacă login-ul reușește, salvează token-ul (dacă există) și redirecționează utilizatorul
        if (response.data.token) {
          localStorage.setItem('token', response.data.token);
        }
        window.location.href = '/'; 
      }
    } catch (err) {
      setError(err.response?.data?.error || 'A apărut o eroare. Încearcă din nou.');
    }
  };

  return (
    <div className="login-container" style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h2>{isRegistering ? 'Creează un cont nou' : 'Autentificare'}</h2>
      
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>{success}</p>}

      <form onSubmit={handleSubmit}>
        {isRegistering && (
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Nume:</label>
            <input 
              type="text" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              required 
              style={{ width: '100%', padding: '8px' }}
            />
          </div>
        )}
        
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Email:</label>
          <input 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
            style={{ width: '100%', padding: '8px' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Parolă:</label>
          <input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
            style={{ width: '100%', padding: '8px' }}
          />
        </div>

        <button 
          type="submit" 
          style={{ width: '100%', padding: '10px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          {isRegistering ? 'Înregistrează-te' : 'Intră în cont'}
        </button>
      </form>

      <button 
        onClick={() => { setIsRegistering(!isRegistering); setError(''); setSuccess(''); }} 
        style={{ width: '100%', marginTop: '10px', padding: '8px', background: 'none', border: 'none', color: '#007bff', cursor: 'pointer', textDecoration: 'underline' }}
      >
        {isRegistering ? 'Ai deja cont? Autentifică-te' : 'Nu ai cont? Înregistrează-te'}
      </button>
    </div>
  );
}

export default Login;
