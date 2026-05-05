<div align="center">

# Bug Bounty Simulator Lab

> A self-hosted, offline-capable cybersecurity lab — practice real-world bug bounty techniques against **59 intentionally embedded vulnerabilities** inside a fully isolated Docker environment.

![Version](https://img.shields.io/badge/version-1.0.0-blue?style=flat-square)
![Status](https://img.shields.io/badge/status-active-brightgreen?style=flat-square)
![License](https://img.shields.io/badge/license-MIT-lightgrey?style=flat-square)
![Docker](https://img.shields.io/badge/docker-compose-2496ED?style=flat-square&logo=docker&logoColor=white)
![React](https://img.shields.io/badge/react-18-61DAFB?style=flat-square&logo=react&logoColor=black)
![Node](https://img.shields.io/badge/node.js-express-339933?style=flat-square&logo=node.js&logoColor=white)
![MySQL](https://img.shields.io/badge/mysql-8.0-4479A1?style=flat-square&logo=mysql&logoColor=white)
![Kali](https://img.shields.io/badge/kali-linux-557C94?style=flat-square&logo=kalilinux&logoColor=white)

</div>

---

## Network Architecture

```
10.10.10.0/24  (lab_net — isolated bridge)
│
├── 10.10.10.2   openvpn      OpenVPN server          → :1194/udp
├── 10.10.10.5   vuln-target  Vulnerable Node.js/React → :80
├── 10.10.10.6   db           MySQL 8.0 — flags + data
└── 10.10.10.7   attackbox    Kali Linux XFCE via NoVNC → :8080, SSH :2222
```

---

## 🎯 Vulnerability Scope — 59 Challenges

| Category | Vulnerabilities |
|---|---|
| 💉 Injection | SQLi, Command, NoSQL, LDAP, Template Injection |
| 🔀 XSS | Stored, Reflected, DOM, Blind |
| 🔐 Auth & Access Control | Broken Auth, IDOR, Privilege Escalation |
| 🌐 Server-Side | SSRF, LFI, RFI, Unrestricted File Upload |
| ⚙️ Logic & Race Conditions | Business Logic Flaws, Race Conditions |

Each exploit yields a `flag{...}` string — submit it to the Lab Management API to score.

---

## Quick Start

**Prerequisites:** Docker & Docker Compose · 8 GB RAM

```bash
# 1. Spin up the lab
cd infrastructure
docker-compose up -d --build

# 2. Open the AttackBox
open http://localhost:8080/vnc.html

# 3. Inside Kali, navigate to the target
firefox http://10.10.10.5
```

### Default Credentials

| Service | User | Password |
|---|---|---|
| AttackBox (Kali / SSH) | `hacker` | `hacker` |
| MySQL | `root` | `supersecret` |

### VPN Access (Optional)

Attack from your own machine instead of the NoVNC AttackBox:

```bash
chmod +x infrastructure/openvpn-setup.sh
./infrastructure/openvpn-setup.sh
# Import hacker1.ovpn → connect → hit http://10.10.10.5 directly
```

---

## Local Development

```bash
# Server
cd server
cp .env.example .env   # fill in DB_PASS, JWT_SECRET, FLAG_SECRET
npm install
npm run seed
npm run dev            # http://localhost:5000

# Client
cd client
npm install
npm run dev            # http://localhost:5173
```

### Environment Variables (`server/.env`)

| Variable | Description |
|---|---|
| `PORT` | API port (default `5000`) |
| `DB_HOST` / `DB_PORT` / `DB_NAME` | MySQL connection |
| `DB_USER` / `DB_PASS` | MySQL credentials |
| `JWT_SECRET` / `JWT_REFRESH_SECRET` | JWT signing keys |
| `JWT_EXPIRES_IN` | Token TTL (default `7d`) |
| `FLAG_SECRET` | HMAC secret for flag generation |
| `NMAP_PATH` | Path to nmap binary |
| `CLIENT_URL` | Frontend URL for CORS (default `http://localhost:5173`) |

---

## Tech Stack

| Layer | Tools |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS, Framer Motion, React Router, Socket.IO Client, Axios, Lucide |
| Backend | Node.js, Express, MySQL2, JWT, bcryptjs, Helmet, Multer, Dockerode, Socket.IO, node-nmap |
| Infrastructure | Docker Compose, MySQL 8.0, Kali Linux, OpenVPN, NoVNC |

---

## Project Structure

```
├── client/                  React frontend (Vite)
│   └── src/
│       ├── api/             Axios API clients
│       ├── components/      Shared UI components
│       ├── context/         React context providers
│       ├── pages/           Route-level page components
│       └── styles/          Global styles
├── server/                  Node.js backend (Express + MySQL)
│   ├── src/
│   │   ├── config/          DB & app config
│   │   ├── middleware/      Auth, rate-limit, error handlers
│   │   ├── routes/          API route definitions
│   │   ├── services/        Business logic
│   │   └── sockets/         Socket.IO event handlers
│   └── database/            Schema & seed scripts
└── infrastructure/          Docker Compose, Dockerfiles, OpenVPN
```

---

## ⚠️ Warning

> This lab contains **intentionally vulnerable software**.
> Never expose it to the public internet. Run only in an isolated local or private network.

---

<div align="center">MIT License · Built for offensive security practice</div>
