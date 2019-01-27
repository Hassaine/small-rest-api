const express = require('express');
const bodyparser = require('body-parser');
const router = express.Router();
const cors = require('cors');
const fs = require('fs');

const port = 4200;
let configuration = {};
const configFile = fs.readFileSync(process.argv[2]);

configuration = JSON.parse(configFile);
console.log(configuration);

//setting mysql connection
const mysql = require('mysql');
const connection = mysql.createConnection(configuration.connection.config);

//stting the cors module
let whitelist = ['http://localhost:3000'];
const corsOptions = {
  origin: function(origin, callback) {
    let originIsWhitelisted = whitelist.indexOf(origin) !== -1;
    callback(null, originIsWhitelisted);
  },
  credentials: true
};
router.use(cors(corsOptions));
router.use(bodyparser());

//for each database table
configuration.db.tables.forEach(element => {
  router
    .route(element.rooter)
    .get((req, res, next) => {
      connection.query('SELECT * from ' + element.name, function(
        error,
        results,
        fields
      ) {
        if (error) throw error;
        res.status(200);
        res.send(results);
      });
    })
    .post((req, res) => {
      let colonnesName = ''; //for the sql  insert query  colonne name
      let colonnesSeparation = ''; // for the sql  insert query  "?"
      let colonnes = []; // for the request.body the json object in POST
      element.schema.forEach(elmnt => {
        colonnes.push(req.body[elmnt]);
        colonnesName += elmnt + ',';
        colonnesSeparation += '?,';
      });
      colonnesName = colonnesName.substring(0, colonnesName.length - 1);
      colonnesSeparation = colonnesSeparation.substring(
        0,
        colonnesSeparation.length - 1
      );
      // console.log(colonnesName);

      connection.query(
        'insert into ' +
          element.name +
          ' (' +
          colonnesName +
          ') values (' +
          colonnesSeparation +
          ')',
        colonnes,
        function(error, results, fields) {
          if (error) throw error;
          res.status(200);
          res.send(req.body);
        }
      );
    });

  router
    .route(element.rooter + '/:id')
    .get((req, res) => {
      const id = req.params['id'];

      connection.query(
        'SELECT * from ' + element.name + ' where ' + element.id + '=?',
        [id],
        function(error, results, fields) {
          if (error) throw error;
          res.status(200);
          res.send(results[0]);
        }
      );
    })
    .delete((req, res) => {
      const id = req.params['id'];
      connection.query(
        'delete  from ' + element.name + ' where ' + element.id + '=?',
        [id],
        function(error, results, fields) {
          if (error) throw error;
          res.status(200);
          res.send({
            status: 'item deleted',
            items: results[0]
          });
        }
      );
    })
    .put((req, res) => {
      const id = req.params['id'];
      let colonnesName = ''; //for the sql  update query  colonne name
      let colonnes = []; // for the request.body the json object in POST
      element.schema.forEach(elmnt => {
        colonnes.push(req.body[elmnt]);
        colonnesName += elmnt + '=?,';
      });
      colonnesName = colonnesName.substring(0, colonnesName.length - 1);
      colonnes.push(id);

      connection.query(
        'update ' + element.name + '  set ' + colonnesName + ' where  id=?',
        colonnes,
        function(error, results, fields) {
          if (error) {
            throw error;
          }
          res.status(200);
          res.send(req.body);
        }
      );
    });
});

//creat an express app
const app = express();
app.use('/', router);

if (configuration.connection.protocol.name == 'https') {
  const https = require('https');
  //the key and certification for the https
  const options = {
    key: fs.readFileSync(configuration.connection.protocol.option.keyPath),
    cert: fs.readFileSync(configuration.connection.protocol.option.certPath)
  };

  https.createServer(options, app).listen(port, err => {
    if (err) throw err;
    console.log('connected at https://127.0.0.1:' + port);
  });
} else {
  app.listen(port, err => {
    if (err) throw err;
    console.log('connected at http://127.0.0.1:' + port);
  });
}
