import dotenv from 'dotenv';
dotenv.config({ path: './backend/.env' });

import db from './backend/src/config/database.ts';

async function diagnose() {
    try {
        console.log('--- LATEST 5 STUDENTS ---');
        const students = await db('students')
            .leftJoin('rooms as r', 'students.room_id', 'r.room_id')
            .select('students.*', 'r.room_number')
            .orderBy('students.created_at', 'desc')
            .limit(5);

        students.forEach(s => {
            console.log(`ID: ${s.student_id}, Name: ${s.first_name} ${s.last_name}, Hostel: ${s.hostel_id}, Status: ${s.status}, Room: ${s.room_number}, Admission: ${s.admission_date}, Created: ${s.created_at}`);
        });

        console.log('\n--- MONTHLY FEES TABLE STATUS ---');
        const [tableCheck] = await db.raw(`
      SELECT COUNT(*) as count 
      FROM information_schema.tables 
      WHERE table_schema = DATABASE() 
      AND table_name = 'monthly_fees'
    `);
        console.log('monthly_fees table exists:', tableCheck[0]?.count > 0);

        if (tableCheck[0]?.count > 0) {
            console.log('\n--- LATEST 5 FEE RECORDS ---');
            const fees = await db('monthly_fees').orderBy('created_at', 'desc').limit(5);
            fees.forEach(f => {
                console.log(`ID: ${f.fee_id}, Student: ${f.student_id}, Month: ${f.fee_month}, Due: ${f.total_due}, Status: ${f.fee_status}`);
            });
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

diagnose();
