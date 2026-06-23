const mysql = require('mysql2');

console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_PORT:', process.env.DB_PORT);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_NAME:', process.env.DB_NAME);

const conexion = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306
});

conexion.connect((error) => {
  if (error) {
    console.log('Error conectando a la base de datos:', error);
    return;
  }
  console.log('Conectado a MySQL correctamente');
});

module.exports = conexion;