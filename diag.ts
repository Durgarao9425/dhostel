import db from './backend/src/config/database.js';
async function run() {
    try {
        const students = await db('students').where('status', 1).count('* as count');
        console.log('Active students count:', students[0].count);
        const firstStudent = await db('students').where('status', 1).first();
        console.log('First student:', JSON.stringify(firstStudent));
    } catch (err) {
        console.error('Error:', err);
    } finally {
        process.exit();
    }
}
run();
