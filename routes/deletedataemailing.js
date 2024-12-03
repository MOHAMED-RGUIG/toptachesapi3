import express from "express";
import sql from "../configs/database.js";

const router = express.Router();

// Delete client data route
router.delete("/deleteClientData/:id", async (req, res) => {
  const clientID = parseInt(req.params.id);

  if (!clientID) {
    return res.status(400).json({ error: "Client ID is required and must be valid." });
  }

  let transaction;
  try {
    transaction = new sql.Transaction();
    await transaction.begin();

    // Delete from Machines_Client table
    await transaction.request()
      .input("Client_ID", sql.Int, clientID)
      .query(`
        DELETE FROM Machines_Client 
        WHERE Client_ID = @Client_ID
      `);

    // Delete from Contact_Client table
    await transaction.request()
      .input("Client_ID", sql.Int, clientID)
      .query(`
        DELETE FROM Contact_Client 
        WHERE Client_ID = @Client_ID
      `);

    // Delete from Client_Creation table
    await transaction.request()
      .input("ID", sql.Int, clientID)
      .query(`
        DELETE FROM Client_Creation 
        WHERE ID = @ID
      `);

    // Commit transaction if all deletes succeed
    await transaction.commit();
    return res.status(200).json({ message: "Client data deleted successfully." });
  } catch (error) {
    // Rollback transaction if an error occurs
    if (transaction) {
      await transaction.rollback();
    }
    console.error(error);
    return res.status(500).json({ error: "An error occurred while deleting client data.", details: error.message });
  }
});

export default router;
