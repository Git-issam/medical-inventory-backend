const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

// Sample medicines to add
const sampleMedicines = [
    {
        name: 'Dolo 650',
        stock: 75,
        totalStock: 75,
        batchNo: 'B10001D',
        supplier: 'N/A',
        expiry: '2025-12-31'
    },
    {
        name: 'ramoor2.5',
        stock: 50,
        totalStock: 50,
        batchNo: 'BA20016P',
        supplier: 'N/A',
        expiry: '2025-06-30'
    },
    {
        name: 'Paracetamol',
        stock: 100,
        totalStock: 100,
        batchNo: 'B1001',
        supplier: 'N/A',
        expiry: '2025-09-15'
    }
];

async function addSampleData() {
    try {
        // First, login to get token
        console.log('Logging in...');
        const loginResponse = await axios.post(`${API_URL}/auth/login`, {
            email: 'test@example.com',
            password: 'password123'
        });

        const token = loginResponse.data.token;
        console.log('Login successful!');

        // Add medicines
        console.log('\nAdding sample medicines...');
        for (const medicine of sampleMedicines) {
            try {
                const response = await axios.post(
                    `${API_URL}/medicines`,
                    medicine,
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    }
                );
                console.log(`✓ Added: ${medicine.name}`);
            } catch (error) {
                console.log(`✗ Failed to add ${medicine.name}:`, error.response?.data?.message || error.message);
            }
        }

        console.log('\n✅ Sample data added successfully!');
    } catch (error) {
        if (error.response?.status === 401) {
            console.error('\n❌ Login failed. Please create a user account first.');
            console.log('You can register at: http://localhost:3000/register');
        } else {
            console.error('\n❌ Error:', error.response?.data?.message || error.message);
        }
    }
}

addSampleData();
