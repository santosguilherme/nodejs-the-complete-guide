const mysql = require("mysql2");


const pool = mysql.createPool({
    host: "localhost",
    user: "root",
    database: "nodejs_project-shop",
    password: "nodeJS01"
});

module.exports = pool.promise();
