-- ============================================================
-- INIT DATABASE & SCHEMA UNTUK APLIKASI SALON & SPA (POSTGRESQL)
-- ============================================================

-- 1. TABEL OUTLETS (Cabang Salon & Spa)
CREATE TABLE IF NOT EXISTS outlets (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    address TEXT NOT NULL,
    phone VARCHAR(50),
    image_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. TABEL USERS (Admin & Operator Cabang Salon)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(150) NOT NULL,
    role VARCHAR(50) DEFAULT 'admin',
    outlet_id INT REFERENCES outlets(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Safe migration for existing users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS outlet_id INT REFERENCES outlets(id) ON DELETE SET NULL;

-- 3. TABEL SERVICES (Layanan Salon & Spa)
CREATE TABLE IF NOT EXISTS services (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    duration_minutes INT NOT NULL DEFAULT 60,
    price DECIMAL(12, 2) NOT NULL,
    description TEXT,
    image_url TEXT,
    created_by_outlet_id INT REFERENCES outlets(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Safe migration for existing services table
ALTER TABLE services ADD COLUMN IF NOT EXISTS created_by_outlet_id INT REFERENCES outlets(id) ON DELETE SET NULL;

-- 4. TABEL OUTLET_SERVICES (Mapping Layanan per Outlet)
CREATE TABLE IF NOT EXISTS outlet_services (
    outlet_id INT REFERENCES outlets(id) ON DELETE CASCADE,
    service_id INT REFERENCES services(id) ON DELETE CASCADE,
    PRIMARY KEY (outlet_id, service_id)
);

-- 5. TABEL BOOKINGS (Pemesanan Layanan)
CREATE TABLE IF NOT EXISTS bookings (
    id SERIAL PRIMARY KEY,
    booking_code VARCHAR(50) UNIQUE NOT NULL,
    customer_name VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(50) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    outlet_id INT REFERENCES outlets(id) ON DELETE SET NULL,
    service_id INT REFERENCES services(id) ON DELETE SET NULL,
    staff_name VARCHAR(100) DEFAULT 'Bebas / Any Staff',
    booking_datetime TIMESTAMP NOT NULL,
    payment_deadline TIMESTAMP NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'Pending',
    payment_proof TEXT,
    notes TEXT,
    created_by VARCHAR(20) DEFAULT 'public',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Safe migration for existing bookings table
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS outlet_id INT REFERENCES outlets(id) ON DELETE SET NULL;

-- 6. TABEL CONFIGS (Pengaturan Pembayaran & Kontak)
CREATE TABLE IF NOT EXISTS configs (
    id SERIAL PRIMARY KEY,
    key VARCHAR(100) UNIQUE NOT NULL,
    value TEXT NOT NULL,
    description VARCHAR(255),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. TABEL STAFF (Terapis / Stylist)
CREATE TABLE IF NOT EXISTS staff (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    role VARCHAR(100) DEFAULT 'Stylist / Therapist',
    outlet_id INT REFERENCES outlets(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Safe migration for existing staff table
ALTER TABLE staff ADD COLUMN IF NOT EXISTS outlet_id INT REFERENCES outlets(id) ON DELETE SET NULL;

-- 8. TABEL STAFF_SERVICES (Relasi Staff & Layanan)
CREATE TABLE IF NOT EXISTS staff_services (
    staff_id INT REFERENCES staff(id) ON DELETE CASCADE,
    service_id INT REFERENCES services(id) ON DELETE CASCADE,
    PRIMARY KEY (staff_id, service_id)
);

-- 9. TABEL BOOKING_ITEMS (Multi-Service / Merged Bookings)
CREATE TABLE IF NOT EXISTS booking_items (
    id SERIAL PRIMARY KEY,
    booking_id INT REFERENCES bookings(id) ON DELETE CASCADE,
    service_id INT REFERENCES services(id) ON DELETE SET NULL,
    staff_name VARCHAR(100) DEFAULT 'Bebas / Any Staff',
    booking_datetime TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- INSERT SEED DATA (USER ADMIN, OUTLETS, SERVICES, CONFIGS & STAFF)
-- ============================================================

-- Seed Data Outlets
INSERT INTO outlets (id, name, address, phone, image_url, is_active) VALUES
(1, 'Luxe Salon - Dharmawangsa', 'Jl. Dharmawangsa Raya No. 12, Kebayoran Baru, Jakarta Selatan', '081234567890', 'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=600&q=80', true),
(2, 'Luxe Salon - Kemang Flagship', 'Jl. Kemang Raya No. 45, Bangka, Jakarta Selatan', '081987654321', 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=600&q=80', true),
(3, 'Luxe Salon - Bintaro Studio', 'Bintaro Jaya Sektor 7 No. 88, Tangerang Selatan', '081311223344', 'https://images.unsplash.com/photo-1600948836101-f9ffda59d250?auto=format&fit=crop&w=600&q=80', true)
ON CONFLICT (id) DO NOTHING;

SELECT setval('outlets_id_seq', (SELECT MAX(id) FROM outlets));

-- Insert Super Admin & Branch Operator Users dengan Passwords Bcrypt Hashed ('admin123'):
INSERT INTO users (username, password, name, role, outlet_id) VALUES 
('admin', '$2b$10$wOpg7x95grL3FqD0J6ZNbe2lMSHIEG81iuHlB0NVcEEgQ8Uggsb76', 'Super Admin Salon', 'admin', NULL),
('operator_dharmawangsa', '$2b$10$wOpg7x95grL3FqD0J6ZNbe2lMSHIEG81iuHlB0NVcEEgQ8Uggsb76', 'Operator Dharmawangsa', 'outlet_admin', 1),
('operator_kemang', '$2b$10$wOpg7x95grL3FqD0J6ZNbe2lMSHIEG81iuHlB0NVcEEgQ8Uggsb76', 'Operator Kemang', 'outlet_admin', 2)
ON CONFLICT (username) DO UPDATE 
SET password = EXCLUDED.password, name = EXCLUDED.name, role = EXCLUDED.role, outlet_id = EXCLUDED.outlet_id;

-- Seed Data Configs
INSERT INTO configs (key, value, description) VALUES 
('payment_bank_name', 'Bank Central Asia (BCA) a/n Luxe Salon', 'Nama Bank & Atas Nama'),
('payment_account_number', '8830192847', 'Nomor Rekening Bank'),
('payment_qris_image', '/uploads/qris-default.png', 'Path gambar QRIS'),
('whatsapp_number', '6281234567890', 'Nomor WhatsApp Admin untuk konfirmasi'),
('payment_deadline_offset_minutes', '60', 'Batas waktu pembayaran dalam menit setelah booking'),
('social_instagram', 'https://instagram.com', 'URL Instagram'),
('social_twitter', 'https://twitter.com', 'URL Twitter/X'),
('social_youtube', 'https://youtube.com', 'URL YouTube'),
('social_facebook', 'https://facebook.com', 'URL Facebook'),
('social_linkedin', 'https://linkedin.com', 'URL LinkedIn'),
('social_threads', 'https://threads.net', 'URL Threads')
ON CONFLICT (key) DO NOTHING;

-- Seed Data Services (Master Services created by Super Admin, created_by_outlet_id = NULL)
INSERT INTO services (id, name, duration_minutes, price, description, image_url, created_by_outlet_id) VALUES
(1, 'Hair Spa Aromatherapy', 60, 150000, 'Perawatan rambut mendalam dengan nutrisi ginseng dan pijat relaksasi kulit kepala.', 'https://images.unsplash.com/photo-1560750588-73207b1ef5b8?auto=format&fit=crop&w=600&q=80', NULL),
(2, 'Premium Haircut & Styling', 45, 85000, 'Potong rambut profesional disesuaikan dengan bentuk wajah + cuci & blow dry.', 'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=600&q=80', NULL),
(3, 'Organic Facial Treatment', 60, 180000, 'Perawatan wajah alami untuk mencerahkan, mengenyalkan, dan mengecilkan pori-pori.', 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=600&q=80', NULL),
(4, 'Relaxing Body Massage', 90, 220000, 'Pijat relaksasi seluruh tubuh dengan essential oil lavender pilihan.', 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=600&q=80', NULL),
(5, 'Luxe Gel Manicure & Pedicure', 60, 135000, 'Perawatan kuku tangan dan kaki premium dengan pembersihan kutikula & cat gel tahan lama.', 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=600&q=80', NULL),
(6, 'Hair Coloring & Highlight', 120, 350000, 'Pewarnaan rambut profesional menggunakan cat vegan tanpa merusak struktur rambut.', 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80', NULL)
ON CONFLICT (id) DO NOTHING;

SELECT setval('services_id_seq', (SELECT MAX(id) FROM services));

-- Seed Data Outlet Services Mapping
INSERT INTO outlet_services (outlet_id, service_id) VALUES
(1, 1), (1, 2), (1, 3), (1, 4), (1, 5), (1, 6),
(2, 1), (2, 2), (2, 4), (2, 6),
(3, 2), (3, 3), (3, 5)
ON CONFLICT DO NOTHING;

-- Seed Data Staff
INSERT INTO staff (id, name, role, outlet_id, is_active) VALUES 
(1, 'Stylist Anita', 'Senior Hair Stylist', 1, true),
(2, 'Therapist Maya', 'Beauty & Massage Specialist', 1, true),
(3, 'Stylist Budi', 'Hair Coloring Specialist', 2, true),
(4, 'Stylist Rina', 'Junior Hair Stylist', 2, true),
(5, 'Therapist Sinta', 'Facial & Nail Specialist', 3, true),
(6, 'Capster Dewi', 'Hair & Creambath Specialist', 3, true)
ON CONFLICT (id) DO UPDATE SET outlet_id = EXCLUDED.outlet_id;

SELECT setval('staff_id_seq', (SELECT MAX(id) FROM staff));

-- Seed Data Staff Services Mapping
INSERT INTO staff_services (staff_id, service_id) VALUES 
(1, 1), (1, 2), (1, 6),
(2, 3), (2, 4),
(3, 2), (3, 6),
(4, 1), (4, 2),
(5, 3), (5, 5),
(6, 1), (6, 4), (6, 5)
ON CONFLICT DO NOTHING;
