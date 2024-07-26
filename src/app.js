// NPM imports
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');

// Project imports
const guardianRoutes = require('./routes/guardian');
const userRoutes = require('./routes/user');
const animalRoutes = require('./routes/animal');
const sequelize = require('./utils/database');
const { createAdminUser, populateMongo, populatePostgres } = require('./utils/utils');

const mgEndpoint = process.env.MG_ENDPOINT;
const dbUser = process.env.DB_USERNAME;
const dbPassword = process.env.DB_PASSWORD;

// Constants
const MONGO_URI = `mongodb://${dbUser}:${dbPassword}@${mgEndpoint}:27017/?replicaSet=rs0&readPreference=secondaryPreferred&retryWrites=false`;

const app = express();

app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Routes
app.use('/admin', userRoutes);
app.use(guardianRoutes);
app.use(animalRoutes);

// Middleware to handle errors.
app.use((error, req, res, next) => {
  // We only handle erros here which are thrown by ourselves, follwing
  // the pattern created by us.
  if (error.status) {
    const response = {};
    response.message = error.message;
    if (error.info) {
      // If the error has more infomation, also show it to the user.
      response.info = error.info;
    }

    res.status(error.status).json(response);
  } else {
    console.log(error);
  }
  next();
});

// Start DB and Server
mongoose
  .connect(MONGO_URI, {
    tls: true,
    tlsCAFile: `/usr/src/app/global-bundle.pem`,
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  })
  .then(() => {
    console.log('MongoDB started.');
    createAdminUser();
    populateMongo();
    sequelize
      .sync()
      .then(() => {
        console.log('PostgreSQL started.');
        app.listen(3001);
      })
      .catch((err) => {
        console.log(err);
      });
    populatePostgres();
  })
  .catch((err) => {
    console.log(err);
  });

module.exports = app;
