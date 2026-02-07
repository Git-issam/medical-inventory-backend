const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Medicine = sequelize.define('Medicine', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    stockAvailable: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },
    totalStock: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },
    batchNo: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    supplierName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    expiryDate: {
        type: DataTypes.DATEONLY, // Using DATEONLY for yyyy-mm-dd
        allowNull: false,
    },
    status: {
        type: DataTypes.ENUM('Available', 'Low Stock', 'Expired'),
        defaultValue: 'Available',
    }
}, {
    timestamps: true,
    hooks: {
        beforeSave: (medicine) => {
            const now = new Date();
            // Simple date comparison
            const expiry = new Date(medicine.expiryDate);

            if (expiry < now) {
                medicine.status = 'Expired';
            } else if (medicine.stockAvailable < 10) {
                medicine.status = 'Low Stock';
            } else {
                medicine.status = 'Available';
            }
        }
    }
});

module.exports = Medicine;
