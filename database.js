// config/database.js
import sql from 'mssql';
import dotenv from 'dotenv';

dotenv.config(); // Load environment variables from .env file

// Define the SQL Server connection configuration using environment variables
const sqlConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  server: process.env.DB_SERVER,
  options: {
    encrypt: true, // Use encryption for data in transit
    trustServerCertificate: true, // For self-signed certificates, trust the server certificate
  },
};

// Establish the SQL Server connection
sql.connect(sqlConfig)
  .then(() => console.log('Connected to SQL Server'))
  .catch((err) => console.error('SQL Server connection error:', err));

export default sql; // Export the SQL connection instance
