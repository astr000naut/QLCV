const { pool } = require('../db/postgres');

const runMigrations = async () => {
    const client = await pool.connect();
    console.log('Connected to the database.');

    try {
        console.log('Starting database migration...');

        // Check for handlerId column
        const handlerIdCheck = await client.query(`
            SELECT column_name
            FROM information_schema.columns
            WHERE table_name = 'documents' AND column_name = 'handlerid'
        `);

        if (handlerIdCheck.rowCount === 0) {
            console.log('Adding "handlerId" column to "documents" table...');
            await client.query(`
                ALTER TABLE documents
                ADD COLUMN handlerId INT REFERENCES users(id) ON DELETE SET NULL
            `);
            console.log('"handlerId" column added.');
        } else {
            console.log('"handlerId" column already exists.');
        }

        // Check for deadline column
        const deadlineCheck = await client.query(`
            SELECT column_name
            FROM information_schema.columns
            WHERE table_name = 'documents' AND column_name = 'deadline'
        `);

        if (deadlineCheck.rowCount === 0) {
            console.log('Adding "deadline" column to "documents" table...');
            await client.query(`
                ALTER TABLE documents
                ADD COLUMN deadline TIMESTAMPTZ
            `);
            console.log('"deadline" column added.');
        } else {
            console.log('"deadline" column already exists.');
        }

        console.log('Migration completed successfully!');
    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        await client.release();
        console.log('Database client released.');
        await pool.end();
        console.log('Database pool closed.');
    }
};

runMigrations();
