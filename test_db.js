const sequelize = require('./config/database');

async function testConnection() {
    try {
        await sequelize.authenticate();
        console.log('✅ Database connection successful!');

        // Try to sync
        await sequelize.sync({ force: true });
        console.log('✅ Database sync successful!');

        process.exit(0);
    } catch (error) {
        console.error('❌ Database error:', error);
        process.exit(1);
    }
}

testConnection();
