const { S3Client, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');

const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

const BUCKET_NAME = process.env.R2_BUCKET_NAME;
const PUBLIC_URL = process.env.R2_PUBLIC_URL;

async function uploadPdfToR2(buffer, originalName) {
  const safeName = originalName.replace(/[^a-zA-Z0-9.-]+/g, '_');
  const key = `pdfs/${Date.now()}-${safeName}`;

  await r2Client.send(
    new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: 'application/pdf',
    })
  );

  return {
    key,
    publicUrl: `${PUBLIC_URL}/${key}`,
  };
}

async function deletePdfFromR2(pdfUrl) {
  // pdfUrl looks like `${PUBLIC_URL}/pdfs/169...-file.pdf` — extract the key.
  if (!pdfUrl || !pdfUrl.startsWith(PUBLIC_URL)) {
    return;
  }

  const key = pdfUrl.slice(PUBLIC_URL.length + 1);

  await r2Client.send(
    new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    })
  );
}

module.exports = { uploadPdfToR2, deletePdfFromR2 };