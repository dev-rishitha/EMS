import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mysql from "mysql2/promise";
import bcrypt from "bcryptjs"; 

dotenv.config();

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173", // Vite dev origin
    credentials: true,
  })
);
app.use(express.json());


// DB pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
});

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "Email and password are required" });
  }

  try {
    // join users + employees by email
    const [rows] = await pool.query(
      `SELECT u.*, e.id AS employeeId
       FROM users u
       LEFT JOIN employees e ON e.email = u.email
       WHERE u.email = ?`,
      [email]
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const user = rows[0];

    let isMatch = false;
    if (
      user.password_hash.startsWith("$2a$") ||
      user.password_hash.startsWith("$2b$") ||
      user.password_hash.startsWith("$2y$")
    ) {
      isMatch = await bcrypt.compare(password, user.password_hash);
    } else {
      isMatch = user.password_hash === password;
    }

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    res.json({
      id: user.id,                 // users.id
      employeeId: user.employeeId, // employees.id (or null if somehow missing)
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Register new employee user
app.post("/api/auth/register", async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res
      .status(400)
      .json({ message: "Name, email and password are required" });
  }

  try {
    // 1) Check if user already exists
    const [existingUser] = await pool.query(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );
    if (existingUser.length > 0) {
      return res.status(409).json({ message: "Email already registered" });
    }

    // 2) Hash password
    const hash = await bcrypt.hash(password, 10);

    // 3) Create user with role 'employee'
    const [userResult] = await pool.query(
      "INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, 'employee')",
      [name, email, hash]
    );
    const userId = userResult.insertId;

    // 4) Check if an employee record already exists for this email
    const [existingEmp] = await pool.query(
      "SELECT id FROM employees WHERE email = ?",
      [email]
    );

    let employeeId;

    if (existingEmp.length === 0) {
      // No employee row yet: create one
      const [empResult] = await pool.query(
        "INSERT INTO employees (name, email, department, role) VALUES (?, ?, ?, ?)",
        [name, email, null, "Employee"]
      );
      employeeId = empResult.insertId;
    } else {
      // Employee row already exists: reuse it
      employeeId = existingEmp[0].id;
    }

    res.status(201).json({
      id: userId,
      employeeId,
      name,
      email,
      role: "employee",
    });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Health check
app.get("/api/health", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT 1 AS result");
    res.json({ ok: true, db: rows[0].result });
  } catch (err) {
    console.error("Health check failed:", err);
    res.status(500).json({ ok: false, error: "Database connection error" });
  }
});

// GET /api/attendance?employeeId=...
app.get("/api/attendance", async (req, res) => {
  try {
    const employeeId = req.query.employeeId;
    let rows;
    if (employeeId) {
      // Employee view: specific employee
      [rows] = await pool.query(
        "SELECT date, status, check_in AS checkIn, check_out AS checkOut FROM attendance WHERE employee_id = ? ORDER BY date DESC",
        [employeeId]
      );
    } else {
      // Admin view: all employees
      [rows] = await pool.query(
        `SELECT 
           a.employee_id AS employeeId,
           e.name AS employeeName,
           a.date,
           a.status,
           a.check_in AS checkIn,
           a.check_out AS checkOut
         FROM attendance a
         LEFT JOIN employees e ON e.id = a.employee_id
         ORDER BY a.date DESC`      
      );
    }

    res.json(rows);
  } catch (err) {
      console.error("Error in GET /api/attendance:", err);
      res.status(500).json({ message: "Server error" });
    }
});

// POST /api/attendance/mark
app.post("/api/attendance/mark", async (req, res) => {
  try {
    console.log("MARK ATTENDANCE payload:", req.body);

    const { employeeId, date, type, time } = req.body;

    if (!employeeId || !date || !type || !time) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const [rows] = await pool.query(
      "SELECT * FROM attendance WHERE employee_id = ? AND date = ?",
      [employeeId, date]
    );

    if (rows.length === 0) {
      const checkIn = type === "check-in" ? time : "-";
      const checkOut = type === "check-out" ? time : "-";
      const status = "Present";

      await pool.query(
        "INSERT INTO attendance (employee_id, date, status, check_in, check_out) VALUES (?, ?, ?, ?, ?)",
        [employeeId, date, status, checkIn, checkOut]
      );
    } else {
      const rec = rows[0];

      if (type === "check-in") {
        if (rec.check_in && rec.check_in !== "-") {
          return res.status(400).json({ message: "Already checked in" });
        }
        await pool.query(
          "UPDATE attendance SET check_in = ?, status = 'Present' WHERE id = ?",
          [time, rec.id]
        );
      } else {
        if (!rec.check_in || rec.check_in === "-") {
          return res
            .status(400)
            .json({ message: "Cannot check-out before check-in" });
        }
        if (rec.check_out && rec.check_out !== "-") {
          return res.status(400).json({ message: "Already checked out" });
        }
        await pool.query(
          "UPDATE attendance SET check_out = ? WHERE id = ?",
          [time, rec.id]
        );
      }
    }

    res.json({ success: true });
  } catch (err) {
    console.error("Error in /api/attendance/mark:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// utils: get all employees
async function getAllEmployees() {
  const [rows] = await pool.query(
    "SELECT id, name FROM employees"
  );
  return rows;
}

// POST /api/attendance/auto-mark-absent
// body: { date: "YYYY-MM-DD" }
app.post("/api/attendance/auto-mark-absent", async (req, res) => {
  try {
    const { date } = req.body;
    if (!date) {
      return res.status(400).json({ message: "date is required (YYYY-MM-DD)" });
    }

    // 1) all employees
    const employees = await getAllEmployees();

    // 2) existing attendance rows for that date
    const [rows] = await pool.query(
      "SELECT employee_id FROM attendance WHERE date = ?",
      [date]
    );
    const alreadyMarked = new Set(rows.map((r) => r.employee_id));

    // 3) insert Absent for all employees with no row
    const values = [];
    employees.forEach((emp) => {
      if (!alreadyMarked.has(emp.id)) {
        values.push([emp.id, date, "Absent", "-", "-"]);
      }
    });

    if (values.length > 0) {
      await pool.query(
        "INSERT INTO attendance (employee_id, date, status, check_in, check_out) VALUES ?",
        [values]
      );
    }

    res.json({
      success: true,
      markedAbsent: values.length,
    });
  } catch (err) {
    console.error("Error in /api/attendance/auto-mark-absent:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get notifications for current user (admin for now)
app.get("/api/notifications", requireAuth, async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, type, title, message, is_read AS isRead, created_at AS createdAt FROM notifications WHERE user_id = ? ORDER BY created_at DESC",
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    console.error("Error fetching notifications:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Mark all as read
app.post("/api/notifications/mark-all-read", requireAuth, async (req, res) => {
  try {
    await pool.query(
      "UPDATE notifications SET is_read = 1 WHERE user_id = ? AND is_read = 0",
      [req.user.id]
    );
    res.json({ success: true });
  } catch (err) {
    console.error("Error marking notifications as read:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get activity log (audit history)
app.get("/api/activity-log", async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, actor_role, category, action, entity_type, entity_id,
              summary, details, created_at AS createdAt
       FROM activity_log
       ORDER BY created_at DESC
       LIMIT 500`
    );
    res.json(rows);
  } catch (err) {
    console.error("Error fetching activity log:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Temporary auth stub
function requireAuth(req, res, next) {
  // In real app, read from session/JWT
  // For now, hard-code an admin user
  req.user = {
    id: 1,
    name: "Admin User",
    email: "admin@gmail.com",
    role: "admin",
  };
  next();
}

app.get("/api/settings", requireAuth, async (req, res) => {
  try {
    const [userRows] = await pool.query(
      "SELECT id, name, email, role FROM users WHERE id = ?",
      [req.user.id]
    );
    const dbUser = userRows[0];

    const [orgRows] = await pool.query(
      "SELECT org_name, org_timezone, working_days FROM organization_settings WHERE id = 1"
    );

    const org = orgRows[0];

    const [prefRows] = await pool.query(
      "SELECT email_notifications, weekly_summary, in_app_sounds FROM user_preferences WHERE user_id = ?",
      [req.user.id]
    );
    const prefs = prefRows[0] || {
      email_notifications: 1,
      weekly_summary: 0,
      in_app_sounds: 0,
    };

    res.json({
      user: {
        id: dbUser.id,
        name: dbUser.name,
        email: dbUser.email,
        role: dbUser.role,
      },
      preferences: {
        emailNotifications: !!prefs.email_notifications,
        weeklySummary: !!prefs.weekly_summary,
        inAppSounds: !!prefs.in_app_sounds,
      },
      organization: {
        orgName: org.org_name,
        orgTimezone: org.org_timezone,
        workingDays: org.working_days,
      },
    });
  } catch (err) {
    console.error("Error in GET /api/settings:", err);
    res.status(500).json({ message: "Server error" });
  }
});

app.put("/api/settings", requireAuth, async (req, res) => {
  const { name, email } = req.body;
  const userId = req.user.id;

  try {
    await pool.query(
      "UPDATE users SET name = ?, email = ? WHERE id = ?",
      [name, email, userId]
    );

    // keep stub in sync for the current process
    req.user.name = name;
    req.user.email = email;

    res.json({ message: "User settings updated" });
  } catch (err) {
    console.error("Error updating user settings:", err);
    res.status(500).json({ message: "Server error" });
  }
});

app.put("/api/settings/preferences", requireAuth, async (req, res) => {
  const { emailNotifications, weeklySummary, inAppSounds } = req.body;
  const userId = req.user.id;

  try {
    await pool.query(
      `INSERT INTO user_preferences (user_id, email_notifications, weekly_summary, in_app_sounds)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         email_notifications = VALUES(email_notifications),
         weekly_summary = VALUES(weekly_summary),
         in_app_sounds = VALUES(in_app_sounds)`,
      [
        userId,
        emailNotifications ? 1 : 0,
        weeklySummary ? 1 : 0,
        inAppSounds ? 1 : 0,
      ]
    );

    res.json({ message: "Preferences updated" });
  } catch (err) {
    console.error("Error updating preferences:", err);
    res.status(500).json({ message: "Server error" });
  }
});

app.put("/api/settings/organization", requireAuth, async (req, res) => {
  const { orgName, orgTimezone, workingDays } = req.body;

  try {
    await pool.query(
      "UPDATE organization_settings SET org_name = ?, org_timezone = ?, working_days = ? WHERE id = 1",
      [orgName, orgTimezone, workingDays]
    );
    res.json({ message: "Organization settings updated" });
  } catch (err) {
    console.error("Error updating organization settings:", err);
    res.status(500).json({ message: "Server error" });
  }
});


/* EMPLOYEES ------------------------------------------------------ */

// Get all employees (with optional status filter)
app.get("/api/employees", async (req, res) => {
  try {
    const { status } = req.query; // e.g. Active, On Leave, Inactive
    let sql = "SELECT * FROM employees";
    const params = [];

    if (status) {
      sql += " WHERE status = ?";
      params.push(status);
    }

    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error("Error fetching employees:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get one employee by id
app.get("/api/employees/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query("SELECT * FROM employees WHERE id = ?", [id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: "Employee not found" });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error("Error fetching employee:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Create new employee
app.post("/api/employees", async (req, res) => {
  const { name, email, department, role } = req.body;
  if (!name || !email) {
    return res.status(400).json({ message: "Name and email are required" });
  }

  try {
    const [result] = await pool.query(
      "INSERT INTO employees (name, email, department, role) VALUES (?, ?, ?, ?)",
      [name, email, department || null, role || null]
    );
    res
      .status(201)
      .json({ id: result.insertId, name, email, department, role });
  } catch (err) {
    console.error("Error creating employee:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Update employee
app.put("/api/employees/:id", async (req, res) => {
  const { id } = req.params;
  const { name, email, department, role } = req.body;

  try {
    const [result] = await pool.query(
      "UPDATE employees SET name = ?, email = ?, department = ?, role = ? WHERE id = ?",
      [name, email, department || null, role || null, id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Employee not found" });
    }
    res.json({ message: "Employee updated" });
  } catch (err) {
    console.error("Error updating employee:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Delete employee
app.delete("/api/employees/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await pool.query("DELETE FROM employees WHERE id = ?", [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Employee not found" });
    }
    res.json({ message: "Employee deleted" });
  } catch (err) {
    console.error("Error deleting employee:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* LEAVES --------------------------------------------------------- */

// Get leave requests with optional filters
// /api/leaves?mode=this_week|this_month|custom&start=YYYY-MM-DD&end=YYYY-MM-DD
app.get("/api/leaves", async (req, res) => {
  const { mode, start, end } = req.query;

  let where = "1=1";
  const params = [];

  if (mode === "this_month") {
    where += ` AND requested_on >= DATE_FORMAT(CURDATE(), '%Y-%m-01')
               AND requested_on < DATE_FORMAT(DATE_ADD(CURDATE(), INTERVAL 1 MONTH), '%Y-%m-01')`;
  } else if (mode === "this_week") {
    // Monday–Sunday of current week
    where += ` AND requested_on >= DATE_SUB(CURDATE(), INTERVAL (WEEKDAY(CURDATE())) DAY)
               AND requested_on < DATE_ADD(DATE_SUB(CURDATE(), INTERVAL (WEEKDAY(CURDATE())) DAY), INTERVAL 7 DAY)`;
  } else if (mode === "custom" && start && end) {
    where += " AND requested_on BETWEEN ? AND ?";
    params.push(start, end);
  }

  try {
    const [rows] = await pool.query(
      `SELECT * FROM leaves WHERE ${where} ORDER BY requested_on DESC`,
      params
    );
    res.json(rows);
  } catch (err) {
    console.error("Error fetching leaves:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Create new leave request
app.post("/api/leaves", async (req, res) => {
  const {
    employeeName,
    employeeEmail,
    type,
    startDate,
    endDate,
    days,
    reason,
    requestedOn,
    employeeId = null,
  } = req.body;

  if (
    !employeeName ||
    !employeeEmail ||
    !type ||
    !startDate ||
    !endDate ||
    !days ||
    !reason
  ) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    const [result] = await pool.query(
      `INSERT INTO leaves 
       (employee_id, employee_name, employee_email, type, start_date, end_date, days, status, reason, manager_note, requested_on)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'Pending', ?, NULL, ?)`,
      [
        employeeId,
        employeeName,
        employeeEmail,
        type,
        startDate,
        endDate,
        days,
        reason,
        requestedOn,
      ]
    );

    const leaveId = result.insertId;

    // 1) Activity log: employee requested leave
    await pool.query(
      `INSERT INTO activity_log
       (actor_id, actor_role, category, action, entity_type, entity_id, summary, details)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        null,
        "employee",
        "leave",
        "leave_requested",
        "leave",
        leaveId,
        `Leave requested by ${employeeName}`,
        `${employeeName} requested ${type} leave from ${startDate} to ${endDate} (${days} days).`,
      ]
    );

    // 2) Notification: admin must review leave
    await pool.query(
      `INSERT INTO notifications (user_id, type, title, message)
       VALUES (?, ?, ?, ?)`,
      [
        1,
        "warning",
        "New leave request",
        `${employeeName} requested ${type} leave (${startDate} → ${endDate}).`,
      ]
    );

    res.status(201).json({
      id: leaveId,
      employeeId,
      employeeName,
      employeeEmail,
      type,
      startDate,
      endDate,
      days,
      status: "Pending",
      reason,
      managerNote: null,
      requestedOn,
    });
  } catch (err) {
    console.error("Error creating leave:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/leaves/analytics?start=YYYY-MM-DD&end=YYYY-MM-DD
app.get("/api/leaves/analytics", async (req, res) => {
  const { start, end } = req.query;

  let where = "1=1";
  const params = [];

  if (start && end) {
    where += " AND start_date >= ? AND end_date <= ?";
    params.push(start, end);
  }

  try {
    const [rows] = await pool.query(
      `SELECT employee_id, employee_email, type, days, start_date, end_date
       FROM leaves
       WHERE ${where}`,
      params
    );

    if (!rows.length) {
      return res.json({
        avgDaysPerEmployee: 0,
        mostCommonType: null,
        upcomingNext7: 0,
      });
    }

    // Average leave days per employee
    const byEmp = new Map();
    let typeCounts = {};
    const now = new Date();
    const LIMIT = 7 * 24 * 60 * 60 * 1000;
    let upcomingNext7 = 0;

    rows.forEach((l) => {
      const key = l.employee_id || l.employee_email;
      byEmp.set(key, (byEmp.get(key) || 0) + Number(l.days || 0));

      typeCounts[l.type] = (typeCounts[l.type] || 0) + 1;

      const startDate = new Date(l.start_date);
      if (!isNaN(startDate.getTime())) {
        const diff = startDate - now;
        if (diff >= 0 && diff <= LIMIT) {
          upcomingNext7 += 1;
        }
      }
    });

    let totalDays = 0;
    byEmp.forEach((v) => (totalDays += v));
    const avgDaysPerEmployee = totalDays / byEmp.size;

    const mostCommonType =
      Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0][0];

    res.json({
      avgDaysPerEmployee: Number(avgDaysPerEmployee.toFixed(1)),
      mostCommonType,
      upcomingNext7,
    });
  } catch (err) {
    console.error("Error in /api/leaves/analytics:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Update leave status (approve / reject + manager note)
app.patch("/api/leaves/:id/status", async (req, res) => {
  const { id } = req.params;
  const { status, managerNote } = req.body;

  if (!["Pending", "Approved", "Rejected"].includes(status)) {
    return res.status(400).json({ message: "Invalid status" });
  }

  try {
    // Get leave details first (for log + notifications)
    const [leaveRows] = await pool.query(
      "SELECT employee_name, type, start_date, end_date FROM leaves WHERE id = ?",
      [id]
    );
    if (leaveRows.length === 0) {
      return res.status(404).json({ message: "Leave request not found" });
    }
    const leave = leaveRows[0];

    const [result] = await pool.query(
      "UPDATE leaves SET status = ?, manager_note = ?, updated_at = NOW() WHERE id = ?",
      [status, managerNote || null, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Leave request not found" });
    }

    // 1) Activity log: admin action
    const summary =
      status === "Approved"
        ? `Leave approved for ${leave.employee_name}`
        : status === "Rejected"
        ? `Leave rejected for ${leave.employee_name}`
        : `Leave status updated for ${leave.employee_name}`;

    // Helper to format YYYY-MM-DD to "DD Mon YYYY"
    const formatDate = (dateStr) => {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    };

    const startLabel = formatDate(leave.start_date);
    const endLabel = formatDate(leave.end_date);

    const details = `Casual leave for ${leave.employee_name} from ${startLabel} to ${endLabel} was approved by the admin.${managerNote ? " Note: " + managerNote : ""}`;

    await pool.query(
      `INSERT INTO activity_log
       (actor_id, actor_role, category, action, entity_type, entity_id, summary, details)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        1, // admin stub
        "admin",
        "leave",
        "leave_status_updated",
        "leave",
        id,
        summary,
        details,
      ]
    );

    // 2) Notification (alert) for admin dashboard (optional but matches your spec)
    await pool.query(
      `INSERT INTO notifications (user_id, type, title, message)
       VALUES (?, ?, ?, ?)`,
      [
        1,
        status === "Approved" ? "success" : "warning",
        status === "Approved" ? "Leave approved" : "Leave rejected",
        details,
      ]
    );

    res.json({ message: "Leave status updated" });
  } catch (err) {
    console.error("Error updating leave status:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get leave stats for dashboard (this month total requests)
app.get("/api/leaves/stats", async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT 
         COUNT(*) AS totalThisMonth
       FROM leaves
       WHERE requested_on >= DATE_FORMAT(CURDATE(), '%Y-%m-01')
         AND requested_on < DATE_FORMAT(DATE_ADD(CURDATE(), INTERVAL 1 MONTH), '%Y-%m-01')`
    );
    res.json(rows[0]);
  } catch (err) {
    console.error("Error in /api/leaves/stats:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* TASKS ---------------------------------------------------------- */

// DB row -> frontend task
function mapTaskRow(row) {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    employeeName: row.employee_name,
    employeeEmail: row.employee_email,
    priority: row.priority || "medium",
    status:
      row.status === "Todo"
        ? "pending"
        : row.status === "In Progress"
        ? "in_progress"
        : "completed",
    dueDate: row.due_date,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    is_seen_by_employee: row.is_seen_by_employee, // important
  };
}

// Get all tasks
app.get("/api/tasks", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM tasks ORDER BY created_at DESC"
    );
    res.json(rows.map(mapTaskRow));
  } catch (err) {
    console.error("Error fetching tasks:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Create new task
app.post("/api/tasks", async (req, res) => {
  console.log("POST /api/tasks body:", req.body);

  const {
    title,
    description,
    employeeName,
    employeeEmail,
    dueDate = null,
  } = req.body;

  if (!title || !employeeName || !employeeEmail) {
    console.log("Missing:", {
      title,
      employeeName,
      employeeEmail,
    });
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    const [result] = await pool.query(
      `INSERT INTO tasks
       (title, description, employee_name, employee_email, status, due_date, is_seen_by_employee)
       VALUES (?, ?, ?, ?, 'Todo', ?, 0)`,
      [title, description || null, employeeName, employeeEmail, dueDate]
    );

    const [rows] = await pool.query("SELECT * FROM tasks WHERE id = ?", [
      result.insertId,
    ]);
    const task = mapTaskRow(rows[0]);

    // Activity log: admin created task
    await pool.query(
      `INSERT INTO activity_log
       (actor_id, actor_role, category, action, entity_type, entity_id, summary, details)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        1, // admin stub
        "admin",
        "task",
        "task_created",
        "task",
        task.id,
        `Task "${task.title}" assigned to ${task.employeeName || "employee"}`,
        `Task "${task.title}" was created and assigned to ${
          task.employeeName || "employee"
        } (${task.employeeEmail}).`,
      ]
    );

    res.status(201).json(task);
  } catch (err) {
    console.error("Error creating task:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Full update task
app.put("/api/tasks/:id", async (req, res) => {
  const { id } = req.params;
  const {
    title,
    description,
    employeeName,
    employeeEmail,
    status,
    priority,
    dueDate,
  } = req.body;

  let dbStatus;
  if (status === "pending") dbStatus = "Todo";
  else if (status === "in_progress") dbStatus = "In Progress";
  else if (status === "completed") dbStatus = "Done";
  else dbStatus = "Todo";

  try {
    // 1) Read current task
    const [rows] = await pool.query("SELECT status FROM tasks WHERE id = ?", [
      id,
    ]);
    if (!rows.length) {
      return res.status(404).json({ message: "Task not found" });
    }

    const current = rows[0];

    // 2) If already completed, do not allow update
    if (current.status === "Done") {
      return res
        .status(400)
        .json({ message: "Completed tasks cannot be edited" });
    }

    // 3) Proceed with update
    const [result] = await pool.query(
      `UPDATE tasks
       SET title = ?, description = ?, employee_name = ?, employee_email = ?, 
       status = ?, priority = ?, due_date = ?
       WHERE id = ?`,
      [
        title,
        description || null,
        employeeName,
        employeeEmail,
        dbStatus,
        priority || "medium",
        dueDate,
        id,
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Task not found" });
    }

    const [updatedRows] = await pool.query("SELECT * FROM tasks WHERE id = ?", [
      id,
    ]);
    const task = mapTaskRow(updatedRows[0]);
    res.json(task);
  } catch (err) {
    console.error("Error updating task:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Delete task
app.delete("/api/tasks/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await pool.query("DELETE FROM tasks WHERE id = ?", [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Task not found" });
    }
    res.json({ message: "Task deleted" });
  } catch (err) {
    console.error("Error deleting task:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Update only status
// Update only status
app.patch("/api/tasks/:id/status", async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  let dbStatus;
  if (status === "pending") dbStatus = "Todo";
  else if (status === "in_progress") dbStatus = "In Progress";
  else if (status === "completed") dbStatus = "Done";
  else {
    return res.status(400).json({ message: "Invalid status" });
  }

  try {
    const [result] = await pool.query(
      "UPDATE tasks SET status = ?, updated_at = NOW() WHERE id = ?",
      [dbStatus, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Get task details
    const [taskRows] = await pool.query(
      "SELECT title, employee_name FROM tasks WHERE id = ?",
      [id]
    );
    const task = taskRows[0];

    const friendlyStatus =
      status === "completed"
        ? "completed"
        : status === "in_progress"
        ? "in progress"
        : "pending";

    // Activity log: employee changed status
    await pool.query(
      `INSERT INTO activity_log
       (actor_id, actor_role, category, action, entity_type, entity_id, summary, details)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        null,         // you can later pass real employee user id
        "employee",
        "task",
        "task_status_changed",
        "task",
        id,
        `Task "${task.title}" marked as ${friendlyStatus}`,
        `Task "${task.title}" was marked as ${friendlyStatus} by ${
          task.employee_name || "employee"
        }.`,
      ]
    );

    // NO notification here (normal update, not an alert)

    res.json({ message: "Task status updated" });
  } catch (err) {
    console.error("Error updating task status:", err);
    res.status(500).json({ message: "Server error" });
  }
});

app.patch("/api/tasks/mark-seen", async (req, res) => {
  try {
    const { employeeEmail } = req.body;

    if (!employeeEmail) {
      return res.status(400).json({ error: "employeeEmail is required" });
    }

    await pool.query(
      `
      UPDATE tasks
      SET is_seen_by_employee = 1
      WHERE employee_email = ? AND is_seen_by_employee = 0
      `,
      [employeeEmail]
    );

    res.json({ success: true });
  } catch (err) {
    console.error("Error marking tasks as seen:", err);
    res.status(500).json({ error: "Failed to mark tasks as seen" });
  }
});

/* START ---------------------------------------------------------- */

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`EMS server running on port ${PORT}`);
});
