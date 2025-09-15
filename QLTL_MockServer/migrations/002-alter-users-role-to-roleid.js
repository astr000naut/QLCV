const { pool } = require('../db/postgres');

const runMigration = async () => {
    const client = await pool.connect();
    console.log('Connected to the database for role migration.');

    try {
        console.log('Starting role migration: users.role -> users.role_id');
        await client.query('BEGIN');

        // 1. Add role_id column to users table
        console.log('Step 1: Adding "role_id" column to "users" table...');
        await client.query('ALTER TABLE users ADD COLUMN role_id INT');

        // 2. Populate the new role_id column based on the existing role names
        console.log('Step 2: Populating "role_id" from existing role names...');
        await client.query(`
            UPDATE users u SET role_id = (SELECT id FROM roles r WHERE r.name = u.role)
        `);

        // 3. Add a foreign key constraint
        console.log('Step 3: Adding foreign key constraint to "role_id"...');
        await client.query(`
            ALTER TABLE users 
            ADD CONSTRAINT fk_roles
            FOREIGN KEY(role_id) 
            REFERENCES roles(id)
            ON DELETE SET NULL
        `);

        // 4. Drop the old role column
        console.log('Step 4: Dropping old "role" column...');
        await client.query('ALTER TABLE users DROP COLUMN role');
        
        console.log('Columns migrated successfully.');

        await client.query('COMMIT');
        console.log('Role migration completed successfully!');
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Migration failed:', error);
        throw error;
    } finally {
        await client.release();
        console.log('Database client released.');
    }
};

const main = async () => {
    try {
        await runMigration();
    } catch (error) {
        console.error('Script failed:', error);
    } finally {
        await pool.end();
        console.log('Database pool closed.');
    }
};

main();

