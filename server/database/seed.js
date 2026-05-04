require('dotenv').config({ path: '../.env' });
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const challenges = [
  { slug: 'xss-reflected', title: 'Reflected XSS', category: 'XSS', difficulty: 'Easy', points: 100, description: 'Inject scripts via URL parameters.', scenario: 'The search page reflects the query.', objective: 'Trigger alert(1).' },
  { slug: 'csrf-basic', title: 'Basic CSRF', category: 'CSRF', difficulty: 'Medium', points: 200, description: 'Perform actions on behalf of a user.', scenario: 'Update profile lacks CSRF tokens.', objective: 'Change another user\'s email.' },
  { slug: 'sqli-login', title: 'SQL Injection Login', category: 'SQLi', difficulty: 'Easy', points: 150, description: 'Bypass authentication with SQLi.', scenario: 'Login query is not parameterized.', objective: 'Log in as admin.' },
  { slug: 'lfi-path', title: 'Local File Inclusion', category: 'LFI', difficulty: 'Medium', points: 200, description: 'Read sensitive server files.', scenario: 'File parameter allows ../ traversal.', objective: 'Read /etc/passwd.' },
  { slug: 'rfi-remote', title: 'Remote File Inclusion', category: 'RFI', difficulty: 'Hard', points: 300, description: 'Include remote scripts.', scenario: 'Application loads external URLs.', objective: 'Execute a remote shell.' },
  { slug: 'ssrf-internal', title: 'Server Side Request Forgery', category: 'SSRF', difficulty: 'Hard', points: 350, description: 'Access internal services.', scenario: 'Server fetches metadata from URLs.', objective: 'Access 169.254.169.254.' },
  { slug: 'idor-profile', title: 'Insecure Direct Object Reference', category: 'IDOR', difficulty: 'Easy', points: 100, description: 'Access unauthorized profiles.', scenario: 'User ID is exposed in the URL.', objective: 'View admin profile.' },
  { slug: 'rce-upload', title: 'Remote Code Execution', category: 'RCE', difficulty: 'Expert', points: 500, description: 'Execute commands on the server.', scenario: 'Vulnerable image processing library.', objective: 'Get a reverse shell.' },
  { slug: 'auth-2fa-bypass', title: '2FA Bypass', category: 'Authentication', difficulty: 'Hard', points: 300, description: 'Circumvent two-factor security.', scenario: 'OTP can be brute forced or predicted.', objective: 'Login without a valid OTP.' },
  { slug: 'auth-bypass', title: 'Authentication Bypass', category: 'Authentication', difficulty: 'Medium', points: 200, description: 'Access protected areas without login.', scenario: 'Weak session management or headers.', objective: 'Access the admin dashboard.' },
  { slug: 'priv-esc', title: 'Privilege Escalation', category: 'Authorization', difficulty: 'Hard', points: 400, description: 'Elevate user permissions.', scenario: 'Role parameter can be changed in JSON.', objective: 'Become a superuser.' },
  { slug: 'open-redirect', title: 'Open Redirect', category: 'Redirection', difficulty: 'Easy', points: 100, description: 'Redirect users to malicious sites.', scenario: 'Redirect parameter is not validated.', objective: 'Redirect to evil.com.' },
  { slug: 'upload-bypass', title: 'File Upload Bypass', category: 'File Upload', difficulty: 'Medium', points: 250, description: 'Upload prohibited file types.', scenario: 'Extension check is client-side only.', objective: 'Upload a .php shell.' },
  { slug: 'session-hijacking', title: 'Session Hijacking', category: 'Session', difficulty: 'Hard', points: 300, description: 'Steal active user sessions.', scenario: 'Cookies are sent over HTTP or lack flags.', objective: 'Impersonate an active user.' },
  { slug: 'cors-misconfig', title: 'CORS Misconfiguration', category: 'CORS', difficulty: 'Medium', points: 200, description: 'Exfiltrate data via cross-origin.', scenario: 'Access-Control-Allow-Origin: *', objective: 'Steal private API data.' },
  { slug: 'race-condition', title: 'Race Condition', category: 'Logic', difficulty: 'Expert', points: 500, description: 'Exploit timing vulnerabilities.', scenario: 'Credits deducted after item delivery.', objective: 'Buy items with zero balance.' },
  { slug: 'cmd-injection', title: 'Command Injection', category: 'Injection', difficulty: 'Hard', points: 350, description: 'Inject system commands.', scenario: 'Ping tool uses unsanitized input.', objective: 'Execute `id` or `whoami`.' },
  { slug: 'xxe-basic', title: 'XML External Entity', category: 'XXE', difficulty: 'Hard', points: 400, description: 'Extract data via XML parsing.', scenario: 'XML parser resolves external entities.', objective: 'Read local files via XML.' },
  { slug: 'path-traversal', title: 'Path Traversal', category: 'LFI', difficulty: 'Medium', points: 200, description: 'Access parent directories.', scenario: 'Filename parameter allows ../../', objective: 'Read configuration files.' },
  { slug: 'info-disclosure', title: 'Information Disclosure', category: 'Information', difficulty: 'Easy', points: 100, description: 'Leaking sensitive system info.', scenario: 'Error messages show stack traces.', objective: 'Find the server version.' },
  { slug: 'clickjacking', title: 'Clickjacking', category: 'UI', difficulty: 'Easy', points: 150, description: 'Trick users into clicking hidden UI.', scenario: 'Missing X-Frame-Options headers.', objective: 'Trigger a delete action.' },
  { slug: 'dom-xss', title: 'DOM-based XSS', category: 'XSS', difficulty: 'Medium', points: 250, description: 'Exploit client-side script logic.', scenario: 'Location.hash is written to innerHTML.', objective: 'Trigger alert(1) via hash.' },
  { slug: 'stored-xss', title: 'Stored XSS', category: 'XSS', difficulty: 'Medium', points: 200, description: 'Persist malicious scripts.', scenario: 'Comments are not sanitized.', objective: 'Steal user cookies.' },
  { slug: 'blind-xss', title: 'Blind XSS', category: 'XSS', difficulty: 'Hard', points: 400, description: 'Attack backend admin panels.', scenario: 'Log data is rendered in a dashboard.', objective: 'Trigger XSS in the admin view.' },
  { slug: 'self-xss', title: 'Self XSS', category: 'XSS', difficulty: 'Easy', points: 50, description: 'Exploit one\'s own session.', scenario: 'Profile name is reflected to self.', objective: 'Execute script in own browser.' },
  { slug: 'html-injection', title: 'HTML Injection', category: 'Injection', difficulty: 'Easy', points: 100, description: 'Inject arbitrary HTML tags.', scenario: 'Input is rendered without escaping.', objective: 'Deface the page with a custom div.' },
  { slug: 'crlf-injection', title: 'CRLF Injection', category: 'Injection', difficulty: 'Medium', points: 250, description: 'Manipulate HTTP headers.', scenario: 'Input is reflected in Set-Cookie.', objective: 'Perform HTTP response splitting.' },
  { slug: 'oauth-misconfig', title: 'OAuth Misconfiguration', category: 'Authentication', difficulty: 'Hard', points: 450, description: 'Steal OAuth tokens.', scenario: 'Redirect URI is not strictly validated.', objective: 'Get the auth code of another user.' },
  { slug: 'logic-flaw', title: 'Business Logic Flaw', category: 'Logic', difficulty: 'Medium', points: 250, description: 'Bypass intended application flow.', scenario: 'Price calculated on client side.', objective: 'Purchase item for $0.01.' },
  { slug: 'rate-limit-bypass', title: 'Rate Limit Bypass', category: 'API', difficulty: 'Medium', points: 200, description: 'Circumvent request limits.', scenario: 'X-Forwarded-For header is trusted.', objective: 'Brute force login without lockout.' },
  { slug: 'ato-account', title: 'Account Takeover', category: 'Authentication', difficulty: 'Expert', points: 500, description: 'Seize control of a user account.', scenario: 'Vulnerable password reset token.', objective: 'Change admin\'s password.' },
  { slug: 'pass-reset-poisoning', title: 'Password Reset Poisoning', category: 'Authentication', difficulty: 'Hard', points: 400, description: 'Manipulate reset links.', scenario: 'Host header used in reset URL.', objective: 'Direct reset token to your server.' },
  { slug: 'subdomain-takeover', title: 'Subdomain Takeover', category: 'Recon', difficulty: 'Medium', points: 300, description: 'Claim dangling DNS records.', scenario: 'CNAME points to an unclaimed bucket.', objective: 'Host content on a sub-domain.' },
  { slug: 'dos-vulnerability', title: 'Denial of Service', category: 'DoS', difficulty: 'Medium', points: 250, description: 'Crash or slow down the app.', scenario: 'Expensive regex in search field.', objective: 'Make the server unresponsive.' },
  { slug: 'broken-link-hijack', title: 'Broken Link Hijacking', category: 'Recon', difficulty: 'Easy', points: 150, description: 'Claim abandoned social links.', scenario: 'Footer link points to deleted Twitter.', objective: 'Take over the social account link.' },
  { slug: 'cache-poisoning', title: 'Web Cache Poisoning', category: 'Cache', difficulty: 'Expert', points: 600, description: 'Inject data into CDN cache.', scenario: 'Unkeyed header reflected in response.', objective: 'Serve XSS to all users via cache.' },
  { slug: 'jwt-misconfig', title: 'JWT Misconfiguration', category: 'Authentication', difficulty: 'Hard', points: 350, description: 'Forge valid JWT tokens.', scenario: 'Secret key is weak or "none" allowed.', objective: 'Access admin panel via forged JWT.' },
  { slug: 'param-tampering', title: 'Parameter Tampering', category: 'Logic', difficulty: 'Easy', points: 150, description: 'Modify hidden form fields.', scenario: 'Price or ID stored in hidden inputs.', objective: 'Modify price in checkout.' },
  { slug: 'insecure-deserialization', title: 'Insecure Deserialization', category: 'RCE', difficulty: 'Expert', points: 550, description: 'Execute code via object data.', scenario: 'Untrusted data passed to unserialize().', objective: 'Execute system commands.' },
  { slug: 'api-key-leak', title: 'API Key Leakage', category: 'Information', difficulty: 'Easy', points: 100, description: 'Find keys in public code.', scenario: 'Keys hardcoded in JavaScript files.', objective: 'Find the Stripe/AWS API key.' },
  { slug: 'dir-listing', title: 'Directory Listing', category: 'Information', difficulty: 'Easy', points: 100, description: 'Browse server folders.', scenario: 'Indexes are enabled on /uploads.', objective: 'Find a hidden .backup file.' },
  { slug: 'exposed-creds', title: 'Exposed Credentials', category: 'Information', difficulty: 'Easy', points: 100, description: 'Find passwords in logs/files.', scenario: '.git or .env files are public.', objective: 'Recover the database password.' },
  { slug: 'waf-bypass', title: 'WAF Bypass', category: 'Infrastructure', difficulty: 'Hard', points: 400, description: 'Evade security filters.', scenario: 'WAF uses weak regex for SQLi.', objective: 'Execute SQLi despite WAF.' },
  { slug: 'csp-bypass', title: 'CSP Bypass', category: 'XSS', difficulty: 'Hard', points: 400, description: 'Execute XSS despite CSP.', scenario: 'CSP allows unsafe-inline or trusted CDN.', objective: 'Trigger XSS with CSP enabled.' },
  { slug: 'proto-pollution', title: 'Prototype Pollution', category: 'JS', difficulty: 'Expert', points: 500, description: 'Modify base object properties.', scenario: 'Vulnerable deep merge function.', objective: 'Overwrite admin flag to true.' },
  { slug: 'graphql-injection', title: 'GraphQL Injection', category: 'API', difficulty: 'Hard', points: 400, description: 'Abuse GraphQL queries.', scenario: 'Introspection allowed or weak filters.', objective: 'Dump the entire database schema.' },
  { slug: 'mass-assignment', title: 'Mass Assignment', category: 'API', difficulty: 'Medium', points: 250, description: 'Update unauthorized fields.', scenario: 'Object.assign used on user input.', objective: 'Update your role to admin.' },
  { slug: 'idor-advanced', title: 'Advanced IDOR', category: 'IDOR', difficulty: 'Medium', points: 300, description: 'Complex object reference.', scenario: 'UUIDs are predictable or leaked.', objective: 'Access private company documents.' },
  { slug: 'missing-func-auth', title: 'Missing Function Auth', category: 'Authorization', difficulty: 'Medium', points: 250, description: 'Access hidden admin functions.', scenario: 'API endpoints are not protected.', objective: 'Trigger the /api/delete_all user.' },
  { slug: 'improper-assets', title: 'Improper Assets Mgmt', category: 'Recon', difficulty: 'Medium', points: 200, description: 'Access staging/dev environments.', scenario: 'V1 API still active and vulnerable.', objective: 'Exploit a bug in the old API version.' },
  { slug: 'resource-consumption', title: 'Resource Consumption', category: 'DoS', difficulty: 'Medium', points: 200, description: 'Exhaust server memory/CPU.', scenario: 'Image resizing with huge dimensions.', objective: 'Cause a temporary site slowdown.' },
  { slug: 'ssti-basic', title: 'Server Side Template Injection', category: 'RCE', difficulty: 'Hard', points: 450, description: 'Inject code into templates.', scenario: 'Jinja2/EJS templates use raw input.', objective: 'Execute 7*7 in the template.' },
  { slug: 'cache-deception', title: 'Web Cache Deception', category: 'Cache', difficulty: 'Hard', points: 400, description: 'Trick cache into storing private info.', scenario: 'Static file extensions ignore cookies.', objective: 'Capture admin\'s profile via cache.' },
  { slug: 'host-injection', title: 'Host Header Injection', category: 'Injection', difficulty: 'Medium', points: 250, description: 'Manipulate the Host header.', scenario: 'Host header used in absolute URLs.', objective: 'Perform a password reset hijack.' },
  { slug: 'nosql-injection', title: 'NoSQL Injection', category: 'Injection', difficulty: 'Medium', points: 300, description: 'Bypass NoSQL queries.', scenario: 'MongoDB query uses $ne or $gt.', objective: 'Login without a password.' },
  { slug: 'ldap-injection', title: 'LDAP Injection', category: 'Injection', difficulty: 'Hard', points: 350, description: 'Manipulate LDAP queries.', scenario: 'Search filter uses raw input.', objective: 'Dump LDAP directory info.' },
  { slug: 'smtp-injection', title: 'SMTP Injection', category: 'Injection', difficulty: 'Hard', points: 350, description: 'Inject email headers.', scenario: 'Contact form doesn\'t filter newlines.', objective: 'BCC a copy of emails to yourself.' },
  { slug: 'smuggling', title: 'HTTP Request Smuggling', category: 'Infrastructure', difficulty: 'Expert', points: 700, description: 'De-sync frontend and backend.', scenario: 'CL.TE or TE.CL vulnerability.', objective: 'Capture another user\'s request.' }
];

async function seed() {
  let conn;
  try {
    conn = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306'),
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASS || '',
      multipleStatements: true
    });

    console.log('📦 Refreshing database...');
    const schemaSql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    await conn.query(schemaSql);
    await conn.changeUser({ database: process.env.DB_NAME || 'bugbounty_simulator' });

    console.log('🌱 Seeding 59 Challenges...');
    for (let ch of challenges) {
      // Add progressive hints for the core e-commerce challenges
      if (ch.slug === 'sqli-login') ch.hints = ['Think about how SQL processes string termination.', 'What happens if you inject a single quote into the search field?', 'Try using a classic UNION SELECT or OR 1=1 payload.'];
      if (ch.slug === 'stored-xss') ch.hints = ['Look at the product review functionality.', 'Does the comment field sanitize HTML tags?', 'Try injecting a basic <script>alert(1)</script> payload.'];
      if (ch.slug === 'idor-advanced') ch.hints = ['Check the URL parameters when viewing your order history.', 'Are order IDs sequential?', 'What happens if you change the order ID to 1?'];
      if (ch.slug === 'logic-flaw') ch.hints = ['Analyze the checkout request in Burp Suite.', 'Is the totalAmount calculated on the server or trusted from the client?', 'Try intercepting the request and changing the totalAmount to a negative number.'];
      if (ch.slug === 'auth-bypass') ch.hints = ['Look for hidden or administrative endpoints.', 'Check the HTTP headers required for admin/stats.', 'Can you guess or leak the x-admin-key?'];
      if (ch.slug === 'xss-reflected') ch.hints = ['Search results often reflect the query back to the user.', 'Try searching for something that includes HTML tags.', 'Can you get <script>alert(1)</script> to execute?'];
      if (ch.slug === 'csrf-basic') ch.hints = ['Look at the profile update form.', 'Does it have any hidden tokens to verify the request origin?', 'Try creating a cross-site form that auto-submits a POST request to /api/shop/profile/update.'];
      if (ch.slug === 'ssrf-internal') ch.hints = ['The "Fetch External Avatar" feature makes requests from the server.', 'Can you point it to a local service or a internal cloud metadata endpoint?', 'Try 127.0.0.1 or 169.254.169.254.'];
      if (ch.slug === 'upload-bypass') ch.hints = ['The avatar upload allows you to specify a filename.', 'Is the extension check strict enough?', 'Try bypassing the filter by using multiple extensions or null bytes.'];

      await conn.query(`
        INSERT INTO challenges (slug,title,category,difficulty,points,description,scenario,objective,hints,tags)
        VALUES (?,?,?,?,?,?,?,?,?,?)
        ON DUPLICATE KEY UPDATE title=VALUES(title), hints=VALUES(hints)
      `, [ch.slug,ch.title,ch.category,ch.difficulty,ch.points,ch.description,ch.scenario,ch.objective,JSON.stringify(ch.hints || []),JSON.stringify([])]);
    }

    console.log('👤 Creating Test User...');
    const pass = await bcrypt.hash('password123', 10);
    await conn.query('INSERT IGNORE INTO users (username, email, password_hash) VALUES (?,?,?)', 
      ['testuser', 'test@example.com', pass]);

    console.log('✅ Seeded 59 challenges successfully!');
  } catch (err) {
    console.error('❌ Setup failed:', err.message);
  } finally {
    if (conn) await conn.end();
  }
}

seed();
