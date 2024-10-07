// src/routes/user.js (Assuming user.js contains your user routes)
import express from 'express';
import sql from '../database.js'; // Database configuration

const router = express.Router();

// Route to get user details
router.get('/getUserDetails/:USR', async (req, res) => {
  const { USR } = req.params;
  try {
    const request = new sql.Request();
    request.input('USR', sql.NVarChar, USR);
    const query = `
      SELECT USR, NOMUSR, PRNUSR, EMAILUSR, TELEP, MotDePasse, TYPUSR
      FROM Users
      WHERE USR = @USR
    `;
    const result = await request.query(query);
    if (result.recordset.length > 0) {
    res.status(200).json({
    success: true,
    data: result.recordset[0],
    message: 'User details retrieved successfully'
  });
    } else {
      res.status(404).json({ success: false, message: 'User not found' });
    }
  } catch (err) {
    console.error('SQL error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
