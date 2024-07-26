const { Sequelize } = require('sequelize');

const pgEndpoint = process.env.PG_ENDPOINT;
const dbUser = process.env.DB_USERNAME;
const dbPassword = process.env.DB_PASSWORD;

const sequelize = new Sequelize(`postgres://${dbUser}:${dbPassword}@${pgEndpoint}/mydatabase`, {
  dialect: 'postgres'
});

module.exports = sequelize;
