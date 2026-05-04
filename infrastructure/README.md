# Bug Bounty Simulator - Offline Lab Architecture

This directory contains the Infrastructure-as-Code (IaC) required to deploy the Bug Bounty Simulator as a realistic, fully isolated Virtual Machine environment, matching the TryHackMe architecture.

## Architecture Overview

The offline deployment consists of four core components connected via an isolated Docker bridge network (`lab_net` - `10.10.10.0/24`):

1. **`vuln-target` (10.10.10.5):** The intentionally vulnerable Node.js/React E-commerce application. It is completely isolated and only accessible via the lab network.
2. **`db` (10.10.10.6):** The MySQL database hosting user data, products, orders, and the 59 vulnerability challenge seeds.
3. **`attackbox` (10.10.10.7):** A Kali Linux VM container equipped with a full XFCE desktop environment. It comes pre-installed with Burp Suite, Nmap, ffuf, SQLMap, and Firefox. It is accessible via NoVNC in your browser at `http://localhost:8080`.
4. **`openvpn` (10.10.10.2):** An OpenVPN server allowing external machines (e.g., your local host or remote students) to tunnel securely into the `10.10.10.0/24` subnet.

## Deployment Instructions (Offline Sandbox)

To deploy the lab locally on your machine (or a dedicated server):

1. **Build and Start the Lab:**
   ```bash
   cd infrastructure
   docker-compose up -d --build
   ```

2. **Access the AttackBox:**
   - Open your browser and navigate to `http://localhost:8080/vnc.html`
   - You will be presented with a full Kali Linux desktop.
   - Open Firefox inside Kali and navigate to `http://10.10.10.5` to attack the target.

3. **Access via VPN (TryHackMe Style):**
   If you prefer to attack from your own host machine rather than using the NoVNC AttackBox, you can set up the OpenVPN server:
   ```bash
   chmod +x openvpn-setup.sh
   ./openvpn-setup.sh
   ```
   This will generate a `hacker1.ovpn` file. Import this file into your local OpenVPN client, connect, and you will be able to reach `10.10.10.5` directly from your host browser and tools!

## Vulnerability Scope

The target VM (`10.10.10.5`) runs the `UnifiedTargetApp` and `EcommerceApp` which contain exactly **59 natively embedded vulnerabilities** spanning:
* Injection (SQLi, Command, NoSQL, LDAP, Template)
* XSS (Stored, Reflected, DOM, Blind)
* Authentication & Access Control Flaws
* Server-Side Flaws (SSRF, LFI, RFI, File Upload)
* Business Logic & Race Conditions

Exploiting these vulnerabilities natively inside the VM yields `flag{...}` strings which can be submitted to the Lab Management API.
