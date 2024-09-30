
// if uploads folder is not present, create it
const fs = require('fs');
const path = require('path');
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

const sanitizeFilename = require('sanitize-filename');

const multer = require('multer');
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, `${Date.now()}_${sanitizeFilename(file.originalname)}`);
    }
});

const upload = multer({ storage: storage });

module.exports = upload;