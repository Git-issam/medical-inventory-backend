const axios = require('axios');

async function quickTest() {
    try {
        // Test 1: Check if server is running
        console.log('1. Testing server health...');
        const healthCheck = await axios.get('http://localhost:5000/');
        console.log('✅ Server is running:', healthCheck.data);

        // Test 2: Try to register a user
        console.log('\n2. Registering test user...');
        try {
            await axios.post('http://localhost:5000/api/auth/register', {
                username: 'testuser',
                email: 'test@test.com',
                password: 'test123'
            });
            console.log('✅ User registered');
        } catch (err) {
            if (err.response?.status === 400) {
                console.log('ℹ️  User already exists (this is fine)');
            } else {
                throw err;
            }
        }

        // Test 3: Login
        console.log('\n3. Logging in...');
        const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
            email: 'test@test.com',
            password: 'test123'
        });
        const token = loginRes.data.token;
        console.log('✅ Login successful, token received');

        // Test 4: Get medicines
        console.log('\n4. Fetching medicines...');
        const medicinesRes = await axios.get('http://localhost:5000/api/medicines', {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log(`✅ Medicines fetched: ${medicinesRes.data.length} found`);
        console.log('Medicines:', medicinesRes.data);

        // Test 5: Add a medicine
        console.log('\n5. Adding a test medicine...');
        const addRes = await axios.post('http://localhost:5000/api/medicines', {
            name: 'Paracetamol',
            stock: 100,
            totalStock: 100,
            batchNo: 'BATCH001',
            supplier: 'Test Supplier',
            expiry: '2025-12-31'
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('✅ Medicine added:', addRes.data);

        console.log('\n✅✅✅ ALL TESTS PASSED! ✅✅✅');
        console.log('\nNow refresh your browser and check the dashboard!');

    } catch (error) {
        console.error('\n❌ ERROR:', error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        }
    }
}

quickTest();
