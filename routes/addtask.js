import express from 'express';
import sql from '../database.js'; // Database configuration
import moment from 'moment-timezone'; // Moment.js for date handling

const router = express.Router();

// Utility function to validate time in HH:mm format
function isValidTime(time) {
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return timeRegex.test(time);
}

// Utility function to normalize time (optional, in case you need specific formatting)
function normalizeTime(time) {
  return isValidTime(time) ? time : null;
}

// Middleware to extract user information from headers
function getUserFromHeaders(req, res, next) {
  const usrHeader = req.headers['usr'];
  if (!usrHeader) {
    return res.status(400).json({ error: 'USR header is required' });
  }
  req.USR = usrHeader;
  next();
}

// Route to add a task
router.post('/tasks', getUserFromHeaders, async (req, res) => {
  const usr = req.USR; // Extract `req.USR`
  const {
    TSKTYP,
    TSKACT,
    DATDEB,
    HURDEB,
    HURFIN,
    CLI,
    NOMCLI,
    CATCLI,
    ADRCLI,
    NOMCNT,
    FNCCNT,
    TELCNT,
    TSKOBJ,
    TSKCMR,
    TSKSTA,
  } = req.body;

  // Validate time and task action fields
  if (!usr) {
    return res.status(400).json({ error: 'USR must be set' });
  }

  if (!TSKACT) {
    return res.status(400).json({ error: 'TSKACT must be defined' });
  }

  if (!isValidTime(HURDEB)) {
    return res.status(400).json({ error: 'Invalid time format for HURDEB' });
  }

  if (!isValidTime(HURFIN)) {
    return res.status(400).json({ error: 'Invalid time format for HURFIN' });
  }

  // Normalize time and date fields
  const normalizedHURDEB = normalizeTime(HURDEB);
  const normalizedHURFIN = normalizeTime(HURFIN);
  const dateInUTC = moment.tz(DATDEB, "UTC").format("YYYY-MM-DD");

  try {
    const request = new sql.Request();

    // Bind inputs to SQL parameters
    request.input('USR', sql.NVarChar, usr);
    request.input('TSKTYP', sql.NVarChar, TSKTYP);
    request.input('TSKACT', sql.NVarChar, TSKACT);
    request.input('DATDEB', sql.Date, dateInUTC);
    request.input('HURDEB', sql.NVarChar, normalizedHURDEB);
    request.input('HURFIN', sql.NVarChar, normalizedHURFIN);
    request.input('CLI', sql.NVarChar, CLI);
    request.input('NOMCLI', sql.NVarChar, NOMCLI);
    request.input('CATCLI', sql.NVarChar, CATCLI);
    request.input('ADRCLI', sql.NVarChar, ADRCLI);
    request.input('NOMCNT', sql.NVarChar, NOMCNT);
    request.input('FNCCNT', sql.NVarChar, FNCCNT);
    request.input('TELCNT', sql.NVarChar, TELCNT);
    request.input('TSKOBJ', sql.NVarChar, TSKOBJ);
    request.input('TSKCMR', sql.NVarChar, TSKCMR);
    request.input('TSKSTA', sql.NVarChar, TSKSTA);

    // SQL query for inserting task
    const query = `
      INSERT INTO TASK (USR, TSKTYP, TSKACT, DATDEB, HURDEB, HURFIN, CLI, NOMCLI, CATCLI, ADRCLI, NOMCNT, FNCCNT, TELCNT, TSKOBJ, TSKCMR, TSKSTA)
      VALUES (@USR, @TSKTYP, @TSKACT, @DATDEB, @HURDEB, @HURFIN, @CLI, @NOMCLI, @CATCLI, @ADRCLI, @NOMCNT, @FNCCNT, @TELCNT, @TSKOBJ, @TSKCMR, @TSKSTA)
    `;

    // Execute query
    await request.query(query);

    // Send success response
    res.status(201).json({ success: true, message: 'Task created successfully' });
  } catch (err) {
    console.error('Error creating task:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
