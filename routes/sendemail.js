import express from 'express';
import nodemailer from 'nodemailer';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import fs from 'fs';
import path from 'path';

const router = express.Router();

const transporter = nodemailer.createTransport({
    host: 'topclass.ma',
    port: 587,
    secure: false, // Note: secure is typically set to true for port 465, false for port 587
    auth: {
        user: 'stg-it@topclass.ma',
        pass: 'Top@2020**+-..'
    },
    debug: true, // Enable debug if you need detailed logs from the SMTP server
    logger: true // Enables logging of email sending
  });
  
  // Sample API endpoint to send PDF
  router.post('/sendOrder', async (req, res) => {
    const {
      clientInfo,
      contacts,
      contacts1,
      selectedOption,
      selectedOption1,
      selectedOption2,
      selectedOption4,
      customText 
    } = req.body;
  
    // Check for necessary fields
    if (!clientInfo || !contacts || !contacts1 || !selectedOption || !selectedOption1 || !selectedOption2 || !selectedOption4 || !clientInfo.companyName) {
        return res.status(400).json({ error: "Missing required data in the request body" });
    }
  
    try {
        const pdfDoc = await generatePDF(clientInfo, contacts, contacts1, selectedOption, selectedOption1, selectedOption2, selectedOption4);
        const pdfBuffer = Buffer.from(pdfDoc.output('arraybuffer'));
        const mailOptions = {
          from: 'stg-it@topclass.ma',
          to: 'si@topclass.ma',
          subject: `Demande d’Ouverture de Compte Client pour ${clientInfo.companyName}`,
          html: `Bonjour,<br><br>Je vous adresse ci-joint la demande d’ouverture de compte client pour <b>${clientInfo.companyName}</b>, soumise par notre commercial <b>${clientInfo.chargeducompte}</b>. La fiche d’ouverture de compte est remplie et prête à être traitée.<br><br>${
              customText ? `Voici la remarque ajoutée par le commercial :<br>${customText}<br><br>` : ''
          }Merci de vérifier les informations fournies et de prendre les mesures nécessaires pour finaliser le processus d’ouverture du compte dans les meilleurs délais.<br><br>Cordialement,`, // Conditionally include custom text
          attachments: [{
              filename: `Fiche-creation-compte-${clientInfo.companyName}.pdf`,
              content: pdfBuffer,
              contentType: 'application/pdf'
          }]
      };
  
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Error sending email:', error);
                return res.status(500).json({ success: false, message: 'Failed to send email', error });
            }
            res.status(200).json({ success: true, message: 'Email sent successfully!' });
        });
    } catch (error) {
        console.error('Failed to generate PDF:', error);
        res.status(500).json({ error: 'Failed to generate PDF', message: error.message });
    }
  });
  
  function getImageBase64(filePath) {
    const absolutePath = path.resolve(filePath);
    const fileExtension = path.extname(absolutePath).substring(1);
    const fileBuffer = fs.readFileSync(absolutePath);
    const base64Data = fileBuffer.toString('base64');
    return `data:image/${fileExtension};base64,${base64Data}`;
  }
  
  function addCheckboxes(doc, options, selectedOption) {
    const startX = 10; // Start X position for the first checkbox
    const startY = 50; // Start Y position for checkboxes
    const baseSize = 5; // Size of the checkbox
    const fontSize = 10; // Smaller font size for checkbox labels
    const textOffset = 2; // Reduced offset for text label from the checkbox
    const padding = 3; // Reduced padding between checkbox and text and between sets of checkbox+label
  
    doc.setFontSize(fontSize); // Set the font size for checkbox labels
    let xPosition = startX; // Dynamic x position, starts with the startX
  
    options.forEach((option, index) => {
        doc.rect(xPosition, startY, baseSize, baseSize); // Draw checkbox
  
        // Check the box if it matches the selected option
        if (selectedOption === option.label) {
            doc.rect(xPosition + 1, startY + 1, baseSize - 2, baseSize - 2, 'F'); // Fill checkbox
        }
  
        // Add label next to the checkbox
        doc.text(option.label, xPosition + baseSize + textOffset, startY + baseSize);
  
        // Measure the width of the text to determine the starting position of the next checkbox
        const textWidth = doc.getTextWidth(option.label);
        xPosition += baseSize + textOffset + textWidth + padding; // Update xPosition for the next checkbox
    });
  }
  
  function addTypeCheckboxes(doc, options, selectedOption4) {
    const startX = 10; // Start X position for the first checkbox
    const startY = 45; // Start Y position for checkboxes
    const baseSize = 5; // Size of the checkbox
    const fontSize = 10; // Smaller font size for checkbox labels
    const textOffset = 2; // Reduced offset for text label from the checkbox
    const padding = 3; // Reduced padding between checkbox and text and between sets of checkbox+label
  
    doc.setFontSize(fontSize); // Set the font size for checkbox labels
    let xPosition = startX; // Dynamic x position, starts with the startX
  
    options.forEach((option, index) => {
        doc.rect(xPosition, startY, baseSize, baseSize); // Draw checkbox
  
        // Check the box if it matches the selected option
        if (selectedOption4 === option.label) {
            doc.rect(xPosition + 1, startY + 1, baseSize - 2, baseSize - 2, 'F'); // Fill checkbox
        }
  
        // Add label next to the checkbox
        doc.text(option.label, xPosition + baseSize + textOffset, startY + baseSize);
  
        // Measure the width of the text to determine the starting position of the next checkbox
        const textWidth = doc.getTextWidth(option.label);
        xPosition += baseSize + textOffset + textWidth + padding; // Update xPosition for the next checkbox
    });
  }
  
  function addConditionCheckboxes1(doc, options, selectedOption1) {
    const startX = 85; // Start X position for the first checkbox
    const startY = 60; // Start Y position for checkboxes
    const gap = 15; // Gap between checkboxes to place them on the same line
    const size = 5; // Size of the checkbox
    const fontSize = 10; // Smaller font size for checkbox labels
    const textOffset = 2; // Reduced offset for text label from the checkbox
  
    doc.setFontSize(fontSize); // Set the font size for checkbox labels
  
    options.forEach((option, index) => {
        const xPosition = startX + (gap * index); // Calculate X position for each checkbox
        doc.rect(xPosition, startY, size, size); // Draw checkbox
  
        // Check the box if it matches the selected option
        if (selectedOption1 === option.label) {
            doc.rect(xPosition + 1, startY + 1, size - 2, size - 2, 'F'); // Fill checkbox
        }
  
        // Add label next to the checkbox, closer to the checkbox
        doc.text(option.label, xPosition + size + textOffset, startY + size);
    });
  }
  function addConditionCheckboxes2(doc, options, selectedOption2) {
    const startX = 85; // Start X position for the first checkbox
    const startY = 67; // Start Y position for checkboxes
    const gap = 15; // Gap between checkboxes to place them on the same line
    const size = 5; // Size of the checkbox
    const fontSize = 10; // Smaller font size for checkbox labels
    const textOffset = 2; // Reduced offset for text label from the checkbox
  
    doc.setFontSize(fontSize); // Set the font size for checkbox labels
  
    options.forEach((option, index) => {
        const xPosition = startX + (gap * index); // Calculate X position for each checkbox
        doc.rect(xPosition, startY, size, size); // Draw checkbox
  
        // Check the box if it matches the selected option
        if (selectedOption2 === option.label) {
            doc.rect(xPosition + 1, startY + 1, size - 2, size - 2, 'F'); // Fill checkbox
        }
  
        // Add label next to the checkbox, closer to the checkbox
        doc.text(option.label, xPosition + size + textOffset, startY + size);
    });
  }
  
  async function generatePDF(clientInfo, contacts, contacts1, selectedOption, selectedOption1, selectedOption2, selectedOption4) {
    if (!clientInfo || !clientInfo.companyName) {
      throw new Error("clientInfo is undefined or missing required properties");
    }
    const doc = new jsPDF();
  
    // Adding a logo
    const logoBase64 = getImageBase64('C:/Users/Administrateur/Desktop/material-tailwind-dashboard-react-main/public/img/logo_footer.png');
    doc.addImage(logoBase64, 'PNG', 10, 13, 37, 27);
  
    // Document Title
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('FICHE D’OUVERTURE COMPTE CLIENT', 105, 30, null, null, 'center');
  
    const options = [
      { label: 'Création', checked: selectedOption === 'Création' },
      { label: 'Réactivation', checked: selectedOption === 'Réactivation' },
      { label: 'Modification', checked: selectedOption === 'Modification' }
    ];
    addCheckboxes(doc, options, selectedOption);
  
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Code Client:', 110, 55);
    doc.setFont('helvetica', 'bold');
    doc.text(clientInfo.codeclient || '..........', 130, 55);
  
    doc.setFont('helvetica', 'normal');
    doc.text('Date:', 150, 55);
    doc.setFont('helvetica', 'bold');
    doc.text(clientInfo.datecreation || '..........', 160, 55);
  
    doc.setFont('helvetica', 'normal');
    doc.text('Ce client fait-il partie d’un groupe ?', 10, 65);
    const options2 = [
      { label: 'Oui', checked: selectedOption1 === 'Oui' },
      { label: 'Non', checked: selectedOption1 === 'Non' }
    ];
    addConditionCheckboxes1(doc, options2, selectedOption1);
  
    doc.setFont('helvetica', 'normal');
    doc.text('Nom de Groupe:', 130, 65);
    doc.setFont('helvetica', 'bold');
    doc.text(clientInfo.nomdegroupe || '..........', 157, 65);
  
    doc.setFont('helvetica', 'normal');
    doc.text('Ce client existe-t-il sous un autre compte ?', 10, 72);
    const options3 = [
      { label: 'Oui', checked: selectedOption2 === 'Oui' },
      { label: 'Non', checked: selectedOption2 === 'Non' }
    ];
    addConditionCheckboxes2(doc, options3, selectedOption2);
  
    doc.setFont('helvetica', 'normal');
    doc.text('Nom de Client :', 130, 72);
    doc.setFont('helvetica', 'bold');
    doc.text(clientInfo.nomdeclient || '..........', 155, 72);
  
    doc.setFont('helvetica', 'normal');
    doc.text('Chargé du compte:', 10, 79);
    doc.setFont('helvetica', 'bold');
    doc.text(clientInfo.chargeducompte || '..........', 42, 79);
  
    // Subheaders and Information with gray background
    doc.setFillColor(200, 200, 200); // Set gray color
    doc.rect(10, 84, 190, 10, 'F'); // Draw filled rectangle
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0); // Set text color to black
    doc.text('I. Partie réservée au client:', 12, 91);
  
    // Client Information
    doc.setFontSize(10); 
    doc.setFont('helvetica', 'bold');
    doc.text('INFORMATION SUR L’ENTREPRISE:', 10, 100);
    doc.line(10, 102, 71, 102); // Draw a line directly under the text (adjust length as needed)
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Nom & Raison sociale:', 10, 110);
    doc.setFont('helvetica', 'bold');
    doc.text(clientInfo.companyName || '..........', 47, 110);
  
    const xOffsetActivity = 10;
    const xOffsetManager = 110;
    doc.setFont('helvetica', 'normal');
    doc.text('Activité:', xOffsetActivity, 117);
    doc.setFont('helvetica', 'bold');
    doc.text(clientInfo.activity || '..........', xOffsetActivity + 13, 117);
  
    doc.setFont('helvetica', 'normal');
    doc.text('Gérant(e) Mr/Mme:', xOffsetManager, 117);
    doc.setFont('helvetica', 'bold');
    doc.text(clientInfo.manager || '..........', xOffsetManager + 31, 117);
  
    const startX = 10;
    const startY = 124;
    const lineSpacing = 10;
    doc.setFont('helvetica', 'normal');
    doc.text('Téléphone fixe:', startX, startY);
    doc.setFont('helvetica', 'bold');
    doc.text(clientInfo.phone || '..........', startX + 25, startY);
  
    doc.setFont('helvetica', 'normal');
    doc.text('Fax:', 90, startY);
    doc.setFont('helvetica', 'bold');
    doc.text(clientInfo.fax || '..........', 98, startY);
  
    doc.setFont('helvetica', 'normal');
    doc.text('Email:', 130, startY);
    doc.setFont('helvetica', 'bold');
    doc.text(clientInfo.email || '..........', 141, startY);
  
    const baseX = 10;
    const baseY = 131;
    const lineGap = 10;
    doc.setFont('helvetica', 'normal');
    doc.text('Siège:', baseX, baseY);
    doc.setFont('helvetica', 'bold');
    doc.text(clientInfo.headquarters || '..........', baseX + 11, baseY);
  
    doc.setFont('helvetica', 'normal');
    doc.text('Ville:', 97, baseY);
    doc.setFont('helvetica', 'bold');
    doc.text(clientInfo.city || '..........', 106, baseY);
  
    doc.setFont('helvetica', 'normal');
    doc.text('Forme juridique:', 137, baseY);
    doc.setFont('helvetica', 'bold');
    doc.text(clientInfo.legalForm || '..........', 164, baseY);
  
    doc.setFont('helvetica', 'normal');
    doc.text('Adresse de livraison:', 10, 138);
    doc.setFont('helvetica', 'bold');
    doc.text(clientInfo.deliveryAddress || '..........', 44, 138);
  
    const baseX2 = 10;
    const baseY2 = 145;
    doc.setFont('helvetica', 'normal');
    doc.text('N° identifiant fiscal:', baseX2, baseY2);
    doc.setFont('helvetica', 'bold');
    doc.text(clientInfo.taxId || '..........', baseX2 + 31, baseY2);
  
    doc.setFont('helvetica', 'normal');
    doc.text('N° RC:', 90, baseY2);
    doc.setFont('helvetica', 'bold');
    doc.text(clientInfo.rcNumber || '..........', 102, baseY2);
  
    doc.setFont('helvetica', 'normal');
    doc.text('N° Patente:', 130, baseY2);
    doc.setFont('helvetica', 'bold');
    doc.text(clientInfo.patentNumber || '..........', 149, baseY2);
  
    doc.setFont('helvetica', 'normal');
    doc.text('ICE:', 10, 152);
    doc.setFont('helvetica', 'bold');
    doc.text(clientInfo.iceNumber || '..........', 18, 152);
  
    // Bank Information
    const baseX3 = 10;
    const baseY3 = 159;
    doc.setFont('helvetica', 'normal');
    doc.text('Banque principale:', baseX3, baseY3);
    doc.setFont('helvetica', 'bold');
    doc.text(clientInfo.mainBank || '..........', baseX3 + 30, baseY3);
  
    doc.setFont('helvetica', 'normal');
    doc.text('Agence/ville:', 110, baseY3);
    doc.setFont('helvetica', 'bold');
    doc.text(clientInfo.bankBranch || '..........', 131, baseY3);
  
    doc.setFont('helvetica', 'normal');
    doc.text('N° de compte:', 10, 166);
    doc.setFont('helvetica', 'bold');
    doc.text(clientInfo.accountNumber || '..........', 34, 166);
  
    doc.setFont('helvetica', 'normal');
    doc.text('RIP Bancaire:', 10, 173);
    doc.setFont('helvetica', 'bold');
    doc.text(clientInfo.rip || '..........', 33, 173);
  
    // Contacts Table
    doc.text('CONTACTS:', 10, 190);
    doc.line(10, 192, 31, 192);
    const tableColumn = ["Nom", "Fonction", "Téléphone", "Email"];
    const tableRows = contacts.map(contact => [contact.name, contact.function, contact.phone, contact.email]);
    doc.autoTable({
        startY: 200,
        head: [tableColumn],
        body: tableRows
    });
  
    const pageHeight = doc.internal.pageSize.height;
    const sectionY = pageHeight - 50;
  
    doc.setFontSize(8);
    doc.text('REPRESENTANT LEGALE DE L’ENTREPRISE :', 20, sectionY - 5);
    doc.rect(20, sectionY, 70, 20);  // Rectangular box
    
  
    // Right box
    doc.setFontSize(10);
    doc.text('PIECES A FOURNIR', 110, sectionY - 5);
    doc.rect(110, sectionY, 70, 20);  // Rectangular box for items
    doc.setFontSize(8);
    doc.text('- Registre de commerce récent', 115, sectionY + 5);
    doc.text('- Spécimen de chèque Ou attestation de RIB', 115, sectionY + 9);
    doc.text('- Attestation Taxe professionnelle', 115, sectionY + 13);
    doc.text('- Attestation ICE', 115, sectionY + 17);
  
    doc.addPage();
  
    doc.setFillColor(200, 200, 200); // Set gray color
    doc.rect(10, 13, 190, 10, 'F'); // Draw filled rectangle
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0); // Set text color to black
    doc.text('II. Partie réservé à TOPCLASS:', 12, 20);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10); // Make the font size smaller for this specific text
    doc.text('DIRECTION COMMERCIALE:', 10, 30);
    doc.line(10, 32, 58, 32);
    doc.setFontSize(10);
  
    doc.setFont('helvetica', 'normal');
    doc.text('Chargé du compte:', 10, 40);
    doc.setFont('helvetica', 'bold');
    doc.text(clientInfo.chargeducompte || '..........', 42, 40);
  
    const options4 = [
      { label: 'Depot', checked: selectedOption4 === 'Depot' },
      { label: 'Location', checked: selectedOption4 === 'Location' },
      { label: 'Vente', checked: selectedOption4 === 'Vente' }
    ];
    addTypeCheckboxes(doc, options4, selectedOption4);
  
    doc.setFont('helvetica', 'normal');
    doc.text('Zone:', 10, 60);
    doc.setFont('helvetica', 'bold');
    doc.text(clientInfo.zone || '..........', 21, 60);
  
    doc.setFont('helvetica', 'normal');
    doc.text('Canal:', 64, 60);
    doc.setFont('helvetica', 'bold');
    doc.text(clientInfo.canal || '..........', 76, 60);
  
    doc.text('MACHINES:', 10, 70);
    doc.line(10, 72, 30, 72);
    const tableColumn1 = ["Référence", "Qté", "État"];
    const tableRows1 = contacts1.map(contact1 => [contact1.ref, contact1.qte, contact1.etat]);
    doc.autoTable({
        startY: 75,
        head: [tableColumn1],
        body: tableRows1
    });
  
    const machinesTableHeight = doc.autoTable.previous.finalY + 10;
  
    doc.setFontSize(12);
    doc.text('Condition Tarifaire (avec accord du DG)', 10, machinesTableHeight + 20);
    doc.line(10, machinesTableHeight + 22, 90, machinesTableHeight + 22);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text('-Remise : ...........................................', 20, machinesTableHeight + 30);
    doc.text('-Gratuité : .........................................', 20, machinesTableHeight + 37);
    doc.text('-PLV : ..............................................', 20, machinesTableHeight + 44);
  
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Visa et Approbation', 120, machinesTableHeight + 25);
    doc.text('Directeur Commercial', 120, machinesTableHeight + 30);
    doc.rect(110, machinesTableHeight + 20, 70, 13); 
    doc.rect(110, machinesTableHeight + 33, 70, 20); 
  
    doc.setFontSize(10);
    doc.text('DIRECTION ADMINISTRATIVE ET FINANCIER :', 10, machinesTableHeight + 58);
    doc.line(10, machinesTableHeight + 60, 88, machinesTableHeight + 60);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Validation des documents : .................................................', 20, machinesTableHeight + 68);
    doc.text('Solvabilité du Client : ....................................................', 20, machinesTableHeight + 75);
    doc.text('Conditions de paiement : ...................................................', 20, machinesTableHeight + 82);
    doc.setFont('helvetica', 'normal');
    doc.text('-Mode : ..................................................', 26, machinesTableHeight + 89);
    doc.text('-Délais : ................................................', 26, machinesTableHeight + 96);
    doc.text('-Plafond de l’encours : ..................................', 26, machinesTableHeight + 103);
  
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Visa et Approbation', 25, machinesTableHeight + 115);
    doc.text('Service Comptabilité et Finance', 25, machinesTableHeight + 120);
    doc.rect(20, machinesTableHeight + 110, 70, 13); 
    doc.rect(20, machinesTableHeight + 110, 70, 30); 
  
    doc.text('Visa et Approbation', 115, machinesTableHeight + 115);
    doc.text('Responsable Recouvrement', 115, machinesTableHeight + 120);
    doc.rect(110, machinesTableHeight + 110, 70, 13); 
    doc.rect(110, machinesTableHeight + 110, 70, 30);  
  
    doc.text('Approbation Direction Générale', 58, machinesTableHeight + 150);
    doc.rect(55, machinesTableHeight + 145, 70, 13); 
    doc.rect(55, machinesTableHeight + 145, 70, 30);
  
  
    return doc;
  }

  export default router;
