const { exec, spawn } = require('child_process');
const path = require('path');

const NMAP_PATH = process.env.NMAP_PATH || 'nmap';

// Allowed scan types and their nmap flags
const SCAN_PROFILES = {
  quick:   { flags: ['-T4', '-F', '--open'],                    label: 'Quick Scan (Top 100 ports)' },
  full:    { flags: ['-T4', '-p-', '--open'],                   label: 'Full Port Scan (All 65535)' },
  stealth: { flags: ['-sS', '-T2', '-p', '1-1024', '--open'],  label: 'Stealth SYN Scan' },
  version: { flags: ['-sV', '-T4', '-p', '1-1000', '--open'],  label: 'Service Version Detection' },
  vuln:    { flags: ['-sV', '--script=vuln', '-T4'],            label: 'Vulnerability Scan' }
};

/**
 * Sanitize a target hostname/IP — only allow safe characters.
 */
const sanitizeTarget = (target) => {
  const cleaned = target.trim();
  // Allow: alphanumeric, dots, hyphens, underscores (no semicolons, pipes, etc.)
  if (!/^[a-zA-Z0-9.\-_]+$/.test(cleaned)) {
    throw new Error('Invalid target. Only hostnames and IP addresses are allowed.');
  }
  // Block private/loopback ranges to prevent SSRF
  const blocked = ['localhost', '127.0.0.1', '0.0.0.0', '::1', '169.254'];
  if (blocked.some(b => cleaned.startsWith(b))) {
    throw new Error('Scanning localhost or private addresses is not allowed.');
  }
  return cleaned;
};

/**
 * Run nmap scan on target. Streams output via onData callback.
 * Returns a promise that resolves with parsed JSON results.
 *
 * @param {string} target   - Hostname or IP to scan
 * @param {string} scanType - One of: quick | full | stealth | version | vuln
 * @param {Function} onData - Called with each line of nmap output
 * @returns {Promise<object>} Parsed scan results
 */
const runNmapScan = (target, scanType = 'quick', onData = () => {}) => {
  return new Promise((resolve, reject) => {
    const safeTarget = sanitizeTarget(target);
    const profile = SCAN_PROFILES[scanType] || SCAN_PROFILES.quick;

    const args = [...profile.flags, '-oX', '-', safeTarget];
    onData(`[*] Starting ${profile.label} on ${safeTarget}...`);
    onData(`[*] Command: ${NMAP_PATH} ${args.join(' ')}`);
    onData('');

    const proc = spawn(NMAP_PATH, args, { timeout: 5 * 60 * 1000 }); // 5 min timeout

    let xmlOutput = '';
    let errorOutput = '';

    proc.stdout.on('data', (chunk) => {
      xmlOutput += chunk.toString();
    });

    proc.stderr.on('data', (chunk) => {
      const line = chunk.toString().trim();
      if (line) {
        errorOutput += line;
        onData(`[!] ${line}`);
      }
    });

    proc.on('error', (err) => {
      if (err.code === 'ENOENT') {
        reject(new Error('nmap is not installed or not in PATH. Please install nmap first.'));
      } else {
        reject(err);
      }
    });

    proc.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`nmap exited with code ${code}. ${errorOutput}`));
        return;
      }

      try {
        const parsed = parseNmapXml(xmlOutput, safeTarget);
        onData('');
        onData(`[✓] Scan complete. Found ${parsed.ports.length} open port(s).`);
        resolve(parsed);
      } catch (err) {
        reject(new Error(`Failed to parse nmap output: ${err.message}`));
      }
    });
  });
};

/**
 * Parse nmap XML output into a structured JSON object.
 */
const parseNmapXml = (xml, target) => {
  const ports = [];
  const portMatches = xml.matchAll(/<port protocol="(\w+)" portid="(\d+)">[\s\S]*?<state state="(\w+)"[\s\S]*?(?:<service name="([^"]*)"[^>]*(?:product="([^"]*)")?[^>]*(?:version="([^"]*)")?)?/g);

  for (const m of portMatches) {
    if (m[3] === 'open') {
      ports.push({
        protocol: m[1],
        port:     parseInt(m[2]),
        state:    m[3],
        service:  m[4] || 'unknown',
        product:  m[5] || '',
        version:  m[6] || ''
      });
    }
  }

  // Extract host info
  const hostnameMatch = xml.match(/addr="([^"]+)"/);
  const startTimeMatch = xml.match(/startstr="([^"]+)"/);
  const endTimeMatch   = xml.match(/timestr="([^"]+)"/);
  const osMatch        = xml.match(/osmatch name="([^"]+)" accuracy="(\d+)"/);

  return {
    target,
    ip: hostnameMatch?.[1] || target,
    scanType: 'nmap',
    startTime: startTimeMatch?.[1] || new Date().toISOString(),
    endTime:   endTimeMatch?.[1]   || new Date().toISOString(),
    os:        osMatch ? { name: osMatch[1], accuracy: parseInt(osMatch[2]) } : null,
    ports,
    totalOpen: ports.length
  };
};

module.exports = { runNmapScan, SCAN_PROFILES, sanitizeTarget };
