const sequelize = require('./config/database');
const { QueryTypes } = require('sequelize');

async function migrateDatabase() {
    try {
        console.log('Starting database migration...');

        // Check if old columns exist
        const [columns] = await sequelize.query(
            `SHOW COLUMNS FROM Medicines`,
            { type: QueryTypes.SELECT }
        );

        console.log('Current columns:', columns);

        // Rename columns if they exist with old names
        const columnNames = columns.map(col => col.Field);

        if (columnNames.includes('stockAvailable') && !columnNames.includes('stock')) {
            console.log('Renaming stockAvailable to stock...');
            await sequelize.query('ALTER TABLE Medicines CHANGE stockAvailable stock INT NOT NULL DEFAULT 0');
        }

        if (columnNames.includes('supplierName') && !columnNames.includes('supplier')) {
            console.log('Renaming supplierName to supplier...');
            await sequelize.query('ALTER TABLE Medicines CHANGE supplierName supplier VARCHAR(255) NOT NULL');
        }

        if (columnNames.includes('expiryDate') && !columnNames.includes('expiry')) {
            console.log('Renaming expiryDate to expiry...');
            await sequelize.query('ALTER TABLE Medicines CHANGE expiryDate expiry DATE NOT NULL');
        }

        console.log('Migration completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

migrateDatabase();
