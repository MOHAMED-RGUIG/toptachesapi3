import express from 'express';
import sql from '../database.js'; // Adjust the path as needed

const router = express.Router();

// Middleware to fetch user information if not part of the route already
function getUserFromHeaders(req, res, next) {
    const usrHeader = req.headers['usr'];
    if (!usrHeader) {
      return res.status(400).json({ error: 'USR header is required' });
    }
    req.USR = usrHeader;
    next();
  }

router.get('/test-tasks-tomorrow', getUserFromHeaders, async (req, res) => {
  const usr = req.USR;
  console.log(`Fetching tasks for tomorrow for user: ${usr}`);

  try {
    const request = new sql.Request();
    request.input('USR', sql.NVarChar, usr);

    const query = `
      SELECT TSKNUM, TSKTYP, TSKACT, DATDEB, HURDEB, HURFIN, 
             CLI, NOMCLI, CATCLI, ADRCLI, NOMCNT, FNCCNT, 
             TELCNT, TSKOBJ, TSKCMR, TSKSTA
      FROM TASK
      WHERE DATDEB = CONVERT(date, DATEADD(day, 1, GETDATE())) AND USR = @USR
    `;

    const result = await request.query(query);

    if (result.recordset.length > 0) {
      console.log('Tasks found:', result.recordset);
      res.status(200).json({
        success: true,
        data: result.recordset,
        message: 'Tasks retrieved successfully for tomorrow'
      });
    } else {
      res.status(404).json({ success: false, message: 'No tasks found for tomorrow' });
    }
  } catch (err) {
    console.error('Error fetching tasks for tomorrow:', err.message);
    res.status(500).json({ error: 'Internal Server Error', message: err.message });
  }
});

export default router;
