import express from 'express';
import sql from '../database.js'; // Adjust the path if needed

const router = express.Router();

router.get('/taskbynum/:tsknum', async (req, res) => {
  const { tsknum } = req.params;
  const usr = req.headers.usr; // Assuming USR is sent as a header for security

  if (!usr) {
    return res.status(401).json({ success: false, message: "User not authenticated." });
  }

  try {
    const request = new sql.Request();
    request.input('TSKNUM', sql.NVarChar, tsknum);
    request.input('USR', sql.NVarChar, usr);

    const query = `
      SELECT TSKNUM, TSKTYP, TSKACT, DATDEB, HURDEB, HURFIN, 
             CLI, NOMCLI, CATCLI, ADRCLI, NOMCNT, FNCCNT, 
             TELCNT, TSKOBJ, TSKCMR, TSKSTA
      FROM TASK
      WHERE TSKNUM = @TSKNUM AND USR = @USR
    `;

    const result = await request.query(query);
    if (result.recordset.length > 0) {
      const taskDetails = result.recordset[0];
      res.status(200).json({
        success: true,
        data: taskDetails,
        message: 'Task details retrieved successfully'
      });
    } else {
      res.status(404).json({ success: false, message: 'Task not found' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error', message: err.message });
  }
});


export default router;
