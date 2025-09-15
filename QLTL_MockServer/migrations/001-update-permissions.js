const { pool } = require('../db/postgres');

const { PERMISSIONS: newPermissions } = require('../constants/permissions');

const updatePermissions = async () => {
    const client = await pool.connect();
    console.log('Connected to the database for permission migration.');

    try {
        console.log('Starting permission migration...');
        await client.query('BEGIN');

        // To be safe, let's delete existing role_permissions associations
        console.log('Deleting existing data from "role_permissions"...');
        await client.query('DELETE FROM role_permissions');

        // Clear all existing permissions from the permissions table
        console.log('Deleting existing data from "permissions"...');
        await client.query('DELETE FROM permissions');

        // Insert the new permissions
        console.log('Inserting new permissions...');
        for (const p of newPermissions) {
            await client.query('INSERT INTO permissions (id, name) VALUES ($1, $2)', [p.id, p.name]);
            console.log(` - Inserted ${p.id}`);
        }
        
        console.log('New permissions inserted successfully.');

        await client.query('COMMIT');
        console.log('Permission migration completed successfully!');
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Migration failed:', error);
    } finally {
        await client.release();
        console.log('Database client released.');
        await pool.end();
        console.log('Database pool closed.');
    }
};

updatePermissions();

