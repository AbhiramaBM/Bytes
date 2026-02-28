import multer from 'multer';
import path from 'path';
import fs from 'fs';

const uploadsDir = path.resolve('server', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const safeExt = path.extname(file.originalname).toLowerCase();
    cb(null, `profile-${Date.now()}-${Math.round(Math.random() * 1e9)}${safeExt}`);
  }
});

const fileFilter = (_req, file, cb) => {
  if (!file.mimetype.startsWith('image/')) {
    cb(new Error('Only image files are allowed'));
    return;
  }
  cb(null, true);
};

export const profileUpload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024
  }
});

