//Quintin d'Hotman de Villiers
const express = require('express');
const bodyParser = require('body-parser');
const router = require('./routes/data');
const path = require('path');

const app = express();
app.use(bodyParser.json());
app.use(express.json());

// Serve static files
//app.use(express.static(path.join(__dirname, 'dist')));

let allowCrossDomain = function(req, res, next) {
  res.header('Access-Control-Allow-Origin', "*");
  res.header('Access-Control-Allow-Headers', "*");
  res.header('Access-Control-Allow-Methods', "*");
  next();
}

app.use(allowCrossDomain);

// Define routes
app.use('/', router);

// Catch-all route for serving app
/*app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});*/

// Start the server
const port = 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});