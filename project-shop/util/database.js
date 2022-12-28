const Sequelize = require("sequelize");

const DB_CONFIG = {
    host: "localhost",
    user: "root",
    database: "nodejs_project-shop",
    password: "nodeJS01",
    dialect: 'mysql'
};

const sequelize = new Sequelize(
    DB_CONFIG.database,
    DB_CONFIG.user,
    DB_CONFIG.password,
    {
        dialect: DB_CONFIG.dialect,
        host: DB_CONFIG.host
    }
);

module.exports = sequelize;
