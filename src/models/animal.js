const { DataTypes } = require('sequelize');

const sequelize = require('../utils/database');

const Animal = sequelize.define('Animal', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    notEmpty: true,
  },
  age: {
    type: DataTypes.INTEGER,
    allowNull: false,
    notEmpty: true,
  },
  breed: {
    type: DataTypes.STRING,
    allowNull: false,
    notEmpty: true,
  },
  specie: {
    type: DataTypes.ENUM,
    values: ['cat', 'dog'],
    allowNull: false,
    notEmpty: true,
  },
  imageUrl: {
    type: DataTypes.STRING,
    allowNull: false,
    isUrl: {
      msg: 'The image needs to be a valid url.',
    },
    notEmpty: true,
  },
  gender: {
    type: DataTypes.ENUM,
    values: ['male', 'female'],
    allowNull: false,
    notEmpty: true,
  },
  vaccinated: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    notEmpty: true,
  },
  description: {
    type: DataTypes.STRING,
    allowNull: false,
    notEmpty: true,
  },
  adopted: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    notEmpty: true,
  },
});

Animal.canAdopt = (wage) => {
  let adopt;
  if ('dog'.localeCompare(this.specie)) {
    adopt = wage >= 2000;
  } else if ('cat'.localeCompare(this.specie)) {
    adopt = wage >= 1700;
  }

  return adopt;
};

module.exports = Animal;
