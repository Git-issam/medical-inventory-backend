const Sequelize = require('sequelize');

let sequelize;

if (process.env.MYSQL_URL) {
    // Railway provides MYSQL_URL - use it directly
    sequelize = new Sequelize(process.env.MYSQL_URL, {
        dialect: 'mysql',
        logging: false,
        pool: {
            max: 10,
            min: 0,
            acquire: 60000,
            idle: 10000,
        },
        dialectOptions: {
            connectTimeout: 60000,
        },
    });
} else {
    // Local development - use individual params
    sequelize = new Sequelize(
        process.env.DB_NAME,
        process.env.DB_USER,
        process.env.DB_PASS,
        {
            host: process.env.DB_HOST,
            port: process.env.DB_PORT || 3306,
            dialect: 'mysql',
            logging: false,
            pool: {
                max: 10,
                min: 0,
                acquire: 60000,
                idle: 10000,
            },
            dialectOptions: {
                connectTimeout: 60000,
            },
        }
    );
}

module.exports = sequelize;
