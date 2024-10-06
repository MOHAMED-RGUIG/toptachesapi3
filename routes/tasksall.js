// src/routes/tasksall.js

import express from 'express';
import sql from '../database.js'; // Ensure your database connection is correct

const router = express.Router();

// Middleware to extract user from headers
function getUserFromHeaders(req, res, next) {
  const usrHeader = req.headers['usr'];
  if (!usrHeader) {
    return res.status(400).json({ error: 'USR header is required' });
  }
  req.USR = usrHeader;
  next();
}

// Route to get all tasks for a user
router.get('/tasksall', getUserFromHeaders, async (req, res) => {
  try {
    const USR = req.USR; // Extract `USR` from the request

    const request = new sql.Request(); // Create a new SQL request

    // Define the query to retrieve all tasks for the user
    const query = `
      SELECT *
      FROM TASK
      WHERE USR = @USR
    `;

    request.input('USR', sql.NVarChar, USR); // Bind the user to the query

    const result = await request.query(query); // Execute the query

    // Send back the tasks to the client
    res.status(200).json({
      success: true,
      data: result.recordset, // Return the task records
      message: 'Tasks retrieved successfully',
    });
  } catch (err) {
    console.error('Error fetching tasks for user:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
