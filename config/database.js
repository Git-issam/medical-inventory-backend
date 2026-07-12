const Sequelize = require('sequelize');

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASS,
    {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT || 3306,
        dialect: 'mysql',
        logging: false, // set to console.log to see SQL queries
        pool: {
            max: 10,
            min: 0,
            acquire: 30000, // max ms to wait for a connection before throwing error
            idle: 10000,    // max ms a connection can be idle before being released
        },
        dialectOptions: {
            connectTimeout: 30000, // 30s connection timeout
        },
    }
);

module.exports = sequelize;
