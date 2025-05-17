import mysql from "mysql2/promise";

const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "ecommerce_mvp",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

module.exports = {
  pool,
  connect: async () => {
    try {
      const connection = await pool.getConnection();
      console.log("Connected to MySQL database");
      connection.release();
    } catch (err) {
      console.error("Database connection failed:", err);
      process.exit(1);
    }
  },
};
