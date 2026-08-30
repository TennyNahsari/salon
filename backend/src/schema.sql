-- Schema Database Salon & Spa
CREATE TABLE IF NOT EXISTS services (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    duration_minutes INT NOT NULL DEFAULT 60,
    price DECIMAL(12, 2) NOT NULL,
    description TEXT,
    image_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS bookings (
    id SERIAL PRIMARY KEY,
    booking_code VARCHAR(50) UNIQUE NOT NULL,
    customer_name VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(50) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
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

CREATE TABLE IF NOT EXISTS configs (
    id SERIAL PRIMARY KEY,
    key VARCHAR(100) UNIQUE NOT NULL,
    value TEXT NOT NULL,
    description VARCHAR(255),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed Configurations if missing
INSERT INTO configs (key, value, description)
VALUES 
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

-- Seed Default Services if empty
INSERT INTO services (name, duration_minutes, price, description, image_url)
SELECT 'Hair Spa Aromatherapy', 60, 150000, 'Perawatan rambut mendalam dengan nutrisi ginseng dan pijat relaksasi kulit kepala.', 'https://images.unsplash.com/photo-1560750588-73207b1ef5b8?auto=format&fit=crop&w=600&q=80'
WHERE NOT EXISTS (SELECT 1 FROM services WHERE name = 'Hair Spa Aromatherapy');

INSERT INTO services (name, duration_minutes, price, description, image_url)
SELECT 'Premium Haircut & Styling', 45, 85000, 'Potong rambut profesional disesuaikan dengan bentuk wajah + cuci & blow dry.', 'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=600&q=80'
WHERE NOT EXISTS (SELECT 1 FROM services WHERE name = 'Premium Haircut & Styling');

INSERT INTO services (name, duration_minutes, price, description, image_url)
SELECT 'Organic Facial Treatment', 60, 180000, 'Perawatan wajah alami untuk mencerahkan, mengenyalkan, dan mengecilkan pori-pori.', 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=600&q=80'
WHERE NOT EXISTS (SELECT 1 FROM services WHERE name = 'Organic Facial Treatment');

INSERT INTO services (name, duration_minutes, price, description, image_url)
SELECT 'Relaxing Body Massage', 90, 220000, 'Pijat relaksasi seluruh tubuh dengan essential oil lavender pilihan.', 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=600&q=80'
WHERE NOT EXISTS (SELECT 1 FROM services WHERE name = 'Relaxing Body Massage');

INSERT INTO services (name, duration_minutes, price, description, image_url)
SELECT 'Luxe Gel Manicure & Pedicure', 60, 135000, 'Perawatan kuku tangan dan kaki premium dengan pembersihan kutikula & cat gel tahan lama.', 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=600&q=80'
WHERE NOT EXISTS (SELECT 1 FROM services WHERE name = 'Luxe Gel Manicure & Pedicure');

INSERT INTO services (name, duration_minutes, price, description, image_url)
SELECT 'Hair Coloring & Highlight', 120, 350000, 'Pewarnaan rambut profesional menggunakan cat vegan tanpa merusak struktur rambut.', 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80'
WHERE NOT EXISTS (SELECT 1 FROM services WHERE name = 'Hair Coloring & Highlight');

-- Staff Table & Services Mapping Table
CREATE TABLE IF NOT EXISTS staff (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    role VARCHAR(100) DEFAULT 'Stylist / Therapist',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS staff_services (
    staff_id INT REFERENCES staff(id) ON DELETE CASCADE,
    service_id INT REFERENCES services(id) ON DELETE CASCADE,
    PRIMARY KEY (staff_id, service_id)
);

-- Seed Staff Data if empty
INSERT INTO staff (id, name, role, is_active)
VALUES 
    (1, 'Stylist Anita', 'Senior Hair Stylist', true),
    (2, 'Therapist Maya', 'Beauty & Massage Specialist', true),
    (3, 'Stylist Budi', 'Hair Coloring Specialist', true),
    (4, 'Stylist Rina', 'Junior Hair Stylist', true),
    (5, 'Therapist Sinta', 'Facial & Nail Specialist', true),
    (6, 'Capster Dewi', 'Hair & Creambath Specialist', true)
ON CONFLICT (id) DO NOTHING;

-- Seed Staff Services Mapping (assign skills to seeded staff)
-- Staff 1: Hair Spa (1), Haircut (2), Hair Coloring (6)
INSERT INTO staff_services (staff_id, service_id) VALUES (1, 1), (1, 2), (1, 6) ON CONFLICT DO NOTHING;
-- Staff 2: Facial (3), Body Massage (4)
INSERT INTO staff_services (staff_id, service_id) VALUES (2, 3), (2, 4) ON CONFLICT DO NOTHING;
-- Staff 3: Haircut (2), Hair Coloring (6)
INSERT INTO staff_services (staff_id, service_id) VALUES (3, 2), (3, 6) ON CONFLICT DO NOTHING;
-- Staff 4: Hair Spa (1), Haircut (2)
INSERT INTO staff_services (staff_id, service_id) VALUES (4, 1), (4, 2) ON CONFLICT DO NOTHING;
-- Staff 5: Facial (3), Manicure/Pedicure (5)
INSERT INTO staff_services (staff_id, service_id) VALUES (5, 3), (5, 5) ON CONFLICT DO NOTHING;
-- Staff 6: Hair Spa (1), Body Massage (4), Manicure/Pedicure (5)
INSERT INTO staff_services (staff_id, service_id) VALUES (6, 1), (6, 4), (6, 5) ON CONFLICT DO NOTHING;

-- Booking Items Table (Support Multi-Service / Merged Bookings)
CREATE TABLE IF NOT EXISTS booking_items (
    id SERIAL PRIMARY KEY,
    booking_id INT REFERENCES bookings(id) ON DELETE CASCADE,
    service_id INT REFERENCES services(id) ON DELETE SET NULL,
    staff_name VARCHAR(100) DEFAULT 'Bebas / Any Staff',
    booking_datetime TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Migrate existing bookings to booking_items if missing
INSERT INTO booking_items (booking_id, service_id, staff_name, booking_datetime)
SELECT b.id, b.service_id, b.staff_name, b.booking_datetime
FROM bookings b
WHERE NOT EXISTS (SELECT 1 FROM booking_items WHERE booking_id = b.id)
  AND b.service_id IS NOT NULL;
