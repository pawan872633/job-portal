const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema(
  {
    title: { type: String, default: "Jobs in India" },
    company: { type: String, default: "Confidential Company" },
    location: { type: String, default: "India" },
    salary: { type: String, default: "Not Disclosed" },
    description: { type: String, default: "" },
    applyLink: { type: String, default: "" },
    referral: { type: String, default: "" },
    companyEmail: { type: String, default: "" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Job", jobSchema);