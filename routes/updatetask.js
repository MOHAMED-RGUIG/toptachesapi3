import express from 'express';
import sql from '../database.js'; // Adjust the path if needed
import moment from 'moment-timezone';

const router = express.Router();

router.put('/updatetask/:tsknum', async (req, res) => {
  const tsknum = req.params.tsknum;
  const {
    TSKTYP, TSKACT, DATDEB, HURDEB, HURFIN, CLI,
    NOMCLI, CATCLI, ADRCLI, NOMCNT, FNCCNT, TELCNT,
    TSKOBJ, TSKCMR, TSKSTA,
  } = req.body;

  const dateInUTC = moment.tz(DATDEB, "UTC").format('YYYY-MM-DD');
  const upddat = moment().format('YYYY-MM-DD HH:mm:ss');

  try {
    const request = new sql.Request();
    request.input('TSKTYP', sql.NVarChar, TSKTYP);
    request.input('TSKACT', sql.NVarChar, TSKACT);
    request.input('DATDEB', sql.Date, dateInUTC);
    request.input('HURDEB', sql.NVarChar, HURDEB);
    request.input('HURFIN', sql.NVarChar, HURFIN);
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
    request.input('UPDDAT', sql.DateTime, upddat);
    request.input('TSKNUM', sql.NVarChar, tsknum);

    const query = `
      UPDATE TASK
      SET 
          TSKTYP = @TSKTYP,
          TSKACT = @TSKACT,
          DATDEB = @DATDEB,
          HURDEB = @HURDEB,
          HURFIN = @HURFIN,
          CLI = @CLI,
          NOMCLI = @NOMCLI,
          CATCLI = @CATCLI,
          ADRCLI = @ADRCLI,
          NOMCNT = @NOMCNT,
          FNCCNT = @FNCCNT,
          TELCNT = @TELCNT,
          TSKOBJ = @TSKOBJ,
          TSKCMR = @TSKCMR,
          TSKSTA = @TSKSTA,
          UPDDAT = @UPDDAT
      WHERE TSKNUM = @TSKNUM
    `;

    await request.query(query);
    res.status(200).json({ success: true, message: 'Task updated successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
