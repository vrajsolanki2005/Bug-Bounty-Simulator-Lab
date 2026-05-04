---
title: Bug Bounty Simulator Lab
description: A fully isolated, TryHackMe-style offensive security lab with 59 embedded vulnerabilities, a Kali Linux AttackBox, and a real-time flag submission platform.
version: 1.0.0
stack: React · Node.js · MySQL · Docker · OpenVPN · Kali Linux
status: Active
---

# Bug Bounty Simulator Lab

A self-hosted, offline-capable cybersecurity lab that replicates the TryHackMe experience. Practice real-world bug bounty techniques against an intentionally vulnerable e-commerce application — all inside an isolated Docker network.

---

## Architecture

Four containers connected over an isolated bridge network (`lab_net` — `10.10.10.0/24`):

| Container | IP | Role |
|---|---|---|
| `vuln-target` | `10.10.10.5` | Intentionally vulnerable Node.js/React app |
| `db` | `10.10.10.6` | MySQL database with flags and vulnerable data |
| `attackbox` | `10.10.10.7` | Kali Linux + XFCE desktop via NoVNC |
| `openvpn` | `10.10.10.2` | OpenVPN server for external VPN access |

---

## Tech Stack

**Frontend** — React 18, Vite, Tailwind CSS, Framer Motion, Socket.IO Client

**Backend** — Node.js, Express, MySQL2, Socket.IO, JWT, Helmet, Multer, Dockerode

**Infrastructure** — Docker Compose, Kali Linux, OpenVPN, NoVNC

---

## Vulnerability Scope

The target (`10.10.10.5`) contains **59 natively embedded vulnerabilities** across:

- Injection — SQLi, Command, NoSQL, LDAP, Template Injection
- XSS — Stored, Reflected, DOM, Blind
- Authentication & Access Control — Broken Auth, IDOR, Privilege Escalation
- Server-Side — SSRF, LFI, RFI, Unrestricted File Upload
- Business Logic & Race Conditions

Each successfully exploited vulnerability yields a `flag{...}` string submittable to the Lab Management API.

---

## Getting Started

### Prerequisites

- Docker & Docker Compose
- 8 GB RAM recommended

### 1. Start the Lab

```bash
cd infrastructure
docker-compose up -d --build
```

### 2. Access the AttackBox (NoVNC)

Open your browser and go to:

```
http://localhost:8080/vnc.html
```

Inside the Kali desktop, open Firefox and navigate to `http://10.10.10.5` to begin attacking the target.

Pre-installed tools: `Burp Suite`, `Nmap`, `ffuf`, `SQLMap`, `Firefox`

### 3. Access via VPN (Optional)

To attack from your own host machine instead of the NoVNC AttackBox:

```bash
chmod +x infrastructure/openvpn-setup.sh
./infrastructure/openvpn-setup.sh
```

Import the generated `hacker1.ovpn` into your OpenVPN client, connect, then access `http://10.10.10.5` directly from your host.

---

## Local Development (Lab Management Platform)

### Server

```bash
cd server
cp .env.example .env   # fill in your values
npm install
npm run seed           # seed the database
npm run dev
```

### Client

```bash
cd client
npm install
npm run dev
```

---

## Project Structure

```
.
├── client/               # React frontend (Vite)
│   └── src/
│       ├── api/
│       ├── components/
│       ├── context/
│       └── pages/
├── server/               # Node.js backend (Express)
│   ├── database/         # Schema & seed scripts
│   └── src/
│       ├── config/
│       ├── middleware/
│       ├── routes/
│       ├── services/
│       └── sockets/
└── infrastructure/       # Docker, Dockerfiles, OpenVPN
```

---

## Warning

> This lab contains **intentionally vulnerable software**. Never expose it to the public internet. Run it only in an isolated local or private network environment.

---

## License

MIT
