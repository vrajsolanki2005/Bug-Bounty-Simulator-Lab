# VulnShop — Security Training App

> ⚠️ For cybersecurity training use only. Never deploy to production.

## Quick Start (3 steps)

### Step 1 — Install
```
npm install
```

### Step 2 — Setup database (auto-detects MySQL password)
```
node setup.js
```
This will:
- Try common MySQL passwords automatically
- Ask you to enter credentials if auto-detect fails
- Create the database and seed all data
- Write your `.env` file
- Optionally start the server

### Step 3 — Start (if not already started by setup.js)
```
node server.js
```

Open: http://localhost:3000

---

## If setup.js can't connect

Edit the `.env` file manually:
```
DB_USER=root
DB_PASSWORD=your_actual_mysql_password
```
Then run: `node database/init.js`

Or import `database/init.sql` directly in phpMyAdmin.

---

## Login Credentials

| User       | Password     | Role  |
|------------|--------------|-------|
| admin      | admin123     | Admin |
| john_doe   | password123  | User  |
| jane_smith | letmein      | User  |
| bob_hacker | qwerty123    | User  |

---

## Key URLs

| URL                        | Purpose                  |
|----------------------------|--------------------------|
| http://localhost:3000      | Main shop                |
| /admin                     | Admin panel              |
| /api/challenges            | All 10 challenge hints   |
| /debug                     | Session/cookie dump      |
| /api/steal?c=test          | XSS cookie receiver      |

---

## 10 Security Challenges

| # | Vulnerability         | Where                        | Flag                                         |
|---|-----------------------|------------------------------|----------------------------------------------|
| 1 | SQL Injection (Login) | POST /auth/login             | flag{sql_1nj3ct10n_4uth_byp4ss_2024}         |
| 2 | SQL Injection (UNION) | GET /products?q=             | flag{un10n_b4s3d_sql1_d4t4_dump_2024}        |
| 3 | Reflected XSS         | GET /products?q=             | flag{r3fl3ct3d_xss_c00k13_st34l_2024}        |
| 4 | Stored XSS            | POST /products/:id/review    | flag{st0r3d_xss_p3rs1st3nt_4tt4ck_2024}      |
| 5 | IDOR                  | GET /orders/1                | flag{1d0r_0rd3r_4cc3ss_s3qu3nt14l_1d_2024}  |
| 6 | Admin Bypass          | GET /admin?admin=true        | flag{4dm1n_byp4ss_w34k_4uth_ch3ck_2024}      |
| 7 | Privilege Escalation  | POST /auth/register          | flag{m4ss_4ss1gnm3nt_pr1v_3sc_2024}          |
| 8 | CSRF                  | POST /profile/password       | flag{csrf_n0_t0k3n_p4ssw0rd_ch4ng3_2024}     |
| 9 | File Upload           | POST /profile/avatar         | flag{f1l3_upl04d_n0_v4l1d4t10n_2024}         |
|10 | Business Logic        | POST /cart/coupon (FLASH50)  | flag{bus1n3ss_l0g1c_pr1c3_m4n1p_2024}        |

