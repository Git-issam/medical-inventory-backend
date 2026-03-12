const axios = require('axios');

async function testStatsEndpoint() {
    try {
        // Login first
        console.log('Logging in...');
        const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
            email: 'test@test.com',
            password: 'test123'
        });
        const token = loginRes.data.token;
        console.log('✅ Login successful');

        // Test stats endpoint
        console.log('\nTesting /api/medicines/stats...');
        const statsRes = await axios.get('http://localhost:5000/api/medicines/stats', {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('✅ Stats endpoint working!');
        console.log('Stats:', statsRes.data);

        // Test get all medicines
        console.log('\nTesting /api/medicines...');
        const medicinesRes = await axios.get('http://localhost:5000/api/medicines', {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('✅ Medicines endpoint working!');
        console.log(`Found ${medicinesRes.data.length} medicines`);

    } catch (error) {
        console.error('\n❌ ERROR:', error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('URL:', error.config.url);
            console.error('Data:', error.response.data);
        }
    }
}

testStatsEndpoint();
