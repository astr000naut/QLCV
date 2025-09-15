const { pool } = require('../db/postgres');

const newPermissions = [
    { id: "reports:overview", name: "Báo cáo tổng quan" },
    { id: "reports:performance", name: "Báo cáo hiệu suất xử lý tài liệu" },
    { id: "reports:count", name: "Báo cáo số lượng tài liệu" },
    { id: "documents:list", name: "Xem danh sách tài liệu" },
    { id: "documents:upload", name: "Tải lên tài liệu" },
    { id: "documents:edit", name: "Chỉnh sửa tài liệu" },
    { id: "documents:approve", name: "Phê duyệt tài liệu" },
    { id: "documents:delete", name: "Xóa tài liệu" },
    { id: "admin:users:manage", name: "Quản lý người dùng" },
    { id: "admin:settings", name: "Cài đặt" }
];

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

