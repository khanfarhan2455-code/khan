import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import nodemailer from "nodemailer";

const app = express();
const PORT = 3000;
const DB_FILE = path.join(process.cwd(), "bookings-db.json");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ensure database file holds valid structure on start
if (!fs.existsSync(DB_FILE)) {
  fs.writeFileSync(DB_FILE, JSON.stringify([], null, 2), "utf8");
}

// Interface for rich persistence 
interface Booking {
  id: string;
  date: string;
  time: string;
  customerName: string;
  mobileNumber: string;
  customerEmail: string;
  applianceType: string;
  serviceRequired: string;
  area: string;
  address: string;
  preferredDate: string;
  additionalNotes: string;
  status: "New" | "Assigned" | "Completed";
  express: boolean;
  warranty: boolean;
  visitingFee: number;
  deliveryTries?: {
    emailAdmin: number;
    emailCustomer: number;
    sheets: number;
    whatsapp: number;
  };
  errors?: string[];
}

// Helper to safely load database
function loadBookings(): Booking[] {
  try {
    const data = fs.readFileSync(DB_FILE, "utf8");
    return JSON.parse(data);
  } catch (err) {
    console.error("Error reading database file, returning empty list", err);
    return [];
  }
}

// Helper to safely save database
function saveBookings(bookings: Booking[]) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(bookings, null, 2), "utf8");
  } catch (err) {
    console.error("Error writing database file", err);
  }
}

// Helper function to send email via SMTP with automatic retries (up to 3 times)
async function sendEmailWithRetry(
  mailOptions: nodemailer.SendMailOptions,
  maxRetries = 3
): Promise<{ success: boolean; tries: number; error?: string }> {
  const host = process.env.SMTP_HOST || "";
  const port = parseInt(process.env.SMTP_PORT || "587", 10);
  const user = process.env.SMTP_USER || "";
  const pass = process.env.SMTP_PASS || "";
  const sender = process.env.SMTP_SENDER || `Rapid Cool Support <${user}>`;

  if (!host || !user || !pass) {
    console.warn("SMTP settings are not configured in environment. Skipping real email send.");
    return { success: false, tries: 0, error: "SMTP credentials not provided in .env example" };
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass,
    },
  });

  const finalOptions = {
    from: sender,
    ...mailOptions,
  };

  let attempt = 0;
  while (attempt < maxRetries) {
    attempt++;
    try {
      await transporter.sendMail(finalOptions);
      console.log(`Email delivered successfully to ${mailOptions.to} on attempt ${attempt}`);
      return { success: true, tries: attempt };
    } catch (err: any) {
      console.error(`Email delivery failed on attempt ${attempt} out of ${maxRetries}:`, err.message);
      if (attempt >= maxRetries) {
        return { success: false, tries: attempt, error: err.message };
      }
      // Simple timeout delay before retry
      await new Promise((resolve) => setTimeout(resolve, 1500));
    }
  }

  return { success: false, tries: attempt, error: "Unknown failure" };
}

// Helper function to trigger Google Sheets Apps Script webhook with retries
async function sendToGoogleSheetsWithRetry(
  booking: Booking,
  maxRetries = 3
): Promise<{ success: boolean; tries: number; error?: string }> {
  const webhookUrl = process.env.GOOGLE_SHEET_WEBHOOK_URL;
  if (!webhookUrl) {
    console.log("No Google Sheets App Script URL is set. Skipping Sheets sync.");
    return { success: false, tries: 0, error: "No GOOGLE_SHEET_WEBHOOK_URL in .env" };
  }

  let attempt = 0;
  while (attempt < maxRetries) {
    attempt++;
    try {
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "addBooking",
          ...booking,
        }),
      });

      if (response.ok) {
        console.log(`Google Sheets row appended safely on attempt ${attempt}`);
        return { success: true, tries: attempt };
      } else {
        throw new Error(`Response HTTP status: ${response.status}`);
      }
    } catch (err: any) {
      console.error(`Google Sheets webhook failed on attempt ${attempt} out of ${maxRetries}:`, err.message);
      if (attempt >= maxRetries) {
        return { success: false, tries: attempt, error: err.message };
      }
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  return { success: false, tries: attempt, error: "Sheets webhook failed" };
}

// API Routes go here first

// Admin Sign-in Validator
app.post("/api/admin/login", (req, res) => {
  const { username, password } = req.body;
  const configuredUsr = process.env.ADMIN_USERNAME || "admin";
  const configuredPwd = process.env.ADMIN_PASSWORD || "rapidcool2026";

  if (username === configuredUsr && password === configuredPwd) {
    res.json({ success: true, token: "rapid_cool_verified_session_token_2026" });
  } else {
    res.status(401).json({ success: false, error: "Invalid username or password credentials." });
  }
});

// Fetch/Filter Bookings
app.get("/api/bookings", (req, res) => {
  const { q, suburb, date, status } = req.query;
  let list = loadBookings();

  if (q) {
    const query = String(q).toLowerCase();
    list = list.filter(
      (b) =>
        b.customerName.toLowerCase().includes(query) ||
        b.id.toLowerCase().includes(query) ||
        b.mobileNumber.toLowerCase().includes(query) ||
        b.address.toLowerCase().includes(query)
    );
  }

  if (suburb) {
    list = list.filter((b) => b.area === String(suburb));
  }

  if (date) {
    list = list.filter((b) => b.preferredDate === String(date));
  }

  if (status) {
    list = list.filter((b) => b.status === String(status));
  }

  res.json({ success: true, bookings: list });
});

// Create fresh booking
app.post("/api/bookings", async (req, res) => {
  try {
    const {
      customerName,
      mobileNumber,
      customerEmail,
      applianceType,
      serviceRequired,
      area,
      address,
      preferredDate,
      additionalNotes,
      express,
      warranty,
      visitingFee,
    } = req.body;

    // Validate inputs
    if (!customerName || !mobileNumber || !address || !area) {
      return res.status(400).json({ success: false, error: "Please fill in all core billing details securely." });
    }

    const cleanedPhone = String(mobileNumber).trim().replace(/\D/g, "");
    if (cleanedPhone.length < 10) {
      return res.status(400).json({ success: false, error: "Please make sure phone is a valid 10-digit number." });
    }

    // Prevent duplicate active submissions within same hour for same phone & appliance
    const list = loadBookings();
    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    const isDuplicate = list.some((b) => {
      const matchPhone = b.mobileNumber.replace(/\D/g, "") === cleanedPhone;
      const matchType = b.applianceType === applianceType;
      const isRecent = new Date(`${b.date} ${b.time}`).getTime() > oneHourAgo;
      return matchPhone && matchType && isRecent && b.status !== "Completed";
    });

    if (isDuplicate) {
      return res.status(400).json({
        success: false,
        error: "A recent booking for this appliance is already registered on this number. We're actively dispatching!",
      });
    }

    // Build precise UTC & IST timings
    const now = new Date();
    const formattedDate = now.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
    const formattedTime = now.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    const uniqueId = `RC-${Math.floor(100000 + Math.random() * 900000)}-MUM`;

    const newBooking: Booking = {
      id: uniqueId,
      date: formattedDate,
      time: formattedTime,
      customerName: String(customerName).trim(),
      mobileNumber: cleanedPhone,
      customerEmail: String(customerEmail || "").trim(),
      applianceType: applianceType || "General AC & Fridge Diagnostics",
      serviceRequired: serviceRequired || "Visiting Inspection & Repair Estimator",
      area: area,
      address: String(address).trim(),
      preferredDate: preferredDate || formattedDate,
      additionalNotes: String(additionalNotes || "").trim(),
      status: "New",
      express: !!express,
      warranty: !!warranty,
      visitingFee: visitingFee ? parseFloat(visitingFee) : 299,
      deliveryTries: {
        emailAdmin: 0,
        emailCustomer: 0,
        sheets: 0,
        whatsapp: 0,
      },
      errors: [],
    };

    // Parallel Background notifications with Automatic Retries
    const errors: string[] = [];

    // 1. Email Admin Notification
    const adminMail = {
      to: "rapidcoolOservices@gmail.com",
      subject: `New Service Booking - ${newBooking.customerName}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; max-width: 600px; border-radius: 8px;">
          <h2 style="color: #0f5fc2; border-bottom: 2px solid #0f5fc2; padding-bottom: 8px;">NEW RAPID COOL BOOKING</h2>
          <table style="width: 100%; text-align: left; border-collapse: collapse; margin-top: 15px;">
            <tr><th style="padding: 6px; border-bottom: 1px solid #f0f0f0;">Booking ID</th><td style="padding: 6px; border-bottom: 1px solid #f0f0f0; font-weight: bold; color: #d97706;">${newBooking.id}</td></tr>
            <tr><th style="padding: 6px; border-bottom: 1px solid #f0f0f0;">Customer Name</th><td style="padding: 6px; border-bottom: 1px solid #f0f0f0;">${newBooking.customerName}</td></tr>
            <tr><th style="padding: 6px; border-bottom: 1px solid #f0f0f0;">Mobile Number</th><td style="padding: 6px; border-bottom: 1px solid #f0f0f0;">+91 ${newBooking.mobileNumber}</td></tr>
            <tr><th style="padding: 6px; border-bottom: 1px solid #f0f0f0;">Email Address</th><td style="padding: 6px; border-bottom: 1px solid #f0f0f0;">${newBooking.customerEmail || "N/A"}</td></tr>
            <tr><th style="padding: 6px; border-bottom: 1px solid #f0f0f0;">Appliance Type</th><td style="padding: 6px; border-bottom: 1px solid #f0f0f0; color: #0f5fc2; font-weight: bold;">${newBooking.applianceType}</td></tr>
            <tr><th style="padding: 6px; border-bottom: 1px solid #f0f0f0;">Service Required</th><td style="padding: 6px; border-bottom: 1px solid #f0f0f0;">${newBooking.serviceRequired}</td></tr>
            <tr><th style="padding: 6px; border-bottom: 1px solid #f0f0f0;">Mumbai Suburb</th><td style="padding: 6px; border-bottom: 1px solid #f0f0f0;">${newBooking.area}</td></tr>
            <tr><th style="padding: 6px; border-bottom: 1px solid #f0f0f0;">Address</th><td style="padding: 6px; border-bottom: 1px solid #f0f0f0;">${newBooking.address}</td></tr>
            <tr><th style="padding: 6px; border-bottom: 1px solid #f0f0f0;">Preferred Date</th><td style="padding: 6px; border-bottom: 1px solid #f0f0f0;">${newBooking.preferredDate}</td></tr>
            <tr><th style="padding: 6px; border-bottom: 1px solid #f0f0f0;">Estimated Bill</th><td style="padding: 6px; border-bottom: 1px solid #f0f0f0; font-weight: bold;">₹${newBooking.visitingFee}</td></tr>
            <tr><th style="padding: 6px; border-bottom: 1px solid #f0f0f0;">Booking Date/Time</th><td style="padding: 6px; border-bottom: 1px solid #f0f0f0; color: #666;">${newBooking.date} • ${newBooking.time}</td></tr>
            <tr><th style="padding: 6px; border-bottom: 1px solid #f0f0f0;">Additional Notes</th><td style="padding: 6px; border-bottom: 1px solid #f0f0f0; font-style: italic;">${newBooking.additionalNotes || "None"}</td></tr>
          </table>
          <p style="margin-top: 20px; font-size: 11px; color: #888; text-align: center;">Rapid Cool Services - Premium Doorstep Diagnostics</p>
        </div>
      `,
    };

    const adminEmailResult = await sendEmailWithRetry(adminMail);
    if (newBooking.deliveryTries) {
      newBooking.deliveryTries.emailAdmin = adminEmailResult.tries;
    }
    if (!adminEmailResult.success) {
      errors.push(`Admin Email delivery skipped or failed: ${adminEmailResult.error}`);
    }

    // 2. Email Customer Booking Confirmation (if email entered)
    if (newBooking.customerEmail) {
      const customerMail = {
        to: newBooking.customerEmail,
        subject: `Appointment Confirmed - Rapid Cool Services [ID: ${newBooking.id}]`,
        html: `
          <div style="font-family: Arial, sans-serif; padding: 25px; border: 1px solid #0f5fc2; max-width: 650px; border-radius: 12px; background-color: #fcfdfe;">
            <div style="background-color: #011e41; padding: 15px; border-radius: 8px; text-align: center; color: white;">
              <h2 style="margin: 0; font-size: 20px; tracking: 1px;">RAPID COOL SERVICES</h2>
              <p style="margin: 5px 0 0; font-size: 12px; color: #38bdf8;">Certified Professional Appliance Diagnostics</p>
            </div>
            
            <p style="font-size: 14px; margin-top: 20px; color: #333;">Dear <strong>${newBooking.customerName}</strong>,</p>
            <p style="font-size: 13px; color: #444; line-height: 1.6;">
              Thank you for choosing Rapid Cool Services. Your doorstep repair appointment has been scheduled successfully. An expert service representative will contact you shortly to coordinate arrival.
            </p>

            <div style="background-color: #f1f5f9; padding: 15px; border-radius: 8px; margin: 25px 0;">
              <span style="display: block; font-size: 11px; color: #64748b; font-weight: bold; text-transform: uppercase;">Reference Ticket ID</span>
              <strong style="font-size: 18px; color: #b45309; letter-spacing: 1px;">${newBooking.id}</strong>
              
              <div style="margin-top: 15px; border-top: 1px solid #e2e8f0; padding-top: 12px; font-size: 12px; color: #475569;">
                <p style="margin: 4px 0;"><strong>Appliance Scheduled:</strong> ${newBooking.applianceType}</p>
                <p style="margin: 4px 0;"><strong>Service Category:</strong> ${newBooking.serviceRequired}</p>
                <p style="margin: 4px 0;"><strong>Visiting Charge Rate:</strong> ₹${newBooking.visitingFee}</p>
                <p style="margin: 4px 0;"><strong>Preferred Date:</strong> ${newBooking.preferredDate}</p>
                <p style="margin: 4px 0;"><strong>Expected Engineer Response:</strong> Under 15 Minutes ⚡</p>
              </div>
            </div>

            <div style="border-left: 4px dashed #38bdf8; padding-left: 15px; margin: 20px 0; font-size: 12px; color: #0f5fc2;">
              <strong>Special Benefit:</strong> The doorstep Visiting Charge of ₹${newBooking.visitingFee} will be fully waived and adjusted inside your final invoice when you proceed with our engineer's recommended repairs!
            </div>

            <p style="font-size: 12px; color: #666; text-align: center; margin-top: 25px;">
              Need immediate assistance? Ring our central Mumbai helpline at <strong>+91 9082213527</strong>.
            </p>
          </div>
        `,
      };

      const customerEmailResult = await sendEmailWithRetry(customerMail);
      if (newBooking.deliveryTries) {
        newBooking.deliveryTries.emailCustomer = customerEmailResult.tries;
      }
      if (!customerEmailResult.success) {
        errors.push(`Customer Confirmation Email failed: ${customerEmailResult.error}`);
      }
    }

    // 3. Sync to Google Sheets apps script (if URL provided)
    const sheetsResult = await sendToGoogleSheetsWithRetry(newBooking);
    if (newBooking.deliveryTries) {
      newBooking.deliveryTries.sheets = sheetsResult.tries;
    }
    if (!sheetsResult.success && process.env.GOOGLE_SHEET_WEBHOOK_URL) {
      errors.push(`Google Sheets spreadsheet sync failed: ${sheetsResult.error}`);
    }

    // 4. WhatsApp mock integration logging & delivery report
    console.log(`WhatsApp Notification trigger simulated successfully to: +919082213527`);
    console.log(`Payload Delivered:
      Booking ID: ${newBooking.id}
      Customer Name: ${newBooking.customerName}
      Phone: ${newBooking.mobileNumber}
      Appliance Type: ${newBooking.applianceType}
      Service Required: ${newBooking.serviceRequired}
      Suburb: ${newBooking.area}
      Address: ${newBooking.address}
      Preferred Date: ${newBooking.preferredDate}
    `);

    // Backup inside Netlify Form structure simulated on Express
    console.log(`Netlify backup form submissions simulated successfully for [BookingID: ${newBooking.id}]`);

    newBooking.errors = errors;

    // Finally append to bookings database
    const currentList = loadBookings();
    currentList.unshift(newBooking);
    saveBookings(currentList);

    return res.status(201).json({
      success: true,
      booking: newBooking,
      errors: errors.length > 0 ? errors : null,
    });
  } catch (err: any) {
    console.error("Booking submission error:", err);
    res.status(500).json({ success: false, error: err.message || "Internal system server booking failure." });
  }
});

// Update booking status from Admin Dashboard
app.patch("/api/bookings/:id", (req, res) => {
  const { id } = req.params;
  const { status, additionalNotes } = req.body;

  const list = loadBookings();
  const index = list.findIndex((b) => b.id === id);

  if (index === -1) {
    return res.status(404).json({ success: false, error: "Referenced booking not found in database." });
  }

  if (status) {
    list[index].status = status;
  }
  if (additionalNotes !== undefined) {
    list[index].additionalNotes = additionalNotes;
  }

  saveBookings(list);

  // Sync to Sheet if URL registered to keep sheet up to date
  const webhookUrl = process.env.GOOGLE_SHEET_WEBHOOK_URL;
  if (webhookUrl) {
    fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "updateBooking", ...list[index] }),
    }).catch((e) => console.error("Sheet Sync error during status update", e));
  }

  res.json({ success: true, booking: list[index] });
});

// Delete booking (for administrative cleanup)
app.delete("/api/bookings/:id", (req, res) => {
  const { id } = req.params;
  const list = loadBookings();
  const filtered = list.filter((b) => b.id !== id);

  if (list.length === filtered.length) {
    return res.status(404).json({ success: false, error: "Booking not found." });
  }

  saveBookings(filtered);
  res.json({ success: true, message: "Booking removed successfully." });
});

// Export Bookings Database as CSV
app.get("/api/bookings/export", (req, res) => {
  const list = loadBookings();

  const headers = [
    "Booking ID",
    "Created Date",
    "Created Time",
    "Customer Name",
    "Mobile Number",
    "Email ID",
    "Appliance Type",
    "Service Required",
    "Mumbai Suburb",
    "Doorstep Address",
    "Preferred Travel Date",
    "Status",
  ];

  const csvRows = [headers.join(",")];

  for (const b of list) {
    const row = [
      `"${b.id}"`,
      `"${b.date}"`,
      `"${b.time}"`,
      `"${b.customerName.replace(/"/g, '""')}"`,
      `"${b.mobileNumber}"`,
      `"${(b.customerEmail || "N/A").replace(/"/g, '""')}"`,
      `"${b.applianceType.replace(/"/g, '""')}"`,
      `"${b.serviceRequired.replace(/"/g, '""')}"`,
      `"${b.area.replace(/"/g, '""')}"`,
      `"${b.address.replace(/"/g, '""')}"`,
      `"${b.preferredDate}"`,
      `"${b.status}"`,
    ];
    csvRows.push(row.join(","));
  }

  const csvContent = csvRows.join("\n");

  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", `attachment; filename=rapid_cool_bookings_${new Date().toISOString().slice(0,10)}.csv`);
  res.status(200).send(csvContent);
});

async function startServer() {
  // Vite Integration for instant code refreshes in dev mode
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // In production, server serves actual transpiled assets
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Rapid Cool Management Server active at http://localhost:${PORT}`);
  });
}

startServer();
