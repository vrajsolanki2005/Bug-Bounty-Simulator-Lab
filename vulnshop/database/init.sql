-- ============================================================
--  VulnShop — Schema + Seed Data
--  NOTE: Database creation and USE is handled by init.js
--  Compatible with MySQL 5.7+ and MariaDB 10.3+
-- ============================================================

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS cart_items;
DROP TABLE IF EXISTS reviews;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS coupons;
DROP TABLE IF EXISTS flags;
DROP TABLE IF EXISTS users;

-- ── TABLES ───────────────────────────────────────────────────

CREATE TABLE users (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  username   VARCHAR(50)  NOT NULL UNIQUE,
  email      VARCHAR(100) NOT NULL UNIQUE,
  password   VARCHAR(255) NOT NULL,
  role       VARCHAR(20)  DEFAULT 'user',
  full_name  VARCHAR(100),
  address    TEXT,
  phone      VARCHAR(20),
  avatar     VARCHAR(255) DEFAULT '/images/default-avatar.png',
  created_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE products (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  name           VARCHAR(200) NOT NULL,
  description    TEXT,
  price          DECIMAL(10,2) NOT NULL,
  original_price DECIMAL(10,2),
  category       VARCHAR(50),
  image_url      VARCHAR(255),
  stock          INT           DEFAULT 100,
  rating         DECIMAL(3,2)  DEFAULT 4.0,
  review_count   INT           DEFAULT 0,
  seller         VARCHAR(100)  DEFAULT 'VulnShop Official',
  created_at     TIMESTAMP     DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE reviews (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  product_id    INT NOT NULL,
  user_id       INT NOT NULL,
  username      VARCHAR(50),
  rating        INT,
  title         VARCHAR(200),
  content       TEXT,
  helpful_count INT       DEFAULT 0,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id),
  FOREIGN KEY (user_id)    REFERENCES users(id)
);

CREATE TABLE cart_items (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  user_id    INT NOT NULL,
  product_id INT NOT NULL,
  quantity   INT NOT NULL DEFAULT 1,
  added_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id)    REFERENCES users(id),
  FOREIGN KEY (product_id) REFERENCES products(id)
);

CREATE TABLE orders (
  id               INT AUTO_INCREMENT PRIMARY KEY,
  user_id          INT NOT NULL,
  total            DECIMAL(10,2),
  status           VARCHAR(50) DEFAULT 'Processing',
  shipping_address TEXT,
  payment_last4    VARCHAR(4),
  payment_method   VARCHAR(50),
  tracking_number  VARCHAR(100),
  notes            TEXT,
  created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE order_items (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  order_id     INT NOT NULL,
  product_id   INT NOT NULL,
  product_name VARCHAR(200),
  quantity     INT,
  price        DECIMAL(10,2),
  FOREIGN KEY (order_id)   REFERENCES orders(id),
  FOREIGN KEY (product_id) REFERENCES products(id)
);

CREATE TABLE coupons (
  id               INT AUTO_INCREMENT PRIMARY KEY,
  code             VARCHAR(50) NOT NULL UNIQUE,
  discount_percent DECIMAL(5,2),
  discount_amount  DECIMAL(10,2),
  max_uses         INT           DEFAULT 100,
  used_count       INT           DEFAULT 0,
  min_order_amount DECIMAL(10,2) DEFAULT 0,
  expires_at       DATETIME,
  created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE flags (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  challenge_name VARCHAR(100),
  flag_value     VARCHAR(255),
  description    TEXT
);

SET FOREIGN_KEY_CHECKS = 1;

-- ── USERS (plaintext passwords — intentional vuln) ────────────

INSERT INTO users (username, email, password, role, full_name, address, phone) VALUES
('admin',       'admin@vulnshop.com', 'admin123',    'admin', 'Shop Administrator', '1 Admin Lane, Server Room, CA 90210',    '555-0100'),
('john',    'john@example.com',   'john123', 'user',  'John Doe',           '123 Main Street, Springfield, IL 62701', '555-0101'),
('smith',  'smith@example.com',   'smith123',     'user',  'Smith',         '456 Oak Avenue, Portland, OR 97201',     '555-0102'),
('bob',  'bob@example.com',    'bob123',   'user',  'Bob ',         '789 Cyber Street, Austin, TX 73301',     '555-0103'),
('micky', 'micky@example.com',  'micky123',   'user',  'Micky',        '321 Shopping Lane, Miami, FL 33101',     '555-0104');

-- ── PRODUCTS ─────────────────────────────────────────────────

INSERT INTO products (name, description, price, original_price, category, image_url, stock, rating, review_count, seller) VALUES
('Apple MacBook Pro 16 M3 Pro',
 'The most powerful MacBook Pro ever. M3 Pro chip with 12-core CPU and 18-core GPU, up to 18-hour battery life, and stunning Liquid Retina XDR display.',
 2499.00, 2799.00, 'Electronics', 'https://picsum.photos/seed/macbook/400/300', 45, 4.8, 1247, 'Apple Store'),

('Sony WH-1000XM5 Wireless Headphones',
 'Industry-leading noise canceling with Dual Noise Sensor technology. Up to 30-hour battery life with quick charging. Crystal-clear call quality with 4 beamforming microphones.',
 279.99, 399.99, 'Electronics', 'https://picsum.photos/seed/headphones/400/300', 230, 4.7, 3892, 'Sony Official'),

('Samsung 65 Inch 4K QLED TV',
 'Quantum HDR 32x. Quantum Processor 4K. 100% Color Volume with Quantum Dot. Alexa and Google Assistant built-in. Object Tracking Sound+.',
 1199.99, 1599.99, 'Electronics', 'https://picsum.photos/seed/samsung_tv/400/300', 67, 4.6, 892, 'Samsung'),

('Nike Air Max 270',
 'Delivers unbelievable comfort with its massive heel Air unit, the tallest ever in a lifestyle shoe. Lightweight upper with a full-length Air unit underfoot.',
 149.99, 180.00, 'Fashion', 'https://picsum.photos/seed/nike270/400/300', 500, 4.5, 5621, 'Nike Official'),

('The Psychology of Money',
 'Timeless lessons on wealth, greed, and happiness. Doing well with money isn''t necessarily about what you know. It''s about how you behave.',
 16.99, 24.99, 'Books', 'https://picsum.photos/seed/book_money/400/300', 999, 4.7, 28943, 'VulnShop Books'),

('Instant Pot Duo 7-in-1',
 'Pressure cooker, slow cooker, rice cooker, steamer, saute, yogurt maker, and warmer. Cooks up to 70% faster than traditional cooking methods.',
 79.99, 99.99, 'Home & Kitchen', 'https://picsum.photos/seed/instantpot/400/300', 342, 4.7, 98234, 'Instant Brands'),

('Levi''s 501 Original Jeans',
 'The original blue jean since 1873. Straight fit, button fly, sits at the waist. 100% cotton denim. A timeless classic that never goes out of style.',
 59.99, 79.99, 'Fashion', 'https://picsum.photos/seed/levis501/400/300', 750, 4.4, 12893, 'Levi''s'),

('Kindle Paperwhite 16 GB',
 'The thinnest, lightest Kindle Paperwhite with a flush-front design and 300 ppi glare-free display. Now with 3 months free Kindle Unlimited.',
 139.99, 159.99, 'Electronics', 'https://picsum.photos/seed/kindle/400/300', 445, 4.6, 45231, 'Amazon'),

('LEGO Star Wars Millennium Falcon',
 'Build the iconic Starship with 7541 pieces. Includes Han Solo, Chewbacca, Princess Leia, C-3PO, R2-D2, and Rey minifigures. Authentic interior details.',
 849.99, 999.99, 'Toys & Games', 'https://picsum.photos/seed/lego_falcon/400/300', 89, 4.9, 3421, 'LEGO Group'),

('Dyson V15 Detect Vacuum',
 'Laser detects hidden dust. Automatically increases suction power. Up to 60 minutes fade-free suction. Engineered to detect, capture and destroy dust.',
 699.99, 849.99, 'Home & Kitchen', 'https://picsum.photos/seed/dyson/400/300', 123, 4.6, 2341, 'Dyson'),

('Gaming Chair DXRacer Formula',
 'Racing-style gaming chair with lumbar support cushion and headrest pillow. Multi-tilt mechanism and height adjustment for long gaming sessions.',
 399.99, 499.99, 'Sports & Gaming', 'https://picsum.photos/seed/gaming_chair/400/300', 78, 4.3, 1893, 'DXRacer'),

('Canon EOS R50 Mirrorless Camera',
 '24.2 MP APS-C CMOS sensor. DIGIC X image processor. 4K 30p video. Wi-Fi and Bluetooth connectivity. Ideal for content creators and photography enthusiasts.',
 679.99, 799.99, 'Electronics', 'https://picsum.photos/seed/canon_r50/400/300', 156, 4.7, 4231, 'Canon'),

('Atomic Habits by James Clear',
 'An easy and proven way to build good habits and break bad ones. Over 10 million copies sold worldwide. Number 1 New York Times bestseller.',
 14.99, 27.99, 'Books', 'https://picsum.photos/seed/atomic_habits/400/300', 999, 4.8, 127493, 'VulnShop Books'),

('Vitamix 5200 Blender',
 'Variable speed control. Self-cleaning. Create hot soups and frozen desserts. Aircraft-grade stainless steel blades designed to handle the toughest ingredients.',
 399.99, 549.99, 'Home & Kitchen', 'https://picsum.photos/seed/vitamix/400/300', 234, 4.8, 8934, 'Vitamix'),

('Ray-Ban Aviator Classic',
 'The original aviator style since 1937. UV protection polarized lens. Gold metal frame. Iconic style that transcends time and fashion trends.',
 161.00, 200.00, 'Fashion', 'https://picsum.photos/seed/rayban/400/300', 890, 4.5, 23421, 'Ray-Ban'),

('Logitech MX Master 3S Mouse',
 'Hyper-fast MagSpeed scrolling. 8000 DPI optical sensor. Multi-device support. Ergonomic design. USB-C fast charging. Perfect for productivity power users.',
 99.99, 129.99, 'Electronics', 'https://picsum.photos/seed/logitech_mouse/400/300', 567, 4.7, 18923, 'Logitech'),

('Ninja Foodi Personal Blender',
 '1000-watt motor. Nutrient extraction with Auto-iQ technology. 18 oz and 24 oz cups included. Dishwasher safe. Create smoothies, shakes, and more.',
 59.99, 79.99, 'Home & Kitchen', 'https://picsum.photos/seed/ninja_blender/400/300', 423, 4.5, 12893, 'Ninja'),

('Theragun Pro Plus',
 'Professional-grade percussion massage device. 6 attachments. Smart App integration. 150-minute battery life. Reduces muscle soreness and improves recovery.',
 599.99, 699.99, 'Sports & Gaming', 'https://picsum.photos/seed/theragun/400/300', 89, 4.6, 3421, 'Therabody'),

('Echo Show 10 3rd Gen',
 'Designed to automatically keep you in frame. 10.1-inch HD screen. Moves with you around the room during video calls. Built-in Zigbee smart home hub.',
 249.99, 299.99, 'Electronics', 'https://picsum.photos/seed/echo_show/400/300', 334, 4.3, 8923, 'Amazon'),

('Weber Spirit II E-310 Grill',
 'Three-burner gas grill. 529 sq in cooking area. Porcelain-enameled cast-iron cooking grates. Flavorizer bars channel grease away from burners.',
 529.00, 649.00, 'Sports & Gaming', 'https://picsum.photos/seed/weber_grill/400/300', 45, 4.7, 4521, 'Weber'),

('Patagonia Nano Puff Jacket',
 'PrimaLoft Gold Insulation Eco fill. Bluesign-approved face fabric. Windproof and water-resistant. Stuffs into its own chest pocket. Responsibly made.',
 229.00, 279.00, 'Fashion', 'https://picsum.photos/seed/patagonia/400/300', 345, 4.6, 6781, 'Patagonia'),

('iPad Pro 12.9 Inch M2',
 'Supercharged by the Apple M2 chip. Stunning 12.9-inch Liquid Retina XDR display. Thunderbolt connectivity. Pro cameras with LiDAR Scanner. Apple Pencil support.',
 1099.00, 1299.00, 'Electronics', 'https://picsum.photos/seed/ipad_pro/400/300', 189, 4.8, 9823, 'Apple Store'),

('Rich Dad Poor Dad',
 'Robert Kiyosaki shares the story of having two dads and his best friend''s father. Timeless lessons about money management and investment strategy.',
 9.99, 17.99, 'Books', 'https://picsum.photos/seed/richdad/400/300', 999, 4.6, 89234, 'VulnShop Books'),

('Nest Learning Thermostat',
 'Auto-schedule. Home and Away Assist. Energy History. Remote control via app. Compatible with 95% of heating and cooling systems. Saves up to 15% on cooling.',
 249.99, 299.99, 'Home & Kitchen', 'https://picsum.photos/seed/nest_thermostat/400/300', 267, 4.6, 23451, 'Google Nest'),

('Peloton Bike Plus',
 'Rotating 23.8-inch HD touchscreen. Auto-resistance changes with instructor. Rear-facing camera. Live and on-demand classes. Bluetooth heart rate connectivity.',
 2495.00, 2995.00, 'Sports & Gaming', 'https://picsum.photos/seed/peloton/400/300', 23, 4.4, 5623, 'Peloton'),

('AirPods Pro 2nd Generation',
 'Up to 2x more Active Noise Cancellation. Adaptive Transparency. Personalized Spatial Audio. MagSafe Charging Case. Touch control for easy access.',
 249.00, 299.00, 'Electronics', 'https://picsum.photos/seed/airpods_pro/400/300', 456, 4.7, 34521, 'Apple Store'),

('Cuisinart 12-Cup Coffee Maker',
 'Fully automatic with 24-hour programmability. Brew Pause feature. Self-cleaning. Charcoal water filter. Includes reusable gold-tone commercial-style filter.',
 89.99, 119.99, 'Home & Kitchen', 'https://picsum.photos/seed/cuisinart/400/300', 678, 4.5, 45231, 'Cuisinart'),

('Adidas Ultraboost 23',
 'Responsive BOOST midsole cushioning. Primeknit upper adapts to movement. Continental rubber outsole for grip in wet conditions. Made with recycled materials.',
 189.99, 220.00, 'Fashion', 'https://picsum.photos/seed/ultraboost/400/300', 456, 4.6, 12893, 'Adidas'),

('PlayStation 5 Console',
 'Experience lightning-fast loading with an ultra-high-speed SSD. Deeper immersion with haptic feedback, adaptive triggers, and 3D Audio.',
 499.99, 499.99, 'Electronics', 'https://picsum.photos/seed/ps5/400/300', 34, 4.8, 56789, 'PlayStation'),

('The 48 Laws of Power',
 'Robert Greene distills three thousand years of the history of power into 48 essential laws. Amoral, cunning, ruthless, and instructive. A landmark guide.',
 21.99, 29.99, 'Books', 'https://picsum.photos/seed/48laws/400/300', 999, 4.5, 34521, 'VulnShop Books');

-- ── REVIEWS ──────────────────────────────────────────────────

INSERT INTO reviews (product_id, user_id, username, rating, title, content) VALUES
(1,  2, 'john_doe',   5, 'Amazing laptop!',          'This MacBook Pro is incredible. Battery life is outstanding and the M3 Pro chip is blazing fast. Highly recommend for developers.'),
(1,  3, 'jane_smith', 4, 'Great but expensive',      'The performance is unmatched but the price tag is steep. Worth it if you can afford it. The display is gorgeous.'),
(5,  2, 'john_doe',   5, 'Life-changing book',       'Morgan Housel writes brilliantly about how psychology affects our financial decisions. A must-read for everyone.'),
(26, 4, 'bob_hacker', 5, 'Best earbuds ever',        'The noise cancellation on these AirPods Pro is insane. Call quality is crystal clear. Worth every penny.'),
(4,  3, 'jane_smith', 4, 'Comfortable and stylish',  'Great shoes for everyday wear. The Air cushioning makes them super comfortable for all-day walking.'),
(16, 2, 'john_doe',   5, 'Productivity game-changer','The MagSpeed scrolling is buttery smooth. Multi-device works flawlessly. Best mouse I have ever owned.');

-- ── ORDERS (order #1 = admin, holds the IDOR flag) ────────────

INSERT INTO orders (user_id, total, status, shipping_address, payment_last4, payment_method, tracking_number, notes) VALUES
(1, 3749.98, 'Delivered', '1 Admin Lane, Server Room, CA 90210',    '4242', 'Visa',       'TRACK-ADM-001', 'ADMIN_SECRET_ORDER: flag{1d0r_0rd3r_4cc3ss_s3qu3nt14l_1d_2024}'),
(2,  296.98, 'Delivered', '123 Main Street, Springfield, IL 62701', '1234', 'Mastercard', 'TRACK-001-XY',  'Standard delivery'),
(3,  449.97, 'Shipped',   '456 Oak Avenue, Portland, OR 97201',     '5678', 'Visa',       'TRACK-002-AB',  'Gift wrapping requested'),
(2,  849.99, 'Processing','123 Main Street, Springfield, IL 62701', '1234', 'Mastercard', NULL,            'Express shipping'),
(4,  179.97, 'Delivered', '789 Cyber Street, Austin, TX 73301',     '9999', 'Amex',       'TRACK-003-CD',  'Leave at door'),
(5,  529.00, 'Shipped',   '321 Shopping Lane, Miami, FL 33101',     '7777', 'Visa',       'TRACK-004-EF',  NULL);

-- ── ORDER ITEMS ───────────────────────────────────────────────

INSERT INTO order_items (order_id, product_id, product_name, quantity, price) VALUES
(1, 1,  'Apple MacBook Pro 16 M3 Pro',      1, 2499.00),
(1, 26, 'AirPods Pro 2nd Generation',       1,  249.00),
(1, 16, 'Logitech MX Master 3S Mouse',      1,   99.99),
(2, 4,  'Nike Air Max 270',                 1,  149.99),
(2, 5,  'The Psychology of Money',          1,   16.99),
(2, 17, 'Ninja Foodi Personal Blender',     1,   59.99),
(3, 11, 'Gaming Chair DXRacer Formula',     1,  399.99),
(3, 15, 'Ray-Ban Aviator Classic',          1,  161.00),
(4, 9,  'LEGO Star Wars Millennium Falcon', 1,  849.99),
(5, 13, 'Atomic Habits by James Clear',     2,   14.99),
(5, 23, 'Rich Dad Poor Dad',                1,    9.99),
(5, 30, 'The 48 Laws of Power',             1,   21.99),
(6, 20, 'Weber Spirit II E-310 Grill',      1,  529.00);

-- ── COUPONS (no per-user tracking — business logic vuln) ─────

INSERT INTO coupons (code, discount_percent, discount_amount, max_uses, used_count, min_order_amount) VALUES
('WELCOME10', 10.00, NULL,   1000,  45,   0.00),
('SAVE20',    20.00, NULL,    500,  12,  50.00),
('FLASH50',   50.00, NULL,    100,  99, 100.00),
('FREESHIP',  NULL,   9.99, 1000, 234,   0.00),
('VIP100',    NULL, 100.00,   10,   9, 200.00);

-- ── FLAGS (extracted via SQL injection challenge) ─────────────

INSERT INTO flags (challenge_name, flag_value, description) VALUES
('sql_injection_login',  'flag{sql_1nj3ct10n_4uth_byp4ss_2024}',      'Login bypass — try username: admin''-- with any password'),
('sql_injection_search', 'flag{un10n_b4s3d_sql1_d4t4_dump_2024}',      'UNION SELECT in /products?q= to dump this table'),
('reflected_xss',        'flag{r3fl3ct3d_xss_c00k13_st34l_2024}',      'Reflected XSS via /products?q= parameter'),
('stored_xss',           'flag{st0r3d_xss_p3rs1st3nt_4tt4ck_2024}',    'Stored XSS via product review content field'),
('idor_orders',          'flag{1d0r_0rd3r_4cc3ss_s3qu3nt14l_1d_2024}', 'IDOR — access /orders/1 while logged in as any regular user'),
('admin_bypass',         'flag{4dm1n_byp4ss_w34k_4uth_ch3ck_2024}',    'Admin bypass via ?admin=true or X-Admin-Override header'),
('privilege_escalation', 'flag{m4ss_4ss1gnm3nt_pr1v_3sc_2024}',        'Mass assignment — register with role=admin in POST body'),
('csrf_attack',          'flag{csrf_n0_t0k3n_p4ssw0rd_ch4ng3_2024}',   'CSRF — password change endpoint has no token validation'),
('file_upload',          'flag{f1l3_upl04d_n0_v4l1d4t10n_2024}',       'File upload bypass — upload .html or .js as avatar'),
('business_logic',       'flag{bus1n3ss_l0g1c_pr1c3_m4n1p_2024}',      'Business logic — FLASH50 coupon has no per-user usage limit'),
('path_traversal',       'flag{p4th_tr4v3rs4l_d1r_l1st1ng_2024}',      'Path traversal in /profile/download?file=../../etc');
