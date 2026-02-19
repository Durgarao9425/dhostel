const mysql = require('mysql2/promise');
require('dotenv').config({ path: './backend/.env' });

async function run() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT || 3306
    });

    try {
        console.log('--- LATEST 5 STUDENTS ---');
        const [students] = await connection.execute('SELECT student_id, first_name, last_name, hostel_id, room_id, status, admission_date, created_at FROM students ORDER BY created_at DESC LIMIT 5');
        console.log(JSON.stringify(students, null, 2));

        console.log('\n--- HOSTEL IDS IN SYSTEM ---');
        const [hostels] = await connection.execute('SELECT hostel_id, hostel_name FROM hostel_master');
        console.log(JSON.stringify(hostels, null, 2));

        console.log('\n--- USERS SYSTEM ---');
        const [users] = await connection.execute('SELECT user_id, full_name, role_id, hostel_id FROM users');
        console.log(JSON.stringify(users, null, 2));

    } catch (err) {
        console.error(err);
    } finally {
        await connection.end();
    }
}

run();
