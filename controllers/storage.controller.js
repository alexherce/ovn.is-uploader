const {Storage} = require('@google-cloud/storage');
const path = require('path');
const Multer = require('multer');
const shortid = require('shortid');

const CLOUD_BUCKET = process.env.CLOUD_BUCKET;

const storage = new Storage({
  projectId: process.env.GCLOUD_PROJECT,
  keyFilename: path.join(__dirname,'keys','ovnis.json')
});

const bucket = storage.bucket(CLOUD_BUCKET);

function getPublicUrl(filename) {
  return `https://i.ovn.is/${filename}`
}

function getExtension(fileName) {
  let ext = fileName.slice((fileName.lastIndexOf(".") - 1 >>> 0) + 2);
  if (ext != "") {
    return '.' + ext;
  } else {
    return ext;
  }
}

// ----------------------------
// EXPORTS
// ----------------------------

exports.multer = Multer({
  storage: Multer.MemoryStorage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10 MB
  },
  fileFilter: function (req, file, cb) {
    console.log(file.mimetype);
    var filetypes = /jpeg|jpg|png|gif|bmp/;
    var mimetype = filetypes.test(file.mimetype);
    var extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
      return cb(null, true);
    }

    return cb("invalid_file_type");
  }
});

exports.upload = function(req, res, next) {
  if (!req.file) {
    return res.status(400).send({success: false, error: 'missing_parameters'});
  }

  req.setTimeout(180000);

  const gcsname = shortid.generate() + getExtension(req.file.originalname);
  const file = bucket.file(gcsname);

  const stream = file.createWriteStream({
    metadata: {
      contentType: req.file.mimetype
    }
  });

  stream.on('error', (err) => {
    req.file.cloudStorageError = err;
    return res.status(400).send({success: false, error: 'upload_error', name: err});
  })

  stream.on('finish', () => {
    req.file.cloudStorageObject = gcsname;
    file.makePublic().then(() => {
      req.file.cloudStoragePublicUrl = getPublicUrl(gcsname);
      return res.status(200).send({success: true, url: req.file.cloudStoragePublicUrl});
    });
  });

  stream.end(req.file.buffer);
}
