const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

async function testUpdate() {
    try {
        // First, login to get token
        console.log('Logging in...');
        const loginResponse = await axios.post(`${API_URL}/auth/login`, {
            email: 'test@example.com',
            password: 'password123'
        });

        const token = loginResponse.data.token;
        console.log('✅ Login successful!');

        // Add a test medicine
        console.log('\nAdding test medicine...');
        const addResponse = await axios.post(
            `${API_URL}/medicines`,
            {
                name: 'Test Medicine',
                stock: 50,
                totalStock: 50,
                batchNo: 'TEST001',
                supplier: 'Test Supplier',
                expiry: '2025-12-31'
            },
            {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            }
        );
        console.log('✅ Medicine added:', addResponse.data);
        const medicineId = addResponse.data.id;

        // Update the medicine
        console.log('\nUpdating medicine...');
        const updateResponse = await axios.put(
            `${API_URL}/medicines/${medicineId}`,
            {
                name: 'Updated Test Medicine',
                stock: 75,
                totalStock: 100,
                batchNo: 'TEST001-UPDATED',
                supplier: 'Updated Supplier',
                expiry: '2026-06-30'
            },
            {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            }
        );
        console.log('✅ Medicine updated:', updateResponse.data);

        // Get the medicine to verify
        console.log('\nFetching updated medicine...');
        const getResponse = await axios.get(
            `${API_URL}/medicines/${medicineId}`,
            {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            }
        );
        console.log('✅ Updated medicine data:', getResponse.data);

        console.log('\n✅ All tests passed!');
    } catch (error) {
        console.error('\n❌ Error:', error.response?.data || error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        }
    }
}

testUpdate();
