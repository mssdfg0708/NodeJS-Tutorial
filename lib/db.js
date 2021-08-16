const mysql = require('mysql');
const db = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : '8535148',
  database : 'opentuto'
});

db.connect();

module.exports = db;
