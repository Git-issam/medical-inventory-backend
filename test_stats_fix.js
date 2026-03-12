const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

async function testStats() {
    try {
        // Register a new user first
        const email = 'statstest@example.com';
        const password = 'password123';

        console.log('Registering new user...');
        try {
            await axios.post(`${API_URL}/auth/register`, {
                fullName: 'Stats Test User',
                email: email,
                password: password
            });
            console.log('✅ User registered!\n');
        } catch (e) {
            console.log('User might already exist, proceeding to login...\n');
        }

        // Login to get token
        console.log('Logging in...');
        const loginResponse = await axios.post(`${API_URL}/auth/login`, {
            email: email,
            password: password
        });

        const token = loginResponse.data.token;
        console.log('✅ Login successful!\n');

        // Get all medicines to see their stock levels
        console.log('Fetching all medicines...');
        const medicinesResponse = await axios.get(`${API_URL}/medicines`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        console.log('\n📋 Current Medicines:');
        medicinesResponse.data.forEach(med => {
            console.log(`  - ${med.name}: stock=${med.stock}, status=${med.status}, expiry=${med.expiry}`);
        });

        // Get stats
        console.log('\n📊 Fetching stats...');
        const statsResponse = await axios.get(`${API_URL}/medicines/stats`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        console.log('\n✅ Stats:');
        console.log(`  Total Medicines: ${statsResponse.data.totalMedicines}`);
        console.log(`  Low Stock Items: ${statsResponse.data.lowStock}`);
        console.log(`  Expired Medicines: ${statsResponse.data.expired}`);
        console.log(`  Near Expiry (30 days): ${statsResponse.data.nearExpiry}`);

        // Manually count low stock items (stock <= 10 and not expired)
        const now = new Date();
        const manualLowStockCount = medicinesResponse.data.filter(med => {
            const expiryDate = new Date(med.expiry);
            return med.stock <= 10 && expiryDate > now;
        }).length;

        console.log(`\n🔍 Manual verification: ${manualLowStockCount} medicines with stock <= 10 (excluding expired)`);

        if (manualLowStockCount === statsResponse.data.lowStock) {
            console.log('✅ Low stock count is CORRECT!');
        } else {
            console.log('❌ Low stock count MISMATCH!');
        }

    } catch (error) {
        console.error('\n❌ Error:', error.response?.data || error.message);
    }
}

testStats();
