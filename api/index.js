import bcrypt from "bcryptjs";
import db from "../db"; // make sure path is correct

export default async function handler(req, res) {
  const { method, url } = req;

  // 🧠 Simple router
  if (method === "POST" && url.includes("/login")) {
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

        return res.json({
          message: "Login successful 🔐",
          user,
        });
      }
    );
  }

  if (method === "POST" && url.includes("/signup")) {
    const { username, email, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    db.query(
      "INSERT INTO Users (username, email, password, balance) VALUES (?, ?, ?, ?)",
      [username, email, hashedPassword, 100000],
      (err) => {
        if (err) {
          return res.status(500).json({ message: err.sqlMessage });
        }

        return res.json({
          message: "Account created 🚀",
        });
      }
    );
  }

  if (method === "POST" && url.includes("/transfer")) {
    const { name, amount, bank } = req.body;

    return res.json({
      message: "Transfer working 💸 (connect DB next)",
      data: { name, amount, bank },
    });
  }

  if (method === "POST" && url.includes("/withdraw")) {
    const { name, amount, bank } = req.body;

    return res.json({
      message: "Withdraw working 💳 (connect DB next)",
      data: { name, amount, bank },
    });
  }

  return res.status(404).json({ message: "Route not found ❌" });
}
