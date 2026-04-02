const Job = require("../models/Job");
const nodemailer = require("nodemailer");

// ==========================
// ➕ ADD JOB
// ==========================
exports.addJob = async (req, res) => {
  try {
    const {
      title,
      company,
      location,
      salary,
      description,
      applyLink,
      referral,
      companyEmail
    } = req.body;

    const newJob = new Job({
      title: title || "Jobs in India 2026",
      company: company || "Confidential Company",
      location: location || "India",
      salary: salary || "Not Disclosed",
      description: description || "",
      applyLink: applyLink || "",
      referral: referral || "",
      companyEmail: companyEmail || ""
    });

    await newJob.save();

    res.status(201).json({
      message: "Job added successfully",
      job: newJob
    });
  } catch (error) {
    console.error("Add Job Error:", error);
    res.status(500).json({
      message: "Error adding job",
      error: error.message
    });
  }
};

// ==========================
// 📋 GET ALL JOBS
// ==========================
exports.getJobs = async (req, res) => {
  try {
    const jobs = await Job.find().sort({ createdAt: -1 });
    res.json(jobs);
  } catch (error) {
    console.error("Get Jobs Error:", error);
    res.status(500).json({
      message: "Error fetching jobs",
      error: error.message
    });
  }
};

// ==========================
// ❌ DELETE JOB
// ==========================
exports.deleteJob = async (req, res) => {
  try {
    await Job.findByIdAndDelete(req.params.id);
    res.json({ message: "Job deleted successfully" });
  } catch (error) {
    console.error("Delete Job Error:", error);
    res.status(500).json({
      message: "Error deleting job",
      error: error.message
    });
  }
};

// ==========================
// 📩 APPLY WITH RESUME FILE UPLOAD
// ==========================
exports.applyJob = async (req, res) => {
  try {
    const { name, email, companyEmail, jobTitle } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        message: "Name and email are required"
      });
    }

    if (!req.file) {
      return res.status(400).json({
        message: "Resume file is required"
      });
    }

    // recruiter/company email ho to udhar bhejo
    // warna fallback tere email par bhejo
    const finalReceiver =
      companyEmail && companyEmail.trim() !== ""
        ? companyEmail.trim()
        : "pk3631945@gmail.com";

    // Gmail transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.ADMIN_EMAIL,
        pass: process.env.ADMIN_PASSWORD
      }
    });

    await transporter.sendMail({
      from: process.env.ADMIN_EMAIL,
      to: finalReceiver,
      subject: `New Job Application - ${jobTitle || "Job"} - ${name}`,
      html: `
        <h2>New Candidate Application</h2>
        <p><strong>Candidate Name:</strong> ${name}</p>
        <p><strong>Candidate Email:</strong> ${email}</p>
        <p><strong>Applied For:</strong> ${jobTitle || "Job"}</p>
        <p><strong>Receiver:</strong> ${finalReceiver}</p>
        <hr>
        <p>Resume attached below.</p>
      `,
      attachments: [
        {
          filename: req.file.originalname,
          content: req.file.buffer
        }
      ]
    });

    res.json({
      message: `Resume sent successfully to ${finalReceiver}`
    });
  } catch (error) {
    console.error("Apply Job Error:", error);
    res.status(500).json({
      message: "Application failed",
      error: error.message
    });
  }
};