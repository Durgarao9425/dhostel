
import db from './src/config/database.js';

async function check() {
    try {
        const rooms = await db('rooms').count('* as count').first();
        const students = await db('students').where('status', 1).count('* as count').first();
        const roomTypes = await db('room_types').select('*');
        const actualRooms = await db('rooms').select('*');

        console.log('--- DB Check ---');
        console.log('Total Rooms:', rooms?.count);
        console.log('Active Students:', students?.count);
        console.log('Room Types:', roomTypes.length);
        console.log('Room Types Names:', roomTypes.map(rt => rt.room_type_name));
        console.log('Rooms Sample:', actualRooms.slice(0, 3).map(r => ({ id: r.room_id, type_id: r.room_type_id })));

        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

check();
