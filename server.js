const express = require("express");
const bcrypt = require("bcryptjs");
const session = require("express-session");
const cors = require("cors");
const path = require("path");

const db = require("./db");

const app = express();

/* ================= MIDDLEWARE ================= */
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: "bank_secret_key_123",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
  })
);

/* ================= STATIC FILES ================= */
app.use(express.static("public"));

/* ================= PAGE ROUTES ================= */
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public/index.html"));
});

app.get("/home", (req, res) => {
  if (!req.session.user) return res.redirect("/");
  res.sendFile(path.join(__dirname, "public/home.html"));
});

app.get("/transfer", (req, res) => {
  res.sendFile(path.join(__dirname, "public/transfer/transfer.html"));
});

app.get("/withdraw", (req, res) => {
  res.sendFile(path.join(__dirname, "public/withdraw/withdraw.html"));
});

/* ================= USER DATA (🔥 FIX FOR DASHBOARD) ================= */
app.get("/user", (req, res) => {
  const userId = req.session.user?.id;

  if (!userId) {
    return res.status(401).json({ message: "Not logged in" });
  }

  db.query(
    "SELECT id, username, balance FROM Users WHERE id = ?",
    [userId],
    (err, result) => {
      if (err) {
        return res.status(500).json({ message: "Database error" });
      }

      res.json(result[0]);
    }
  );
});

/* ================= TRANSACTIONS (🔥 FIX FOR HISTORY) ================= */
app.get("/transactions", (req, res) => {
  const userId = req.session.user?.id;

  if (!userId) {
    return res.status(401).json({ message: "Not logged in" });
  }

  db.query(
    "SELECT * FROM Transactions WHERE user_id = ? ORDER BY created_at DESC",
    [userId],
    (err, result) => {
      if (err) {
        return res.status(500).json({ message: "Database error" });
      }

      res.json(result);
    }
  );
});

/* ================= REGISTER ================= */
app.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // 💰 NEW USERS GET 100K
    const sql =
      "INSERT INTO Users (username, email, password, balance) VALUES (?, ?, ?, ?)";

    db.query(sql, [username, email, hashedPassword, 100000], (err) => {
      if (err) {
        return res.status(500).json({ message: err.sqlMessage });
      }

      res.json({
        message: "Account created 🚀 +₦100,000 credited",
      });
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

/* ================= LOGIN ================= */
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  db.query(
    "SELECT * FROM Users WHERE username = ?",
    [username],
    async (err, results) => {
      if (err) return res.status(500).json({ message: "Database error" });

      if (results.length === 0) {
        return res.status(400).json({ message: "User not found" });
      }

      const user = results[0];

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res.status(400).json({ message: "Wrong password" });
      }

      req.session.user = user;

      res.json({
        message: "Login successful 🔐",
        user,
      });
    }
  );
});

/* ================= TRANSFER ================= */
app.post("/transfer", (req, res) => {
  const { name, amount, bank } = req.body;
  const userId = req.session.user?.id;

  if (!userId) {
    return res.status(401).json({ message: "Not logged in" });
  }

  const amt = Number(amount);

  if (!amt || amt <= 0) {
    return res.status(400).json({ message: "Invalid amount" });
  }

  db.query(
    "SELECT balance FROM Users WHERE id = ?",
    [userId],
    (err, result) => {
      if (err) return res.status(500).json({ message: "Error" });

      const balance = result[0]?.balance || 0;

      if (balance < amt) {
        return res.status(400).json({ message: "Insufficient balance" });
      }

      db.query(
        "UPDATE Users SET balance = balance - ? WHERE id = ?",
        [amt, userId]
      );

      db.query(
        "INSERT INTO Transactions (user_id, type, amount, recipient, bank) VALUES (?, ?, ?, ?, ?)",
        [userId, "transfer", amt, name, bank]
      );

      res.json({ message: "Transfer successful 💸" });
    }
  );
});

/* ================= WITHDRAW (FIXED SECURITY 🔥) ================= */
app.post("/withdraw", (req, res) => {
  const { name, amount, bank } = req.body;
  const userId = req.session.user?.id;

  if (!userId) {
    return res.status(401).json({ message: "Not logged in" });
  }

  const amt = Number(amount);

  if (!amt || amt <= 0) {
    return res.status(400).json({ message: "Invalid amount" });
  }

  db.query(
    "SELECT balance FROM Users WHERE id = ?",
    [userId],
    (err, result) => {
      if (err) return res.status(500).json({ message: "Error" });

      const balance = result[0]?.balance || 0;

      if (balance < amt) {
        return res.status(400).json({ message: "Insufficient balance" });
      }

      db.query(
        "UPDATE Users SET balance = balance - ? WHERE id = ?",
        [amt, userId]
      );

      db.query(
        "INSERT INTO Transactions (user_id, type, amount, recipient, bank) VALUES (?, ?, ?, ?, ?)",
        [userId, "withdraw", amt, name, bank]
      );

      res.json({ message: "Withdrawal successful 💳" });
    }
  );
});

/* ================= LOGOUT ================= */
app.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/");
  });
});

/* ================= START SERVER ================= */
app.listen(3000, () => {
  console.log("🚀 Server running on http://localhost:3000");
});