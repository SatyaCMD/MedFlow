import { Router, Request, Response } from 'express';
import multer from 'multer';
import { uploadKycDocumentToS3 } from '../../lib/s3Client.js';
import { logger } from '../../lib/logger.js';
import { KycController } from './kyc.controller.js';

const router = Router();
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 }, // Max 15MB file size limit for KYC documents
});

// Standard REST CRUD endpoints for KYC records
router.post('/', KycController.createKyc);
router.get('/', KycController.getAllKycs);

// POST /api/v1/kyc/upload - Upload identity KYC document to AWS S3 Bucket
router.post('/upload', upload.single('file'), async (req: Request, res: Response) => {
  try {
    const { docType, idNumber, userId, userName, userRole, userEmail } = req.body;
    const file = req.file as Express.Multer.File | undefined;

    if (!file && !req.body.fileBase64) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'FILE_MISSING',
          message: 'Please provide a valid KYC document file (PDF/JPG/PNG).',
        },
      });
    }

    let buffer: Buffer;
    let originalName: string;
    let mimeType: string;

    if (file) {
      buffer = file.buffer;
      originalName = file.originalname;
      mimeType = file.mimetype;
    } else {
      const base64Data = req.body.fileBase64.replace(/^data:.*;base64,/, '');
      buffer = Buffer.from(base64Data, 'base64');
      originalName = req.body.fileName || 'kyc_document.pdf';
      mimeType = req.body.fileType || 'application/pdf';
    }

    logger.info(
      { userName, userRole, userId, docType, idNumber, originalName },
      'Processing user KYC document upload request for AWS S3...'
    );

    const uploadResult = await uploadKycDocumentToS3({
      userId,
      userName,
      userRole,
      userEmail,
      docType: docType || 'Aadhaar Card',
      idNumber: idNumber || 'N/A',
      originalName,
      mimeType,
      buffer,
    });

    return res.status(200).json({
      success: true,
      data: {
        bucket: uploadResult.bucket,
        s3Key: uploadResult.s3Key,
        s3Url: uploadResult.s3Url,
        userFolder: uploadResult.userFolder,
        kmsEncrypted: uploadResult.kmsEncrypted,
        uploadedAt: new Date().toISOString(),
        message: uploadResult.message,
      },
    });
  } catch (error: unknown) {
    const err = error as Error;
    logger.error({ error: err.message }, 'Failed to process KYC document upload');
    return res.status(500).json({
      success: false,
      error: {
        code: 'UPLOAD_FAILED',
        message: err.message || 'Internal server error while processing KYC document.',
      },
    });
  }
});

// Parameterized ID routes
router.get('/:id', KycController.getKycById);
router.put('/:id', KycController.updateKyc);
router.delete('/:id', KycController.deleteKyc);

export default router;
