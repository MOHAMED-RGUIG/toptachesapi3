import express from "express";
import sql from "../database.js";

const router = express.Router();

// Get all clients along with their machines and contacts for a specific user
router.get("/getallClientData", async (req, res) => {
  try {
    // Get the logged-in user from headers or session
    const loggedInUSR = req.headers.usr; // Ensure 'usr' is passed in the request headers

    if (!loggedInUSR) {
      return res.status(400).json({ error: "Logged-in user (USR) not provided." });
    }

    const pool = await sql.connect(); // Ensure you connect to the database
    const clientRequest = pool.request();

    // Pass the `USR` parameter to the query
    const clientsResult = await clientRequest
      .input("USR", sql.VarChar, loggedInUSR) // Define and assign the @USR parameter
      .query(`
        SELECT 
          ID,
          Type_Creation,
          Code_Client,
          Date_Creation,
          Est_Groupe,
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
        WHERE USR = @USR
        ORDER BY Date_Creation DESC
      `);

    const clients = clientsResult.recordset;

    // If no clients found
    if (clients.length === 0) {
      return res.status(200).json([]); // Return empty array if no clients
    }

    // Fetch machines and contacts for each client
    const clientIDs = clients.map((client) => client.ID);

    const machinesResult = await pool.request()
      .query(`
        SELECT 
          Client_ID,
          Type_Machine,
          Reference,
          Quantite,
          Etat
        FROM Machines_Client
        WHERE Client_ID IN (${clientIDs.join(",")})
      `);

    const contactsResult = await pool.request()
      .query(`
        SELECT 
          Client_ID,
          Nom AS Contact_Name,
          Fonction AS Contact_Function,
          Email AS Contact_Email,
          Telephone AS Contact_Phone
        FROM Contact_Client
        WHERE Client_ID IN (${clientIDs.join(",")})
      `);

    const machines = machinesResult.recordset;
    const contacts = contactsResult.recordset;

    // Attach machines and contacts to each client
    const clientsWithDetails = clients.map((client) => {
      return {
        ...client,
        machines: machines.filter((machine) => machine.Client_ID === client.ID),
        contacts: contacts.filter((contact) => contact.Client_ID === client.ID),
      };
    });

    // Return the clients with machines and contacts
    return res.status(200).json(clientsWithDetails);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: "An error occurred while fetching clients, machines, and contacts.",
      details: error.message,
    });
  }
});

export default router;
