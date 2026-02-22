const knex = require('knex');
const config = {
    client: 'sqlite3',
    connection: {
        filename: './hostel.db'
    },
    useNullAsDefault: true
};
const db = knex(config);

async function checkTables() {
    try {
        const tables = await db.raw("SELECT name FROM sqlite_master WHERE type='table'");
        console.log('Tables:', tables.map(t => t.name).join(', '));

        // Check columns of monthly_fees if it exists
        const hasMonthlyFees = tables.some(t => t.name === 'monthly_fees');
        if (hasMonthlyFees) {
            const columns = await db.raw("PRAGMA table_info(monthly_fees)");
            console.log('monthly_fees columns:', columns.map(c => c.name).join(', '));
        }

        const hasFeePayments = tables.some(t => t.name === 'fee_payments');
        if (hasFeePayments) {
            const columns = await db.raw("PRAGMA table_info(fee_payments)");
            console.log('fee_payments columns:', columns.map(c => c.name).join(', '));
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await db.destroy();
    }
}

checkTables();
