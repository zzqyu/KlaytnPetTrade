const express = require('express');
const multer = require('multer');
const path = require('path');
const cors = require('cors');
const cv = require("opencv");
const app = express();

app.use(express.static('./public'));
app.use(cors());


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.resolve('public/uploads'));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + (path.extname(file.originalname).toLowerCase()));
  }
});

const storage2 = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.resolve('public/temp'));
  },
  filename: function (req, file, cb) {
    cb(null, 'tmp'+(path.extname(file.originalname).toLowerCase()));
  }
});

const upload = multer({storage: storage});
const upload2 = multer({ storage: storage2 });

app.post('/imgUpload', upload.single('img'), function(req, res, next) {
  res.send({
    err: null,
    filePath: 'uploads/' + path.basename(req.file.path),
    hash: path.basename(req.file.path).split('.')[0]
  });
  
});
app.post('/imgCmp', upload2.single('img'), function(req, res, next) {
  
  console.log('hash: '+req.body.hash);
  console.log('__dirname: '+__dirname);
  
  cv.readImage(__dirname + '/public/temp/tmp.jpg', function (err, img1) {
    if (err) throw err;

    cv.readImage(__dirname + '/public/uploads/'+req.body.hash+'.jpg', function(err, img2) {
      if (err) throw err;

      cv.ImageSimilarity(img1, img2, function (err, dissimilarity) {
        if (err) throw err;
        console.log('Dissimilarity: ', dissimilarity);
        res.send({
          err: null,
          filePath: 'temp/' + path.basename(req.file.path),
          hash: path.basename(req.file.path).split('.')[0],
          Dissimilarity: dissimilarity
        });
      });
    });
  });
  
});

app.listen(3000, function () {
  console.log("app is listening");
});