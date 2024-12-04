import express from "express";
import sql from "../database.js";

const router = express.Router();

// Get client data by ID along with their machines and contacts
router.get("/getClientDataByID/:id", async (req, res) => {
  try {
    const clientID = req.params.id; // Get the client ID from the URL parameter
    const loggedInUSR = req.headers.usr; // Ensure 'usr' is passed in the request headers

    if (!loggedInUSR) {
      return res.status(400).json({ error: "Logged-in user (USR) not provided." });
    }

    if (!clientID) {
      return res.status(400).json({ error: "Client ID is required." });
    }

    const pool = await sql.connect(); // Ensure you connect to the database
    const clientRequest = pool.request();

    // Fetch client details based on the clientID and logged-in user (USR)
    const clientResult = await clientRequest
      .input("USR", sql.VarChar, loggedInUSR) // Define and assign the @USR parameter
      .input("ClientID", sql.Int, clientID) // Define and assign the @ClientID parameter
      .query(`
        SELECT 
          ID,
          Type_Creation,
          Code_Client,
          Date_Creation,
          Est_Groupe,
          Client_Sous_Autre_Compte,
          Nom_Groupe,
          Nom_Client,
          Charge_De_Compte,
          Raison_Sociale,
          Activite,
          Gerant,
          Telephone,
          Fax,
          Email,
          Siege,
          Ville,
          Forme_Juridique,
          Adresse_Livraison,
          IFISCAL,
          RC,
          Patente,
          ICE,
          Banque,
          Agence_Ville,
          Num_Compte,
          Rip_Bancaire,
          Zone,
          Type_Contrat,
          Canal,
          Remarque
        FROM Client_Creation
        WHERE ID = @ClientID AND USR = @USR
      `);

    const client = clientResult.recordset[0]; // Get the first client from the result

    if (!client) {
      return res.status(404).json({ error: "Client not found." }); // Return 404 if client is not found
    }

    // Fetch machines and contacts for the specific client
    const machinesResult = await pool.request()
      .input("ClientID", sql.Int, clientID)
      .query(`
        SELECT 
          Client_ID,
          Type_Machine,
          Reference,
          Quantite,
          Etat
        FROM Machines_Client
        WHERE Client_ID = @ClientID
      `);

    const contactsResult = await pool.request()
      .input("ClientID", sql.Int, clientID)
      .query(`
        SELECT 
          Client_ID,
          Nom AS Contact_Name,
          Fonction AS Contact_Function,
          Email AS Contact_Email,
          Telephone AS Contact_Phone
        FROM Contact_Client
        WHERE Client_ID = @ClientID
      `);

    const machines = machinesResult.recordset;
    const contacts = contactsResult.recordset;

    // Attach machines and contacts to the client data
    const clientWithDetails = {
      ...client,
      machines,
      contacts
    };

    // Return the client data with machines and contacts
    return res.status(200).json(clientWithDetails);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: "An error occurred while fetching client data.",
      details: error.message,
    });
  }
});

export default router;
