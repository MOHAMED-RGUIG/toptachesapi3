import express from 'express';
import sql from '../database.js'; // Adjust the path as needed

const router = express.Router();

router.delete('/:tsknum', async (req, res) => {
  const { tsknum } = req.params;

  if (!tsknum) {
    return res.status(400).json({ error: 'TSKNUM is required' });
  }

  try {
    const request = new sql.Request();
    request.input('TSKNUM', sql.NVarChar, tsknum);

    const query = `
      DELETE FROM TASK
      WHERE TSKNUM = @TSKNUM
    `;

    const result = await request.query(query);
    if (result.rowsAffected[0] > 0) {
      res.status(200).json({ success: true, message: 'Task deleted successfully' });
    } else {
      res.status(404).json({ success: false, message: 'Task not found' });
    }
  } catch (err) {
    console.error('Error deleting task:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
