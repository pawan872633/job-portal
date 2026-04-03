const API_BASE = "https://rankjob-backend.onrender.com/api";
let isAdminPage = window.location.pathname.includes("admin.html");

// ----------------------
// AUTH TOKEN HELPERS
// ----------------------
function getToken() {
  return localStorage.getItem("adminToken");
}

function logoutAdmin() {
  localStorage.removeItem("adminToken");
  localStorage.removeItem("isAdminLoggedIn");
  window.location.reload();
}

// ----------------------
// ADMIN PAGE PROTECTION
// ----------------------
document.addEventListener("DOMContentLoaded", () => {
  if (isAdminPage) {
    const token = getToken();
    const loginSection = document.getElementById("loginSection");
    const adminPanel = document.getElementById("adminPanel");

    if (token) {
      if (loginSection) loginSection.style.display = "none";
      if (adminPanel) adminPanel.style.display = "block";
      loadJobs(true);
    } else {
      if (loginSection) loginSection.style.display = "block";
      if (adminPanel) adminPanel.style.display = "none";
    }
  } else {
    loadJobs(false);
  }

  createResumeModal();
});

// ----------------------
// CREATE RESUME MODAL
// ----------------------
function createResumeModal() {
  if (document.getElementById("resumeModal")) return;

  const modal = document.createElement("div");
  modal.id = "resumeModal";
  modal.style.display = "none";
  modal.style.position = "fixed";
  modal.style.top = "0";
  modal.style.left = "0";
  modal.style.width = "100%";
  modal.style.height = "100%";
  modal.style.background = "rgba(0,0,0,0.65)";
  modal.style.zIndex = "99999";
  modal.style.justifyContent = "center";
  modal.style.alignItems = "center";

  modal.innerHTML = `
    <div style="
      background: #1f2f3a;
      color: white;
      width: 90%;
      max-width: 420px;
      padding: 24px;
      border-radius: 20px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.35);
      border: 1px solid rgba(255,255,255,0.08);
    ">
      <h2 style="margin:0 0 16px;font-size:28px;">📄 Upload Resume</h2>
      <p style="margin:0 0 16px;opacity:.9;">Select your resume file and send it.</p>

      <input type="text" id="resumeName" placeholder="Enter Name"
        style="width:100%;padding:14px 16px;margin-bottom:12px;border:none;border-radius:12px;background:#364852;color:white;font-size:16px;outline:none;" />

      <input type="email" id="resumeEmail" placeholder="Enter Email"
        style="width:100%;padding:14px 16px;margin-bottom:12px;border:none;border-radius:12px;background:#364852;color:white;font-size:16px;outline:none;" />

      <input type="file" id="resumeFileInput" accept=".pdf,.doc,.docx"
        style="width:100%;padding:12px;margin-bottom:12px;border:none;border-radius:12px;background:#364852;color:white;font-size:15px;" />

      <div id="resumeSelectedFile" style="font-size:14px;opacity:.85;margin-bottom:16px;">No file selected</div>

      <div style="display:flex;gap:10px;">
        <button onclick="sendResumeApplication()" style="
          flex:1;
          padding:14px;
          border:none;
          border-radius:14px;
          font-size:16px;
          font-weight:700;
          cursor:pointer;
          background: linear-gradient(90deg, #16d4fc, #0b84ff);
          color:white;
        ">📤 Send Resume</button>

        <button onclick="closeResumeModal()" style="
          flex:1;
          padding:14px;
          border:none;
          border-radius:14px;
          font-size:16px;
          font-weight:700;
          cursor:pointer;
          background: #ff5c5c;
          color:white;
        ">❌ Cancel</button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  const fileInput = document.getElementById("resumeFileInput");
  fileInput.addEventListener("change", function () {
    const fileName = this.files[0] ? this.files[0].name : "No file selected";
    document.getElementById("resumeSelectedFile").innerText = `Selected: ${fileName}`;
  });
}

// Resume modal state
let currentApplyData = {
  companyEmail: "",
  jobTitle: ""
};

function openResumeModal(companyEmail = "", jobTitle = "Job") {
  currentApplyData.companyEmail = companyEmail || "";
  currentApplyData.jobTitle = jobTitle || "Job";

  document.getElementById("resumeModal").style.display = "flex";
  document.getElementById("resumeName").value = "";
  document.getElementById("resumeEmail").value = "";
  document.getElementById("resumeFileInput").value = "";
  document.getElementById("resumeSelectedFile").innerText = "No file selected";
}

function closeResumeModal() {
  document.getElementById("resumeModal").style.display = "none";
}

// ----------------------
// LOGIN ADMIN
// ----------------------
async function loginAdmin() {
  const username = document.getElementById("adminUsername")?.value.trim();
  const password = document.getElementById("adminPassword")?.value.trim();

  if (!username || !password) {
    alert("Enter username and password");
    return;
  }

  try {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || "Login failed");
      return;
    }

    localStorage.setItem("adminToken", data.token);
    localStorage.setItem("isAdminLoggedIn", "true");

    alert("Login successful");
    window.location.reload();
  } catch (error) {
    console.error("Login error:", error);
    alert("Login error");
  }
}

// ----------------------
// UPDATE ADMIN CREDENTIALS
// ----------------------
async function updateCredentials() {
  const newUsername = document.getElementById("newUsername")?.value.trim();
  const newPassword = document.getElementById("newPassword")?.value.trim();

  if (!newUsername || !newPassword) {
    alert("Enter new username and password");
    return;
  }

  try {
    const res = await fetch(`${API_URL}/auth/update-admin`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`
      },
      body: JSON.stringify({
        username: newUsername,
        password: newPassword
      })
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || "Failed to update credentials");
      return;
    }

    alert("Admin credentials updated successfully");
    document.getElementById("newUsername").value = "";
    document.getElementById("newPassword").value = "";
  } catch (error) {
    console.error("Credential update error:", error);
    alert("Error updating credentials");
  }
}

// ----------------------
// AUTO FILL JOB FROM TEXT
// ----------------------
function autoFillJob() {
  const rawText = document.getElementById("jobPaste")?.value || "";
  if (!rawText.trim()) {
    alert("Paste job post first");
    return;
  }

  const clean = rawText.replace(/\*/g, "").replace(/\r/g, "");

  let title = "";
  const titlePatterns = [
    /Role\s*[-:]\s*(.+)/i,
    /Position\s*[-:]\s*(.+)/i,
    /Hiring\s+for\s+(.+)/i,
    /Latest Hiring.*for\s+(.+)/i,
    /Opening.*for\s+(.+)/i
  ];
  for (let pattern of titlePatterns) {
    const match = clean.match(pattern);
    if (match && match[1]) {
      title = match[1].split("\n")[0].trim();
      break;
    }
  }

  let company = "";
  const companyPatterns = [
    /Company\s*[-:]\s*(.+)/i,
    /Greetings from\s+(.+)/i
  ];
  for (let pattern of companyPatterns) {
    const match = clean.match(pattern);
    if (match && match[1]) {
      company = match[1].split("\n")[0].trim();
      break;
    }
  }

  let location = "";
  const locationPatterns = [
    /Location\s*[-:]\s*(.+)/i,
    /📍\s*Location\s*[-:]\s*(.+)/i
  ];
  for (let pattern of locationPatterns) {
    const match = clean.match(pattern);
    if (match && match[1]) {
      location = match[1].split("\n")[0].trim();
      break;
    }
  }

  let salary = "";
  const salaryPatterns = [
    /Salary\s*[-:]\s*(.+)/i,
    /CTC\s*[-:]\s*(.+)/i,
    /💰\s*Salary.*?[-:]\s*(.+)/i,
    /(Rs\.?\s*[\d\-–+,./\sA-Za-z()]+LPA)/i,
    /(₹\s*[\d\-–+,./\sA-Za-z()]+)/i
  ];
  for (let pattern of salaryPatterns) {
    const match = clean.match(pattern);
    if (match && match[1]) {
      salary = match[1].split("\n")[0].trim();
      break;
    }
  }

  let applyLink = "";
  const links = clean.match(/https?:\/\/[^\s]+/g);
  if (links && links.length > 0) {
    applyLink = links[0];
  }

  let companyEmail = "";
  const emailMatch = clean.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[A-Za-z]{2,}/);
  if (emailMatch) {
    companyEmail = emailMatch[0];
  }

  const description = clean.trim();

  document.getElementById("jobTitle").value = title || "Jobs in India";
  document.getElementById("company").value = company || "Confidential Company";
  document.getElementById("location").value = location || "India";
  document.getElementById("salary").value = salary || "Not Disclosed";
  document.getElementById("description").value = description || "";
  document.getElementById("applyLink").value = applyLink || "";
  document.getElementById("companyEmail").value = companyEmail || "";

  alert("Job fields auto-filled successfully");
}

// ----------------------
// ADD JOB
// ----------------------
async function addJob() {
  const title = document.getElementById("jobTitle")?.value.trim() || "Jobs in India";
  const company = document.getElementById("company")?.value.trim() || "Confidential Company";
  const location = document.getElementById("location")?.value.trim() || "India";
  const salary = document.getElementById("salary")?.value.trim() || "Not Disclosed";
  const description = document.getElementById("description")?.value.trim() || "";
  const applyLink = document.getElementById("applyLink")?.value.trim() || "";
  const referral = document.getElementById("referral")?.value.trim() || "";
  const companyEmail = document.getElementById("companyEmail")?.value.trim() || "";

  try {
    const res = await fetch(`${API_URL}/jobs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`
      },
      body: JSON.stringify({
        title,
        company,
        location,
        salary,
        description,
        applyLink,
        referral,
        companyEmail
      })
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || "Failed to add job");
      return;
    }

    alert("Job added successfully");

    document.getElementById("jobTitle").value = "";
    document.getElementById("company").value = "";
    document.getElementById("location").value = "";
    document.getElementById("salary").value = "";
    document.getElementById("description").value = "";
    document.getElementById("applyLink").value = "";
    document.getElementById("referral").value = "";
    document.getElementById("companyEmail").value = "";
    if (document.getElementById("jobPaste")) {
      document.getElementById("jobPaste").value = "";
    }

    loadJobs(true);
  } catch (error) {
    console.error("Add job error:", error);
    alert("Error adding job");
  }
}

// ----------------------
// LOAD JOBS
// ----------------------
async function loadJobs(showDelete = false) {
  try {
    const res = await fetch(`${API_URL}/jobs`);
    const jobs = await res.json();

    const jobsContainer = document.getElementById("jobs");
    if (!jobsContainer) return;

    jobsContainer.innerHTML = "";

    jobs.forEach((job) => {
      const card = document.createElement("div");
      card.className = "job-card glass";

      card.innerHTML = `
        <h3>${job.title || "Jobs in India"}</h3>
        <h4>${job.company || "Confidential Company"}</h4>
        <p>📍 ${job.location || "India"}</p>
        <p>💰 Salary: ${job.salary || "Not Disclosed"}</p>
        <p><strong>JD:</strong> ${job.description || "No description available"}</p>
        ${
          job.applyLink
            ? `<a href="${job.applyLink}" target="_blank" class="apply-link">Apply Now</a>`
            : ""
        }

        <button class="apply-btn" onclick='openResumeModal(${JSON.stringify(
          job.companyEmail || ""
        )}, ${JSON.stringify(job.title || "Job")})'>
          Apply with Resume
        </button>

        ${
          showDelete
            ? `<button class="delete-btn" onclick="deleteJob('${job._id}')">Delete</button>`
            : ""
        }
      `;

      jobsContainer.appendChild(card);
    });
  } catch (error) {
    console.error("Load jobs error:", error);
  }
}

// ----------------------
// DELETE JOB
// ----------------------
async function deleteJob(id) {
  if (!confirm("Are you sure you want to delete this job?")) return;

  try {
    const res = await fetch(`${API_URL}/jobs/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${getToken()}`
      }
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || "Failed to delete");
      return;
    }

    alert("Job deleted successfully");
    loadJobs(true);
  } catch (error) {
    console.error("Delete job error:", error);
    alert("Error deleting job");
  }
}

// ----------------------
// SEND RESUME APPLICATION
// ----------------------
async function sendResumeApplication() {
  const name = document.getElementById("resumeName").value.trim();
  const email = document.getElementById("resumeEmail").value.trim();
  const fileInput = document.getElementById("resumeFileInput");
  const file = fileInput.files[0];

  if (!name || !email) {
    alert("Please enter name and email");
    return;
  }

  if (!file) {
    alert("Please choose resume file");
    return;
  }

  const formData = new FormData();
  formData.append("name", name);
  formData.append("email", email);
  formData.append("companyEmail", currentApplyData.companyEmail || "");
  formData.append("jobTitle", currentApplyData.jobTitle || "Job");
  formData.append("resume", file);

  try {
    const res = await fetch(`${API_URL}/jobs/apply`, {
      method: "POST",
      body: formData
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || "Application failed");
      return;
    }

    alert(data.message || "Resume sent successfully");
    closeResumeModal();
  } catch (error) {
    console.error("Apply error:", error);
    alert("Error sending application");
  }
}

// ----------------------
// SEARCH FILTER
// ----------------------
function filterJobs() {
  const input = document.getElementById("searchInput");
  if (!input) return;

  const filter = input.value.toLowerCase();
  const cards = document.querySelectorAll(".job-card");

  cards.forEach((card) => {
    const text = card.innerText.toLowerCase();
    card.style.display = text.includes(filter) ? "block" : "none";
  });
}