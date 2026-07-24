const multer = require('multer');
const path = require('path');
const { AppError } = require('./errorHandler');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = 'uploads';

    if (file.fieldname === 'profile_image' || file.fieldname === 'profile') {
      uploadPath = 'uploads/profiles';
    } else if (file.fieldname === 'cv' || file.fieldname === 'resume') {
      uploadPath = 'uploads/cv';
    } else if (file.fieldname === 'logo' || file.fieldname === 'company_logo') {
      uploadPath = 'uploads/logos';
    }

    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const imageFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new AppError('Only image files are allowed (jpg, png, gif, webp).', 400), false);
  }
};

const pdfFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new AppError('Only PDF files are allowed.', 400), false);
  }
};

const profileStorage = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: imageFilter,
});

const cvStorage = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: pdfFilter,
});

const logoStorage = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: imageFilter,
});

const uploadProfile = (req, res, next) => {
  const upload = profileStorage.single('profile_image');
  upload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return next(new AppError('Image file size must be less than 5MB.', 400));
      }
      return next(new AppError(err.message, 400));
    }
    if (err) {
      return next(err);
    }
    next();
  });
};

const uploadCV = (req, res, next) => {
  const upload = cvStorage.single('cv');
  upload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return next(new AppError('CV file size must be less than 10MB.', 400));
      }
      return next(new AppError(err.message, 400));
    }
    if (err) {
      return next(err);
    }
    next();
  });
};

const uploadLogo = (req, res, next) => {
  const upload = logoStorage.single('logo');
  upload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return next(new AppError('Logo file size must be less than 5MB.', 400));
      }
      return next(new AppError(err.message, 400));
    }
    if (err) {
      return next(err);
    }
    next();
  });
};

module.exports = { uploadProfile, uploadCV, uploadLogo };
