// Script to update all medicine statuses based on the new threshold
const Medicine = require('./models/Medicine');
const sequelize = require('./config/database');

async function updateMedicineStatuses() {
    try {
        await sequelize.authenticate();
        console.log('Database connected successfully');

        // Get all medicines
        const medicines = await Medicine.findAll();
        console.log(`Found ${medicines.length} medicines to update`);

        // Update each medicine (this will trigger the beforeSave hook)
        for (const medicine of medicines) {
            await medicine.save();
            console.log(`Updated: ${medicine.name} - Status: ${medicine.status}`);
        }

        console.log('\nAll medicine statuses updated successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error updating medicine statuses:', error);
        process.exit(1);
    }
}

updateMedicineStatuses();
