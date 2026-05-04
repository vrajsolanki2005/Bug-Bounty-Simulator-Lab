/**
 * Terminal Service — simulates recon tool outputs for the in-platform terminal.
 * Each tool produces realistic, educational output with deliberate delays.
 */

const SIMULATED_TARGET = {
  domain: 'target.buglab.local',
  ip: '10.10.10.50',
  subdomains: ['www', 'admin', 'api', 'mail', 'dev', 'staging', 'login', 'upload'],
  ports: [
    { port: 22,   service: 'ssh',   version: 'OpenSSH 7.4' },
    { port: 80,   service: 'http',  version: 'Apache 2.4.29' },
    { port: 443,  service: 'https', version: 'Apache 2.4.29' },
    { port: 3306, service: 'mysql', version: 'MySQL 5.7.32' },
    { port: 8080, service: 'http',  version: 'Tomcat 9.0.31' },
    { port: 8443, service: 'https', version: 'Tomcat 9.0.31' }
  ],
  directories: ['/admin', '/backup', '/upload', '/api', '/login', '/.git', '/config', '/phpinfo.php'],
  headers: {
    'Server': 'Apache/2.4.29',
    'X-Powered-By': 'PHP/7.2.0',
    'X-Frame-Options': 'MISSING',
    'Content-Security-Policy': 'MISSING',
    'X-XSS-Protection': 'MISSING'
  }
};

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Process a terminal command and return output lines.
 * @param {string} command - Raw command string from user
 * @returns {AsyncGenerator<string>} Yields output lines
 */
async function* processCommand(command) {
  const cmd = command.trim().toLowerCase();
  const parts = cmd.split(/\s+/);
  const tool = parts[0];

  switch (tool) {
    case 'help':
      yield* helpOutput();
      break;
    case 'nmap':
      yield* nmapOutput(parts);
      break;
    case 'subfinder':
      yield* subfinderOutput(parts);
      break;
    case 'ffuf':
    case 'gobuster':
    case 'dirb':
      yield* dirBruteOutput(parts, tool);
      break;
    case 'nikto':
      yield* niktoOutput(parts);
      break;
    case 'curl':
      yield* curlOutput(parts);
      break;
    case 'whatweb':
      yield* whatwebOutput(parts);
      break;
    case 'whois':
      yield* whoisOutput(parts);
      break;
    case 'dig':
      yield* digOutput(parts);
      break;
    case 'sqlmap':
      yield* sqlmapOutput(parts);
      break;
    case 'clear':
      yield '__CLEAR__';
      break;
    case 'whoami':
      yield 'hacker@bugbounty-lab:~$';
      break;
    case 'ls':
      yield 'recon/  tools/  reports/  flags/  notes.txt';
      break;
    case 'cat':
      if (parts[1] === 'notes.txt') {
        yield '# Recon Notes';
        yield '# Target: target.buglab.local';
        yield '# Date: ' + new Date().toLocaleDateString();
      } else {
        yield `cat: ${parts[1]}: No such file or directory`;
      }
      break;
    case '':
      break;
    default:
      yield `bash: ${tool}: command not found. Type 'help' for available commands.`;
  }
}

async function* helpOutput() {
  yield '╔════════════════════════════════════════════════════╗';
  yield '║         Bug Bounty Simulator - Terminal v1.0       ║';
  yield '╚════════════════════════════════════════════════════╝';
  yield '';
  yield 'RECONNAISSANCE TOOLS:';
  yield '  nmap [options] <target>       - Port scanner';
  yield '  subfinder -d <domain>         - Subdomain enumeration';
  yield '  ffuf -w wordlist -u <url>     - Directory/parameter fuzzer';
  yield '  gobuster dir -u <url>         - Directory brute force';
  yield '  nikto -h <target>             - Web vulnerability scanner';
  yield '  whatweb <target>              - Technology fingerprinting';
  yield '  whois <domain>                - WHOIS lookup';
  yield '  dig <domain>                  - DNS lookup';
  yield '  curl [options] <url>          - HTTP request tool';
  yield '  sqlmap -u <url>               - SQL injection scanner';
  yield '';
  yield 'SYSTEM:';
  yield '  help                          - Show this help';
  yield '  clear                         - Clear terminal';
  yield '  whoami                        - Current user';
  yield '  ls                            - List directory';
  yield '';
  yield 'TARGET: target.buglab.local (10.10.10.50)';
}

async function* nmapOutput(parts) {
  const target = parts.find(p => !p.startsWith('-') && p !== 'nmap') || SIMULATED_TARGET.domain;
  yield `Starting Nmap 7.94 ( https://nmap.org )`;
  yield `Nmap scan report for ${target} (${SIMULATED_TARGET.ip})`;
  await sleep(500);
  yield `Host is up (0.042s latency).`;
  yield `Not shown: 994 closed tcp ports (conn-refused)`;
  yield `PORT     STATE SERVICE     VERSION`;
  for (const p of SIMULATED_TARGET.ports) {
    await sleep(150);
    yield `${String(p.port).padEnd(8)} open  ${p.service.padEnd(12)} ${p.version}`;
  }
  yield '';
  yield `Nmap done: 1 IP address (1 host up) scanned in 3.42 seconds`;
}

async function* subfinderOutput(parts) {
  const domain = parts[parts.indexOf('-d') + 1] || SIMULATED_TARGET.domain;
  yield `[INF] Current Version: v2.6.6`;
  yield `[INF] Loading provider config from ~/.config/subfinder/provider-config.yaml`;
  yield `[INF] Enumerating subdomains for ${domain}`;
  await sleep(300);
  for (const sub of SIMULATED_TARGET.subdomains) {
    await sleep(120);
    yield `${sub}.${domain}`;
  }
  yield `[INF] Found ${SIMULATED_TARGET.subdomains.length} subdomains for ${domain} in 4.21 seconds`;
}

async function* dirBruteOutput(parts, tool) {
  const url = parts.find(p => p.startsWith('http')) || `http://${SIMULATED_TARGET.domain}`;
  yield `[*] Starting ${tool.toUpperCase()} on ${url}`;
  yield `[*] Wordlist: /usr/share/wordlists/dirb/common.txt`;
  yield `[*] Status codes: 200,204,301,302,307,401,403`;
  yield '';
  for (const dir of SIMULATED_TARGET.directories) {
    await sleep(100);
    const status = dir.includes('admin') ? '403' : dir.includes('.git') ? '200' : '301';
    yield `/${dir.replace('/','').padEnd(20)} (Status: ${status}) [Size: ${Math.floor(Math.random()*5000+100)}]`;
  }
  yield '';
  yield `[*] End: Found ${SIMULATED_TARGET.directories.length} results`;
}

async function* niktoOutput(parts) {
  const host = parts[parts.indexOf('-h') + 1] || SIMULATED_TARGET.domain;
  yield `- Nikto v2.1.6`;
  yield `---------------------------------------------------------------------------`;
  yield `+ Target IP:          ${SIMULATED_TARGET.ip}`;
  yield `+ Target Hostname:    ${host}`;
  yield `+ Target Port:        80`;
  yield `+ Start Time:         ${new Date().toISOString()}`;
  yield `---------------------------------------------------------------------------`;
  await sleep(400);
  yield `+ Server: Apache/2.4.29 (Ubuntu)`;
  yield `+ X-XSS-Protection header not defined. Header can hint to user agent to protect against some forms of XSS`;
  yield `+ X-Content-Type-Options header not set.`;
  await sleep(200);
  yield `+ OSVDB-3268: /admin/: Directory indexing found.`;
  yield `+ OSVDB-3092: /admin/: This might be interesting...`;
  yield `+ OSVDB-3268: /backup/: Directory indexing found.`;
  yield `+ Cookie session created without the httponly flag`;
  yield `+ OSVDB-3092: /phpinfo.php: Contains PHP configuration information`;
  await sleep(300);
  yield `+ 7915 requests: 0 error(s) and 8 item(s) reported on remote host`;
  yield `+ End Time: ${new Date().toISOString()} (34 seconds)`;
}

async function* curlOutput(parts) {
  const url = parts.find(p => p.startsWith('http')) || `http://${SIMULATED_TARGET.domain}`;
  const isHead = parts.includes('-I') || parts.includes('--head');
  if (isHead) {
    yield `HTTP/1.1 200 OK`;
    for (const [k, v] of Object.entries(SIMULATED_TARGET.headers)) {
      yield `${k}: ${v}`;
    }
  } else {
    yield `<!DOCTYPE html>`;
    yield `<html><head><title>Target Application</title></head>`;
    yield `<body>`;
    yield `  <h1>Welcome to Target Corp</h1>`;
    yield `  <p>Login at <a href="/login">/login</a></p>`;
    yield `  <!-- TODO: remove debug endpoint /api/debug -->`;
    yield `</body></html>`;
  }
}

async function* whatwebOutput(parts) {
  const target = parts.find(p => !p.startsWith('-') && p !== 'whatweb') || SIMULATED_TARGET.domain;
  await sleep(300);
  yield `http://${target} [200 OK]`;
  yield `  Apache[2.4.29]`;
  yield `  PHP[7.2.0]`;
  yield `  JQuery[3.2.1]`;
  yield `  Bootstrap[4.0.0]`;
  yield `  HTTPServer[Ubuntu Linux][Apache/2.4.29]`;
  yield `  X-Powered-By[PHP/7.2.0]`;
  yield `  Country[RESERVED][ZZ]`;
}

async function* whoisOutput(parts) {
  const domain = parts[1] || SIMULATED_TARGET.domain;
  yield `Domain Name: ${domain.toUpperCase()}`;
  yield `Registry Domain ID: D402200000004536490-LROR`;
  yield `Registrar: NameCheap, Inc.`;
  yield `Updated Date: 2023-09-15T00:00:00Z`;
  yield `Creation Date: 2018-04-20T00:00:00Z`;
  yield `Registry Expiry Date: 2025-04-20T00:00:00Z`;
  yield `Name Server: ns1.cloudflare.com`;
  yield `Name Server: ns2.cloudflare.com`;
  yield `DNSSEC: unsigned`;
  yield `Admin Email: admin@${domain}`;
}

async function* digOutput(parts) {
  const domain = parts[1] || SIMULATED_TARGET.domain;
  yield `; <<>> DiG 9.18.12 <<>> ${domain}`;
  yield `;; ANSWER SECTION:`;
  yield `${domain}.      300  IN  A  ${SIMULATED_TARGET.ip}`;
  yield `${domain}.      300  IN  MX 10 mail.${domain}.`;
  yield `${domain}.      300  IN  NS ns1.cloudflare.com.`;
  yield `;; Query time: 12 msec`;
  yield `;; SERVER: 8.8.8.8#53(8.8.8.8)`;
}

async function* sqlmapOutput(parts) {
  const url = parts[parts.indexOf('-u') + 1] || `http://${SIMULATED_TARGET.domain}/login`;
  yield `        ___`;
  yield `       __H__`;
  yield ` ___ ___[,]_____ ___ ___  {1.7.9#stable}`;
  yield `|_ -| . ["]     | .'| . |`;
  yield `|___|_  [)]_|_|_|__,|  _|`;
  yield `      |_|V...       |_|   https://sqlmap.org`;
  yield '';
  yield `[*] Starting detection for ${url}`;
  await sleep(500);
  yield `[INFO] testing connection to the target URL`;
  yield `[INFO] testing if the target URL content is stable`;
  await sleep(300);
  yield `[INFO] testing if GET parameter 'id' is dynamic`;
  yield `[INFO] GET parameter 'id' appears to be dynamic`;
  yield `[WARNING] GET parameter 'id' does not seem to be injectable`;
  yield `[INFO] testing if POST parameter 'username' is dynamic`;
  await sleep(400);
  yield `[INFO] heuristic (basic) test shows that POST parameter 'username' might be injectable (possible DBMS: MySQL)`;
  yield `[INFO] testing for SQL injection on POST parameter 'username'`;
  yield `[INFO] POST parameter 'username' is 'MySQL >= 5.6 AND error-based' injectable`;
  yield `[INFO] POST parameter 'username' appears to be 'MySQL UNION query (NULL) - 1 to 20 columns' injectable`;
  yield '';
  yield `sqlmap identified the following injection point(s):`;
  yield `  Parameter: username (POST)`;
  yield `    Type: error-based`;
  yield `    Title: MySQL >= 5.6 AND error-based - WHERE clause`;
  yield `    Payload: username=' AND (SELECT 3*(IF((SELECT * FROM (SELECT COUNT(*),CONCAT(0x7171787871,(SELECT ...-- -`;
}

module.exports = { processCommand };
