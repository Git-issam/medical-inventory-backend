const axios = require('axios');

(async () => {
    const BASE_URL = 'http://localhost:5000/api';
    const email = `testuser_${Date.now()}@example.com`;
    const password = 'password123';
    let token;

    try {
        // 1. Register
        console.log(`\n[1] Registering user: ${email}`);
        try {
            const regRes = await axios.post(`${BASE_URL}/auth/register`, {
                fullName: 'Test User',
                email,
                password
            });
            console.log('Status:', regRes.status);
            console.log('Body:', regRes.data);
        } catch (e) {
            console.log('Register failed (likely expected if user exists or server down):', e.response?.data || e.message);
            // If server is down, stop
            if (e.code === 'ECONNREFUSED') {
                console.error('Server is not running!');
                process.exit(1);
            }
        }

        // 2. Login
        console.log(`\n[2] Logging in`);
        try {
            const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
                email,
                password
            });
            console.log('Login Status:', loginRes.status);
            token = loginRes.data.token;
            console.log('Token received.');
        } catch (e) {
            console.error('Login failed:', e.response?.data || e.message);
            process.exit(1);
        }

        // 3. Add Medicine
        console.log(`\n[3] Adding Medicine`);
        try {
            const medRes = await axios.post(`${BASE_URL}/medicines`, {
                name: 'Paracetamol',
                stockAvailable: 50,
                totalStock: 100,
                batchNo: 'B1001',
                supplierName: 'Pharma Inc',
                expiryDate: '2027-01-01'
            }, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            console.log('Status:', medRes.status);
            console.log('Body:', medRes.data);
        } catch (e) {
            console.error('Add Medicine failed:', e.response?.data || e.message);
        }

        // 4. Get Stats
        console.log(`\n[4] Getting Stats`);
        try {
            const statsRes = await axios.get(`${BASE_URL}/medicines/stats`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            console.log('Status:', statsRes.status);
            console.log('Body:', statsRes.data);
        } catch (e) {
            console.error('Get Stats failed:', e.response?.data || e.message);
        }

    } catch (err) {
        console.error('Test script error:', err.message);
    }
})();
