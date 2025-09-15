const express = require('express');
const { resetAndSeed } = require('../db/seed');
const router = express.Router();

/**
 * @swagger
 * /api/system/reset:
 *   post:
 *     summary: Reset and seed the database and file storage
 *     tags: [System]
 *     description: >
 *       Deletes all data from all tables in the PostgreSQL database,
 *       removes all files from the Minio bucket, and then runs the seed script
 *       to repopulate the database with initial data.
 *     responses:
 *       '200':
 *         description: The database and storage were successfully reset and seeded.
 *       '500':
 *         description: An error occurred during the reset and seed process.
 */
router.get('/reset', async (req, res) => {
    try {
        console.log('API call to /reset received. Starting reset and seed process...');
        await resetAndSeed();
        res.status(200).json({ message: 'Database and storage have been reset and seeded successfully.' });
    } catch (error) {
        console.error('Failed to reset and seed:', error);
        res.status(500).json({ message: 'Failed to reset and seed database and storage.', error: error.message });
    }
});

module.exports = router;
