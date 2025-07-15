const express = require("express");
const bodyParser = require("body-parser");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

// Database setup
const db = new sqlite3.Database("orders.db");
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS foodOrders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      amount INTEGER NOT NULL,
      food TEXT NOT NULL,
      instructions TEXT
    )
  `);
});

// API to insert new order
app.post("/api/orders", (req, res) => {
  const { name, amount, food, instructions } = req.body;
  if (!name || !amount || !food) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  db.run(
    `INSERT INTO foodOrders (name, amount, food, instructions) VALUES (?, ?, ?, ?)`,
    [name, amount, food, instructions],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID });
    }
  );
});

// API to get all orders
app.get("/api/orders", (req, res) => {
  db.all("SELECT * FROM foodOrders ORDER BY id DESC", (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
