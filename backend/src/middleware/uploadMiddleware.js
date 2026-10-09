const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directories exist
const uploadDir = path.join(__dirname, '../../uploads');
const paymentProofDir = path.join(uploadDir, 'payment_proofs');
const qrisDir = path.join(uploadDir, 'qris');
const outletDir = path.join(uploadDir, 'outlets');
const servicesDir = path.join(uploadDir, 'services');

[uploadDir, paymentProofDir, qrisDir, outletDir, servicesDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === 'qris_image') {
      cb(null, qrisDir);
    } else if (file.fieldname === 'outlet_image') {
      cb(null, outletDir);
    } else if (file.fieldname === 'service_image' || file.fieldname === 'image') {
      cb(null, servicesDir);
    } else {
      cb(null, paymentProofDir);
    }
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Hanya file gambar (jpg, png, webp, gif) yang diperbolehkan!'));
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter
});

module.exports = upload;
