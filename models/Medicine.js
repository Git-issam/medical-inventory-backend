//

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
    stock: {
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
    supplier: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    price: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0,
    },
    expiry: {
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
            const expiryDate = new Date(medicine.expiry);

            if (expiryDate < now) {
                medicine.status = 'Expired';
            } else if (medicine.stock <= 10) {
                medicine.status = 'Low Stock';
            } else {
                medicine.status = 'Available';
            }
        }
    }
});

module.exports = Medicine;
