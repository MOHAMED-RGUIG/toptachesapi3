import express from 'express';
import sql from '../configs/database.js'; 
import moment from 'moment-timezone';


const router = express.Router();
router.put('/editClientData/:id', async (req, res) => {
    const { clientInfo, machineInfo, contactInfo } = req.body;
  
    // Validate incoming data
    if (!clientInfo || !machineInfo || !contactInfo || !clientInfo.ID) {
      return res.status(400).json({ error: "Missing required data or Client_ID in the request body" });
    }
  
    const clientID = clientInfo.ID; // Extract the Client_ID
  
    let transaction; // Declare transaction
    try {
      transaction = new sql.Transaction();
      await transaction.begin();
  
      // Update client data in Client_Creation table
      await transaction.request()
        .input('Type_Creation', sql.VarChar, clientInfo.Type_Creation)
        .input('Code_Client', sql.VarChar, clientInfo.Code_Client)
        .input('Date_Creation', sql.Date, moment.tz(clientInfo.Date_Creation, "UTC").format("YYYY-MM-DD"))
        .input('Est_Groupe', sql.Bit, clientInfo.Est_Groupe)
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
        .input('ID', sql.Int, clientID)
        .query(`
          UPDATE Client_Creation
          SET Type_Creation = @Type_Creation, Code_Client = @Code_Client, Date_Creation = @Date_Creation,
              Est_Groupe = @Est_Groupe, Charge_De_Compte = @Charge_De_Compte, Raison_Sociale = @Raison_Sociale,
              Activite = @Activite, Gerant = @Gerant, Telephone = @Telephone, Fax = @Fax, Email = @Email,
              Siege = @Siege, Ville = @Ville, Forme_Juridique = @Forme_Juridique, Adresse_Livraison = @Adresse_Livraison,
              IFISCAL = @IFISCAL, RC = @RC, Patente = @Patente, ICE = @ICE, Banque = @Banque,
              Agence_Ville = @Agence_Ville, Num_Compte = @Num_Compte, Rip_Bancaire = @Rip_Bancaire,
              Zone = @Zone, Type_Contrat = @Type_Contrat, Canal = @Canal, Remarque = @Remarque
          WHERE ID = @ID
        `);
  
      // Update machine data in Machines_Client table
      if (machineInfo && Array.isArray(machineInfo)) {
        // Validate all machines at once before processing
        const invalidMachines = machineInfo.filter(
            (machine) => !machine.Type_Machine || !machine.Reference || !machine.Client_ID
        );
    
        if (invalidMachines.length > 0) {
            return res.status(400).json({
                error: "Each machine must have 'Type_Machine', 'Reference', and 'Client_ID'.",
                invalidMachines,
            });
        }
    
        // Process each machine and upsert into Machines_Client table
        for (const machine of machineInfo) {
            await transaction
                .request()
                .input('Client_ID', sql.Int, machine.Client_ID) // Correctly access Client_ID
                .input('Type_Machine', sql.VarChar, machine.Type_Machine) // Correctly access Type_Machine
                .input('Reference', sql.VarChar, machine.Reference) // Correctly access Reference
                .input('Quantite', sql.Int, machine.Quantite || 0) // Optional field with default
                .input('Etat', sql.VarChar, machine.Etat || null) // Optional field
                .query(`
                    MERGE Machines_Client AS target
                    USING (SELECT @Client_ID AS Client_ID, @Type_Machine AS Type_Machine, @Reference AS Reference) AS source
                    ON target.Client_ID = source.Client_ID AND target.Type_Machine = source.Type_Machine AND target.Reference = source.Reference
                    WHEN MATCHED THEN
                        UPDATE SET 
                            Quantite = @Quantite, 
                            Etat = @Etat
                    WHEN NOT MATCHED THEN
                        INSERT (Client_ID, Type_Machine, Reference, Quantite, Etat)
                        VALUES (@Client_ID, @Type_Machine, @Reference, @Quantite, @Etat);
                `);
          }
      }
  
      // Update contact data in Contact_Client table
      if (contactInfo && Array.isArray(contactInfo)) {
        // Validate all contacts at once before processing
        const invalidContacts = contactInfo.filter(
            (contact) => !contact.Contact_Name || !contact.Client_ID
        );
    
        if (invalidContacts.length > 0) {
            return res.status(400).json({
                error: "Each contact must have 'Nom' (Contact_Name) and 'Client_ID'.",
                invalidContacts,
            });
        }
    
        for (const contact of contactInfo) {
            await transaction
                .request()
                .input('Client_ID', sql.Int, contact.Client_ID) // Correctly access Client_ID
                .input('Nom', sql.VarChar, contact.Contact_Name) // Correctly access Contact_Name
                .input('Fonction', sql.VarChar, contact.Contact_Function || null) // Optional field
                .input('Email', sql.VarChar, contact.Contact_Email || null) // Optional field
                .input('Telephone', sql.VarChar, contact.Contact_Phone || null) // Optional field
                .query(`
                    MERGE Contact_Client AS target
                    USING (SELECT @Client_ID AS Client_ID, @Nom AS Nom) AS source
                    ON target.Client_ID = source.Client_ID AND target.Nom = source.Nom
                    WHEN MATCHED THEN
                        UPDATE SET 
                            Fonction = @Fonction, 
                            Email = @Email, 
                            Telephone = @Telephone
                    WHEN NOT MATCHED THEN
                        INSERT (Client_ID, Nom, Fonction, Email, Telephone)
                        VALUES (@Client_ID, @Nom, @Fonction, @Email, @Telephone);
                `);
          }
      }
  
      // Commit transaction if all updates succeed
      await transaction.commit();
      return res.status(200).json({ message: 'Data updated successfully' });
    } catch (error) {
      // Rollback transaction if any error occurs
      if (transaction) {
        await transaction.rollback();
      }
      console.error(error);
      return res.status(500).json({ error: 'An error occurred while updating the data', details: error.message });
    }
  });
  
  export default router;
  