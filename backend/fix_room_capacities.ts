import db from './src/config/database.js';

async function cleanup() {
    try {
        const rooms = await db('rooms').where('capacity', 0).orWhereNull('capacity');
        console.log(`Updating ${rooms.length} rooms...`);

        for (const room of rooms) {
            const rtype = await db('room_types').where('room_type_id', room.room_type_id).first();
            if (rtype) {
                let cap = 1;
                const name = rtype.room_type_name.toLowerCase();

                // Simple heuristic for capacity
                if (name.includes('double')) cap = 2;
                else if (name.includes('triple')) cap = 3;
                else if (name.includes('four')) cap = 4;
                else if (name.includes('five')) cap = 5;
                else if (name.includes('six')) cap = 6;
                else if (name.includes('ten') || name.includes('dorm')) cap = 10;
                else {
                    const numMatch = rtype.room_type_name.match(/(\d+)/);
                    if (numMatch) cap = parseInt(numMatch[1]);
                }

                await db('rooms').where('room_id', room.room_id).update({ capacity: cap });
                console.log(`Updated room ${room.room_number} (ID: ${room.room_id}) to capacity ${cap}`);
            }
        }
        console.log('Cleanup complete.');
        process.exit(0);
    } catch (err) {
        console.error('Cleanup error:', err);
        process.exit(1);
    }
}

cleanup();
