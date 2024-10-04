const multer = require("multer");
const path = require('path');
const express = require ("express");
const app = express ();



app.use(express.static(path.join(__dirname, 'public')))


const storage = multer.diskStorage({

    destination: (req, file, cb) => {
        cb(null, 'public/profilepic'); // images e path ta hbe 
    },
    filename: (req, file, cb) => {
        cb(null,Date.now()+'profile' 
        + path.extname(file.originalname))
      },
    
    
});

const fileFilter = (req, file, cb) => {

    const allowedMimes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
      ];
    
      if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        return cb(new Error("Invalid file type."), false );
      }

}

const maxSize = 5 * 1024 * 1024;

const upload  = multer({ storage: storage, fileFilter: fileFilter});





const storageCsv = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/json'); // Replace with your upload directory
  },
  filename: function (req, file, cb) {
    // Generate a random filename
    const randomName = Math.random().toString(36).substring(7);
    const ext = file.originalname.split('.').pop();
    const newFilename = `${randomName}.${ext}`;

    cb(null, newFilename);
  },
});

const uploadCsvMiddleware = multer({
  storage: storageCsv,
}).single('update-json-question'); // 'image' should match your field name

module.exports = {
  upload,
  uploadCsvMiddleware,
};