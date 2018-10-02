var multer  = require('multer');
var upload = multer({ dest: 'uploads/' });

module.exports = (app) => {
  app.post('/file', upload.single('content'), (/* req, res */) => {
    
  });
  app.get('/file', (/* req, res */) => {
    
  });
};