const sequelize = require('./config/database');

async function addPriceColumn() {
    try {
        await sequelize.query(
            "ALTER TABLE `Medicines` ADD COLUMN IF NOT EXISTS `price` FLOAT NOT NULL DEFAULT 0"
        );
        console.log('✅ Migration done: price column added to Medicines table');
    } catch (error) {
        if (error.message.includes('already exists') || error.message.includes('Duplicate column')) {
            console.log('ℹ️  price column already exists — skipping migration');
        } else {
            console.error('❌ Migration failed:', error.message);
        }
    } finally {
        await sequelize.close();
        process.exit(0);
    }
}

addPriceColumn();
