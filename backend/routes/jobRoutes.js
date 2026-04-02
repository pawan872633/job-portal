const express = require("express");
const router = express.Router();
const multer = require("multer");

const {
  addJob,
  getJobs,
  deleteJob,
  applyJob
} = require("../controllers/jobController");

const { verifyToken } = require("../middleware/authMiddleware");

// ==========================
// MULTER CONFIG (memory upload)
// ==========================
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only PDF, DOC, DOCX files are allowed"));
    }
  }
});

// ==========================
// PUBLIC ROUTES
// ==========================
router.get("/", getJobs);
router.post("/apply", upload.single("resume"), applyJob);

// ==========================
// PROTECTED ROUTES
// ==========================
router.post("/", verifyToken, addJob);
router.delete("/:id", verifyToken, deleteJob);

module.exports = router;