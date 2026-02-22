import db from './src/config/database.js';

async function test() {
    try {
        const res = await db('monthly_fees').limit(1);
        console.log('monthly_fees exists:', res);
    } catch (err) {
        console.error('monthly_fees does NOT exist or error:', err.message);
    } finally {
        await db.destroy();
    }
}

test();
