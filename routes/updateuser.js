// src/routes/user.js
import express from 'express';
import sql from '../database.js'; // Database configuration

const router = express.Router();

// Route to update user details
router.put('/updateUser/:USR', async (req, res) => {
  const { USR } = req.params;
  const { NOMUSR, PRNUSR, EMAILUSR, TELEP, MotDePasse } = req.body;

  try {
    const request = new sql.Request();
    request.input('USR', sql.NVarChar, USR);
    request.input('NOMUSR', sql.NVarChar, NOMUSR);
    request.input('PRNUSR', sql.NVarChar, PRNUSR);
    request.input('EMAILUSR', sql.NVarChar, EMAILUSR);
    request.input('TELEP', sql.NVarChar, TELEP);
    request.input('MotDePasse', sql.NVarChar, MotDePasse); // Assuming password update as well

    const updateQuery = `
      UPDATE Users
      SET NOMUSR = @NOMUSR, PRNUSR = @PRNUSR, EMAILUSR = @EMAILUSR, 
          TELEP = @TELEP, MotDePasse = @MotDePasse
      WHERE USR = @USR
    `;
    
    await request.query(updateQuery);
    res.json({ success: true, message: 'User updated successfully' });
  } catch (err) {
    console.error('SQL error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
