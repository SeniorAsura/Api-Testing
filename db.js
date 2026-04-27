const mysql = require("mysql2");


const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "abcdefgh", 
  database: "MoneyTransfer",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});


db.getConnection((err, connection) => {
  if (err) {
    console.log("❌ Database connection failed:", err.message);
  } else {
    console.log("✅ Connected to MySQL Database (MoneyTransfer)");
    connection.release();
  }
});

module.exports = db;