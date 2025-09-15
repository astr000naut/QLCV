const Minio = require('minio');
const config = require('../config');

const minioClient = new Minio.Client(config.minio);

const bucketName = config.minio.bucketName;

// Check if bucket exists, and if not, create it.
minioClient.bucketExists(bucketName, function(err, exists) {
  if (err) {
    return console.log(err);
  }
  if (exists) {
    return console.log('Bucket ' + bucketName + ' already exists.');
  }
  minioClient.makeBucket(bucketName, 'us-east-1', function(err) {
    if (err) return console.log('Error creating bucket.', err);
    console.log('Bucket created successfully in "us-east-1".');

    const policy = {
        "Version": "2012-10-17",
        "Statement": [
            {
                "Effect": "Allow",
                "Principal": {
                    "AWS": [
                        "*"
                    ]
                },
                "Action": [
                    "s3:GetObject"
                ],
                "Resource": [
                    `arn:aws:s3:::${bucketName}/*`
                ]
            }
        ]
    };
    minioClient.setBucketPolicy(bucketName, JSON.stringify(policy), function(err) {
        if (err) return console.log('Error setting bucket policy.', err);
        console.log('Bucket policy set to public read.');
    });
  });
});


module.exports = { minioClient, bucketName };
