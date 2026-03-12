const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Sale = sequelize.define('Sale', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    billNumber: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    customerName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    customerContact: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: '',
    },
    items: {
        type: DataTypes.TEXT('long'),
        allowNull: false,
        defaultValue: '[]',
        get() {
            const raw = this.getDataValue('items');
            try { return JSON.parse(raw); } catch (e) { return []; }
        },
        set(val) {
            this.setDataValue('items', JSON.stringify(val));
        },
    },
    subtotal: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0,
    },
    itemDiscountTotal: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0,
    },
    billDiscount: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0,
    },
    billDiscountAmount: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0,
    },
    grandTotal: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0,
    },
    soldAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
}, {
    timestamps: true,
});

module.exports = Sale;
