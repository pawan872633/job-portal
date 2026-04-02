require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const path = require("path");
const fs = require("fs");

const Admin = require("./models/Admin");
const authRoutes = require("./routes/authRoutes");
const jobRoutes = require("./routes/jobRoutes");

const app = express();

// ==========================
// MIDDLEWARES
// ==========================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ==========================
// UPLOADS FOLDER (optional)
// ==========================
const uploadsPath = path.join(__dirname, "uploads");

if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath);
}

// static access (agar future me file save kare)
app.use("/uploads", express.static(uploadsPath));

// ==========================
// TEST ROUTE
// ==========================
app.get("/", (req, res) => {
  res.send("🔥 Secure Job Portal API Running...");
});

// ==========================
// ROUTES
// ==========================
app.use("/api/auth", authRoutes);
app.use("/api/jobs", jobRoutes);

// ==========================
// MONGODB CONNECT
// ==========================
mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("✅ MongoDB Connected");

    const existingAdmin = await Admin.findOne({ username: "pawanadmin" });

    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash("1234", 10);

      await Admin.create({
        username: "pawanadmin",
        password: hashedPassword
      });

      console.log("✅ Default Admin Created");
    } else {
      console.log("ℹ️ Admin already exists");
    }
  })
  .catch(err => console.log("❌ Mongo Error:", err.message));

// ==========================
// GLOBAL ERROR HANDLER (IMPORTANT)
// ==========================
app.use((err, req, res, next) => {
  console.error("🔥 Server Error:", err.message);

  if (err.message.includes("Only PDF")) {
    return res.status(400).json({ message: err.message });
  }

  res.status(500).json({
    message: "Internal Server Error",
    error: err.message
  });
});

// ==========================
// SERVER START
// ==========================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});