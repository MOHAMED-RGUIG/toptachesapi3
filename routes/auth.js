// src/routes/auth.js
import express from 'express';
import sql from '../database.js'; // Ensure the path is correct

const router = express.Router();

// Login Route
router.post('/login', async (req, res) => {
  const { USR, MotDePasse } = req.body;
  try {
      const query = `
          SELECT ID,USR, NOMUSR, PRNUSR, EMAILUSR, TELEP, MotDePasse, TYPUSR
          FROM Users
          WHERE USR = @USR AND MotDePasse = @MotDePasse
      `;
      const request = new sql.Request();
      request.input('USR', sql.NVarChar, USR);
      request.input('MotDePasse', sql.NVarChar, MotDePasse);
      const result = await request.query(query);
      if (result.recordset && result.recordset.length > 0) {
          const insertLoginTime = `
              INSERT INTO CONNEXION (USR, DATCONN)
              VALUES (@USR, GETDATE())
          `;
          await request.query(insertLoginTime);
           const user = result.recordset[0];
          res.status(200).json({
              success: true,
              message: 'Login successful',
              data: result.recordset[0]
          });
            const currentUser = {
                EMAILUSR: user.EMAILUSR,
                ID: user.ID,
                NOMUSR: user.NOMUSR,
                TELEP: user.TELEP
            };
            res.send(currentUser);
      } else {
          res.status(401).json({ success: false, message: 'Invalid username or password' });
      }
  } catch (err) {
      console.error('Error processing login:', err);
      res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
