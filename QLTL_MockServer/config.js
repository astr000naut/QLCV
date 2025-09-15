module.exports = {
  db: {
    user: process.env.POSTGRES_USER || 'user',
    host: 'localhost',
    database: process.env.POSTGRES_DB || 'qltl_db',
    password: process.env.POSTGRES_PASSWORD || 'password',
    port: 5432,
  },
  minio: {
    endPoint: 'localhost',
    port: 9000,
    useSSL: false,
    accessKey: process.env.MINIO_ROOT_USER || 'minioadmin',
    secretKey: process.env.MINIO_ROOT_PASSWORD || 'minioadmin',
    bucketName: 'documents'
  }
};
