import db from './src/config/database.js';

async function diagnose() {
    try {
        const now = new Date();
        const currentMonth = '2026-03';

        // Check tables
        const [tableCheck] = await db.raw(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = DATABASE() 
      AND table_name IN ('monthly_fees', 'fee_payments', 'students', 'rooms')
    `);
        console.log('Tables found:', tableCheck.map(t => t.table_name).join(', '));

        const students = await db('students as s')
            .leftJoin('rooms as r', 's.room_id', 'r.room_id')
            .select(
                's.student_id',
                's.first_name',
                's.last_name',
                's.monthly_rent',
                's.room_id',
                's.status',
                'r.room_number',
                'r.rent_per_bed'
            );

        console.log(`Total students in DB: ${students.length}`);

        const activeStudents = students.filter(s => s.status === 1);
        console.log(`Active students: ${activeStudents.length}`);

        const zeroRentActive = activeStudents.filter(s => {
            const rent = s.monthly_rent || s.rent_per_bed || 0;
            return parseFloat(rent) === 0;
        });

        console.log(`Active students with 0 rent (calc): ${zeroRentActive.length}`);
        if (zeroRentActive.length > 0) {
            console.log('Sample zero rent students:', zeroRentActive.slice(0, 5).map(s => `${s.first_name} (Room: ${s.room_number || 'None'})`));
        }

        const noRoomActive = activeStudents.filter(s => !s.room_id);
        console.log(`Active students with NO room assigned: ${noRoomActive.length}`);

        // Check monthly_fees for March
        const marchFees = await db('monthly_fees').where('fee_month', currentMonth);
        console.log(`Existing monthly_fees records for March: ${marchFees.length}`);

        if (marchFees.length > 0) {
            const paidMarch = marchFees.filter(f => f.fee_status === 'Fully Paid' || f.balance <= 0);
            console.log(`March fees already marked as Paid/0 balance: ${paidMarch.length}`);
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

diagnose();
