import express from 'express';
import sql from '../configs/database.js'; // Database configuration
import moment from 'moment-timezone'; // Import moment-timezone

const router = express.Router();

// Route to save client, machine, and contact data
router.post('/saveClientData', async (req, res) => {
  console.log('Request body:', req.body);
  const { clientInfo, machineInfo, contactInfo } = req.body;

  // Retrieve the logged-in user's ID for the `USR` foreign key (from headers, session, or token)
  const currentUSR = req.headers.authorization?.split(' ')[1]; // Ensure the frontend sends the logged-in user's ID in headers

  if (!currentUSR) {
    return res.status(400).json({ error: 'Logged-in user (USR) is required' });
  }

  // Validate incoming data
  if (!clientInfo || !machineInfo || !contactInfo) {
    return res.status(400).json({ error: "Missing required data in the request body" });
  }

  // Validate and normalize the creation date
  const normalizedDATDEB = moment.tz(clientInfo.Date_Creation, "UTC").format("YYYY-MM-DD");

  let transaction; // Declare transaction here
  try {
    transaction = new sql.Transaction();
    await transaction.begin();

    // Insert client data into Client_Creation table
    const clientRequest = transaction.request();
    const result = await clientRequest
      .input('Type_Creation', sql.VarChar, clientInfo.Type_Creation)
      .input('Code_Client', sql.VarChar, clientInfo.Code_Client)
      .input('Date_Creation', sql.Date, normalizedDATDEB)
      .input('Est_Groupe', sql.Bit, clientInfo.Est_Groupe)
      .input('Client_Sous_Autre_Compte', sql.Bit, clientInfo.Client_Sous_Autre_Compte)
      .input('Charge_De_Compte', sql.VarChar, clientInfo.Charge_De_Compte)
      .input('Raison_Sociale', sql.VarChar, clientInfo.Raison_Sociale)
      .input('Activite', sql.VarChar, clientInfo.Activite)
      .input('Gerant', sql.VarChar, clientInfo.Gerant)
      .input('Telephone', sql.VarChar, clientInfo.Telephone)
      .input('Fax', sql.VarChar, clientInfo.Fax)
      .input('Email', sql.VarChar, clientInfo.Email)
      .input('Siege', sql.VarChar, clientInfo.Siege)
      .input('Ville', sql.VarChar, clientInfo.Ville)
      .input('Forme_Juridique', sql.VarChar, clientInfo.Forme_Juridique)
      .input('Adresse_Livraison', sql.VarChar, clientInfo.Adresse_Livraison)
      .input('IFISCAL', sql.VarChar, clientInfo.IFISCAL)
      .input('RC', sql.VarChar, clientInfo.RC)
      .input('Patente', sql.VarChar, clientInfo.Patente)
      .input('ICE', sql.VarChar, clientInfo.ICE)
      .input('Banque', sql.VarChar, clientInfo.Banque)
      .input('Agence_Ville', sql.VarChar, clientInfo.Agence_Ville)
      .input('Num_Compte', sql.VarChar, clientInfo.Num_Compte)
      .input('Rip_Bancaire', sql.VarChar, clientInfo.Rip_Bancaire)
      .input('Zone', sql.VarChar, clientInfo.Zone)
      .input('Type_Contrat', sql.VarChar, clientInfo.Type_Contrat)
      .input('Canal', sql.VarChar, clientInfo.Canal)
      .input('Remarque', sql.VarChar, clientInfo.Remarque)
      .input('Utilisateur_Creation', sql.VarChar, clientInfo.Utilisateur_Creation) // From clientInfo
      .input('USR', sql.VarChar, currentUSR) // Logged-in user's ID for the foreign key
      .input('Cre_Date', sql.DateTime, moment().toISOString())
      .input('Nom_Groupe', sql.VarChar, clientInfo.Nom_Groupe)
      .input('Nom_Client', sql.VarChar, clientInfo.Nom_Client)
      .query(`
        INSERT INTO Client_Creation 
        (Type_Creation, Code_Client, Date_Creation, Est_Groupe, Client_Sous_Autre_Compte, Charge_De_Compte, Raison_Sociale, 
        Activite, Gerant, Telephone, Fax, Email, Siege, Ville, Forme_Juridique, Adresse_Livraison, IFISCAL, RC, 
        Patente, ICE, Banque, Agence_Ville, Num_Compte, Rip_Bancaire, Zone, Type_Contrat, Canal, Remarque, 
        Utilisateur_Creation, USR, Cre_Date, Nom_Groupe, Nom_Client)
        OUTPUT INSERTED.ID  
        VALUES 
        (@Type_Creation, @Code_Client, @Date_Creation, @Est_Groupe, @Client_Sous_Autre_Compte, @Charge_De_Compte, @Raison_Sociale, 
        @Activite, @Gerant, @Telephone, @Fax, @Email, @Siege, @Ville, @Forme_Juridique, @Adresse_Livraison, 
        @IFISCAL, @RC, @Patente, @ICE, @Banque, @Agence_Ville, @Num_Compte, @Rip_Bancaire, @Zone, 
        @Type_Contrat, @Canal, @Remarque, @Utilisateur_Creation, @USR, @Cre_Date, @Nom_Groupe, @Nom_Client)
      `);
          
    const clientID = result.recordset[0].ID;

    // Insert machine data into Machine_Client table
    for (const machine of machineInfo) {
      await transaction.request()
        .input('Client_ID', sql.Int, clientID)
        .input('Type_Machine', sql.VarChar, machine.Type_Machine)
        .input('Reference', sql.VarChar, machine.Reference)
        .input('Quantite', sql.Int, machine.Quantite)
        .input('Etat', sql.VarChar, machine.Etat)
        .query(`
          INSERT INTO Machines_Client
          (Client_ID, Type_Machine, Reference, Quantite, Etat)
          VALUES
          (@Client_ID, @Type_Machine, @Reference, @Quantite, @Etat)
        `);
    }

    // Insert contact data into Contact_Client table
    for (const contact of contactInfo) {
      await transaction.request()
        .input('Client_ID', sql.Int, clientID)
        .input('Nom', sql.VarChar, contact.Contact_Name)
        .input('Fonction', sql.VarChar, contact.Contact_Function)
        .input('Email', sql.VarChar, contact.Contact_Email)
        .input('Telephone', sql.VarChar, contact.Contact_Phone)
        .query(`
          INSERT INTO Contact_Client
          (Client_ID, Nom, Fonction, Email, Telephone)
          VALUES
          (@Client_ID, @Nom, @Fonction, @Email, @Telephone)
        `);
    }

    await transaction.commit();
    return res.status(200).json({ message: 'Data saved successfully' });
  } catch (err) {
    if (transaction) await transaction.rollback();
    return res.status(500).json({ error: err.message });
  }
});
export default router;