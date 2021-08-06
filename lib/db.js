const mysql = require('mysql');
const db = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'myPassword',
  database : 'myDatabase'
});

db.connect();

module.exports = db;
