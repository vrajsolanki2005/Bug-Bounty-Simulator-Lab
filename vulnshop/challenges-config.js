module.exports = {
  'sqli-login': {
    label: 'SQL Injection (Login)',
    detection: (req) =>
      req.method === 'POST' &&
      req.path === '/login' &&
      req.body?.username &&
      /['";]|--/.test(req.body.username)
  },
  'sqli-union': {
    label: 'SQL Injection (UNION)',
    detection: (req) =>
      req.method === 'GET' &&
      req.query?.q &&
      /union\s+select/i.test(req.query.q)
  },
  'reflected-xss': {
    label: 'Reflected XSS',
    detection: (req) =>
      req.method === 'GET' &&
      req.query?.q &&
      /<[^>]+>|javascript:/i.test(req.query.q)
  },
  'stored-xss': {
    label: 'Stored XSS',
    detection: (req) =>
      req.method === 'POST' &&
      /\/products\/\d+\/review/.test(req.path) &&
      req.body?.content &&
      /<[^>]+>|javascript:/i.test(req.body.content)
  },
  'idor-orders': {
    label: 'IDOR (Order Access)',
    detection: (req, session) =>
      req.method === 'GET' &&
      /\/orders\/\d+/.test(req.path) &&
      session?.user?.id !== 1
  },
  'admin-bypass': {
    label: 'Admin Panel Bypass',
    detection: (req) =>
      req.path === '/' &&
      (req.query?.admin === 'true' || req.headers?.['x-admin-override'])
  },
  'privilege-escalation': {
    label: 'Privilege Escalation (Mass Assignment)',
    detection: (req) =>
      req.method === 'POST' &&
      req.path === '/register' &&
      req.body?.role === 'admin'
  },
  'csrf-password': {
    label: 'CSRF (Password Change)',
    detection: (req) =>
      req.method === 'POST' &&
      req.path === '/password' &&
      !req.headers?.['x-csrf-token']
  },
  'file-upload': {
    label: 'Unrestricted File Upload',
    detection: (req) => {
      if (req.method !== 'POST' || req.path !== '/avatar') return false;
      const dangerous = ['.html', '.htm', '.js', '.php', '.jsp', '.asp', '.aspx', '.svg'];
      const filename = req.file?.originalname || '';
      const ext = filename.slice(filename.lastIndexOf('.')).toLowerCase();
      return dangerous.includes(ext);
    }
  },
  'business-logic': {
    label: 'Business Logic (Coupon Abuse)',
    detection: (req) =>
      req.method === 'POST' &&
      req.path === '/coupon' &&
      req.body?.coupon_code?.toUpperCase() === 'FLASH50'
  }
};
