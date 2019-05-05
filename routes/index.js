const express = require('express');
const router = express.Router();

const storage = require('../controllers/storage.controller');

router.get('/', function(req, res, next) {
  return res.status(200).send('Ovnis uploader online!');
});

router.post('/upload', storage.multer.single('file'), storage.upload);

module.exports = router;
