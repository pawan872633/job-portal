const Admin = require("../models/Admin");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// ==========================
// ADMIN LOGIN
// ==========================
exports.loginAdmin = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        message: "Username and password are required"
      });
    }

    const admin = await Admin.findOne({ username });

    if (!admin) {
      return res.status(401).json({
        message: "Invalid username or password"
      });
    }

    const isMatch = await bcrypt.compare(password, admin.password);

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid username or password"
      });
    }

    const token = jwt.sign(
      {
        id: admin._id,
        username: admin.username
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login successful",
      token,
      admin: {
        id: admin._id,
        username: admin.username
      }
    });
  } catch (error) {
    console.error("Login Admin Error:", error);
    res.status(500).json({
      message: "Login failed",
      error: error.message
    });
  }
};

// ==========================
// UPDATE ADMIN USERNAME/PASSWORD
// ==========================
exports.updateAdmin = async (req, res) => {
  try {
    const { username, password } = req.body;

    const adminId = req.admin.id;

    const admin = await Admin.findById(adminId);

    if (!admin) {
      return res.status(404).json({
        message: "Admin not found"
      });
    }

    // username update
    if (username && username.trim() !== "") {
      admin.username = username.trim();
    }

    // password update
    if (password && password.trim() !== "") {
      const hashedPassword = await bcrypt.hash(password.trim(), 10);
      admin.password = hashedPassword;
    }

    await admin.save();

    res.json({
      message: "Admin credentials updated successfully"
    });
  } catch (error) {
    console.error("Update Admin Error:", error);
    res.status(500).json({
      message: "Failed to update admin credentials",
      error: error.message
    });
  }
};