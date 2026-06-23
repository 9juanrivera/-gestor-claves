const mysql = require('mysql2');
require('dotenv').config();

const conexion = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME
});

conexion.connect((error) => {
  if (error) {
    console.log('Error conectando a la base de datos:', error);
    return;
  }
  console.log('Conectado a MySQL correctamente');
});

module.exports = conexion;