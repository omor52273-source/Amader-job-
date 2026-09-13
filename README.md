# Amader Job Online - cPanel Hosting Installation & Deployment Guide

Welcome to the production deployment package for **Amader Job Online** (আমাদের জব অনলাইন), a full-featured micro-task and freelance platform built with **PHP, MySQL/MariaDB, HTML, CSS, and modern JavaScript**.

This project is configured to run on standard cPanel Shared Hosting, VPS, or dedicated servers without requiring Node.js servers, Docker, or command-line builders at runtime.

---

## 📋 Default Credentials

- **Admin Panel URL:** `https://yourdomain.com/admin/`
- **Default Admin Email:** `admin@amaderjob.com` (or username `admin`)
- **Default Admin Password:** `admin123456`
- **Demo Worker User:** `rafi2377a@amaderjob.com` / `user123456` (UID: `84920173`)

*(Make sure to change the admin password from the Admin Panel under "Admin Password" tab after installation.)*

---

## 🚀 Step-by-Step cPanel Installation Guide

### STEP 1: Log in to cPanel
- Open your browser and navigate to your hosting cPanel (typically `https://yourdomain.com:2083` or your host's client portal).
- Enter your cPanel username and password.

---

### STEP 2: Create MySQL Database in cPanel
- Under the **Databases** section, click on **MySQL® Databases** (or **MySQL Database Wizard**).
- Under **Create New Database**, enter a name (e.g., `cpaneluser_amaderjob`).
- Click **Create Database**.

---

### STEP 3: Create Database User and Set Password
- Scroll down to **MySQL Users** -> **Add New User**.
- Enter a username (e.g., `cpaneluser_dbuser`).
- Click **Password Generator** to generate a strong password (copy and save this password).
- Click **Create User**.

---

### STEP 4: Add User to Database with ALL PRIVILEGES
- Scroll down to **Add User To Database**.
- Select your newly created **User** and **Database**.
- Click **Add**.
- In the privileges screen, check **ALL PRIVILEGES**.
- Click **Make Changes**.

---

### STEP 5: Open phpMyAdmin
- Return to the cPanel main home screen.
- Under **Databases**, click **phpMyAdmin**.

---

### STEP 6: Import `database.sql`
- In the left sidebar of phpMyAdmin, click on your newly created database name.
- Click the **Import** tab on the top navigation bar.
- Under **File to import**, click **Choose File** and select `database.sql` from your downloaded project.
- Ensure the character set is set to `utf-8`.
- Scroll to the bottom and click **Import** (or **Go**).
- Verify that all tables (`admins`, `settings`, `users`, `jobs`, `task_submissions`, `wallet_transactions`, `support_tickets`, `password_resets`, etc.) appear successfully.

---

### STEP 7: Open File Manager
- Return to the cPanel main home screen.
- Under the **Files** section, click **File Manager**.

---

### STEP 8: Go to `public_html`
- In File Manager, double-click on the `public_html` directory (or your addon domain's document root).
- If there is an existing default `index.html` or placeholder file, delete it.
- Click **Settings** (top right) and ensure **"Show Hidden Files (dotfiles)"** is checked, then click **Save**.

---

### STEP 9: Upload the ZIP file
- Click the **Upload** button on the File Manager toolbar.
- Select `amaderjob-cpanel.zip` and wait for the upload progress bar to turn green (100%).

---

### STEP 10: Extract the ZIP file
- Go back to File Manager.
- Right-click on `amaderjob-cpanel.zip` and select **Extract**.
- Confirm extraction to `/public_html/`.
- Verify that the following files and folders exist in `public_html`:
  - `index.php`
  - `.htaccess`
  - `.env.example`
  - `database.sql`
  - `config/` (`env.php`, `db.php`, `mail.php`)
  - `includes/` (`functions.php`, `auth.php`)
  - `api/` (`index.php`)
  - `admin/` (`index.php`)
  - `assets/`
  - `uploads/`

---

### STEP 11: Create / Edit `.env`
- In File Manager, find `.env.example`.
- Copy or rename `.env.example` to `.env` (or create a new file named `.env`).

---

### STEP 12: Set `APP_URL` to Your Actual Domain
- Right-click `.env` and choose **Edit**.
- Update `APP_URL` to your actual live website address:
  ```env
  APP_URL=https://yourdomain.com
  ```
- *Note:* `APP_URL` is the single source of truth for the domain across all referral links, redirects, emails, and password resets. Do not add a trailing slash.

---

### STEP 13: Set Database Connection Details
- Fill in your MySQL database credentials from Steps 2, 3 & 4:
  ```env
  DB_HOST=localhost
  DB_NAME=cpaneluser_amaderjob
  DB_USER=cpaneluser_dbuser
  DB_PASS=YourDatabasePasswordHere
  ```

---

### STEP 14: Save `.env`
- Click **Save Changes** in the top-right corner of the editor.
- Close the editor.

---

### STEP 15: Open Domain in Browser & Test Admin Panel
1. Open your browser and visit:
   ```
   https://yourdomain.com/
   ```
   The website should load instantly with your dynamic settings, task listings, and registration options.

2. Visit your Admin Panel:
   ```
   https://yourdomain.com/admin/
   ```
3. Log in using:
   - **Email:** `admin@amaderjob.com`
   - **Password:** `admin123456`

4. Go to **SMTP Settings** in the Admin Panel:
   - Enter your cPanel Webmail or custom SMTP details:
     - **SMTP Host:** `mail.yourdomain.com` (or `smtp.gmail.com`)
     - **SMTP Port:** `587` (TLS) or `465` (SSL)
     - **SMTP Username:** `info@yourdomain.com`
     - **SMTP Password:** Your email password
     - **From Email:** `info@yourdomain.com`
     - **From Name:** `Amader Job`
   - Click **Save SMTP Settings**.
   - Use the **Test SMTP Connection** card on the right, enter your personal email, and click **Send Test Email Now**.
   - Review the live handshake logs and verify you receive the test message in your inbox!

---

## 🔒 Security Best Practices

1. **Protect `.env` and `database.sql`:** The included `.htaccess` file automatically denies public browser access to `.env`, `database.sql`, and log files.
2. **Change Default Admin Password:** Once logged into `/admin/`, immediately go to the **Admin Password** tab and change your password.
3. **SSL Certificate:** Make sure cPanel AutoSSL or Let's Encrypt is active so your domain loads over `https://`.
4. **Referral Links:** Referrals dynamically adapt to your `APP_URL`:
   - Example: `https://yourdomain.com/?ref=84920173`
   - When visitors register with a referral link, the referrer is automatically credited upon task completion.

---

## 🛠️ File Structure Overview

```
public_html/
├── .htaccess                 # Apache routing, security & MIME configuration
├── .env.example              # Environment variables template
├── .env                      # Your live server credentials (created by you)
├── database.sql              # MySQL/MariaDB database schema & seeds
├── index.php                 # Main website entry point (dynamic app runner)
├── README.md                 # This installation guide
│
├── config/
│   ├── env.php               # Environment parser & APP_URL resolver
│   ├── db.php                # PDO MySQL singleton connection
│   └── mail.php              # RFC 5321 pure PHP SMTP socket engine
│
├── includes/
│   ├── functions.php         # Utility helpers, CSRF & dynamic URL generator
│   └── auth.php              # Admin authentication & session security
│
├── api/
│   └── index.php             # Unified JSON API (OTP, auth, jobs, SMTP test)
│
├── admin/
│   └── index.php             # Standalone Responsive Admin Control Center
│
├── assets/                   # Compiled frontend CSS, JS, and graphics
└── uploads/                  # User uploads directory (script execution blocked)
```

---
*Amader Job Online &copy; All rights reserved.*
