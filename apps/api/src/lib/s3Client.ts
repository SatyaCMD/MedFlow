import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { env } from '../config/env.js';
import { logger } from './logger.js';

let s3Client: S3Client | null = null;

if (env.AWS_ACCESS_KEY_ID && env.AWS_SECRET_ACCESS_KEY) {
  s3Client = new S3Client({
    region: env.AWS_REGION || 'us-east-1',
    credentials: {
      accessKeyId: env.AWS_ACCESS_KEY_ID,
      secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
    },
  });
  logger.info({ bucket: env.AWS_S3_KYC_BUCKET, region: env.AWS_REGION }, '🔒 AWS S3 Client initialized for KYC document vault.');
} else {
  // Fallback: Default AWS SDK credentials chain (IAM Role / AWS CLI profile)
  s3Client = new S3Client({
    region: env.AWS_REGION || 'us-east-1',
  });
}

export interface UploadKycParams {
  userId?: string;
  userName?: string;
  userRole?: string;
  userEmail?: string;
  docType: string;
  idNumber: string;
  originalName: string;
  mimeType: string;
  buffer: Buffer;
}

/**
 * Enterprise Helper: Formats industry-standard S3 user folder path
 * Example Outputs:
 * - Patient John Doe (ID: pat_102) -> "Patient_John_Doe_pat_102"
 * - Doctor Dr. Sarah Smith (ID: doc_55) -> "Doctor_Dr_Sarah_Smith_doc_55"
 * - Nurse Emily Watson -> "Nurse_Emily_Watson"
 * - Admin / Super Admin -> "Admin_Audits"
 */
export function buildS3UserFolder(params: {
  userName?: string;
  userRole?: string;
  userId?: string;
  userEmail?: string;
}): string {
  const roleUpper = (params.userRole || '').toUpperCase();

  // Admin audit vault folder for system administrators
  if (roleUpper === 'SUPER_ADMIN' || roleUpper === 'HOSPITAL_ADMIN' || roleUpper === 'ADMIN') {
    return 'Admin_Audits';
  }

  // Format clean role prefix e.g. PATIENT -> Patient, LAB_TECH -> Lab_Tech
  let rolePrefix = 'Patient';
  if (params.userRole) {
    const rawRole = params.userRole.replace(/_/g, ' ');
    rolePrefix = rawRole
      .toLowerCase()
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join('_');
  }

  // Format clean user full name e.g. "John Doe" -> "John_Doe"
  let cleanName = (params.userName || '').trim();
  if (!cleanName && params.userEmail) {
    cleanName = params.userEmail.split('@')[0];
  }
  if (!cleanName) {
    cleanName = 'User';
  }

  // Sanitize alphanumeric and space/underscore only
  cleanName = cleanName.replace(/[^a-zA-Z0-9_\-\s]/g, '').trim().replace(/\s+/g, '_');

  // Append optional sanitized user ID suffix if available
  let idSuffix = '';
  if (params.userId && params.userId !== 'anonymous_user' && params.userId !== 'undefined') {
    const sanitizedId = params.userId.replace(/[^a-zA-Z0-9_-]/g, '');
    if (sanitizedId) {
      idSuffix = `_${sanitizedId}`;
    }
  }

  return `${rolePrefix}_${cleanName}${idSuffix}`;
}

export async function uploadKycDocumentToS3(params: UploadKycParams): Promise<{
  success: boolean;
  s3Key: string;
  bucket: string;
  s3Url: string;
  userFolder: string;
  kmsEncrypted: boolean;
  message: string;
}> {
  const userFolder = buildS3UserFolder({
    userName: params.userName,
    userRole: params.userRole,
    userId: params.userId,
    userEmail: params.userEmail,
  });

  const timestamp = Date.now();
  const sanitizeFileName = params.originalName.replace(/[^a-zA-Z0-9_.-]/g, '_');
  const s3Key = `kyc_vault/${userFolder}/${timestamp}_${sanitizeFileName}`;
  const bucketName = env.AWS_S3_KYC_BUCKET || 'medflow-kyc-documents-production';

  try {
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: s3Key,
      Body: params.buffer,
      ContentType: params.mimeType,
      ServerSideEncryption: 'aws:kms', // HIPAA-compliant KMS server-side encryption
      Metadata: {
        'doc-type': params.docType || 'Government_ID',
        'id-number': params.idNumber || 'N/A',
        'user-name': params.userName || 'Unassigned',
        'user-role': params.userRole || 'PATIENT',
        'user-id': params.userId || 'unassigned',
        'uploaded-at': new Date().toISOString(),
        'compliance-standard': 'HIPAA-HITECH',
      },
    });

    if (s3Client) {
      await s3Client.send(command);
      logger.info({ bucket: bucketName, s3Key, userFolder }, '✅ Successfully uploaded user KYC document to AWS S3 bucket.');

      return {
        success: true,
        s3Key,
        bucket: bucketName,
        s3Url: `https://${bucketName}.s3.${env.AWS_REGION || 'us-east-1'}.amazonaws.com/${s3Key}`,
        userFolder,
        kmsEncrypted: true,
        message: `KYC Document for ${params.userName || 'User'} securely stored in S3 folder: kyc_vault/${userFolder}/`,
      };
    } else {
      throw new Error('S3 Client initialization failed');
    }
  } catch (err: unknown) {
    const error = err as Error;
    logger.warn({ error: error.message, bucket: bucketName, userFolder }, '⚠️ S3 direct upload status warning.');
    return {
      success: false,
      s3Key,
      bucket: bucketName,
      s3Url: `https://${bucketName}.s3.${env.AWS_REGION || 'us-east-1'}.amazonaws.com/${s3Key}`,
      userFolder,
      kmsEncrypted: true,
      message: `Failed to upload to S3: ${error.message || 'AWS authentication required'}`,
    };
  }
}

export interface UploadMedicalRecordParams {
  primaryAccountName: string; // Account holder name e.g. "Sai Satyabrata"
  patientName: string;        // Patient name (self or relative)
  isRelative?: boolean;
  relation?: string;          // e.g. "father", "mother", etc.
  recordId?: string;
  doctorName?: string;
  department?: string;
  mimeType?: string;
  buffer: Buffer;
}

/**
 * Clean & sanitize user/folder names for AWS S3 paths while keeping readable spaces or clean underscores
 */
export function sanitizeS3Name(name: string): string {
  if (!name || !name.trim()) return 'Unassigned';
  return name.trim().replace(/[^a-zA-Z0-9\s_\-]/g, '').replace(/\s+/g, ' ');
}

/**
 * Upload Prescription PDF to AWS S3 Medical Records Bucket (NOT KYC Vault)
 * S3 Path: prescriptions/{Primary Account Name}/{Patient Name}_prescription_{timestamp}.pdf
 */
export async function uploadPrescriptionToS3(params: UploadMedicalRecordParams): Promise<{
  success: boolean;
  s3Key: string;
  bucket: string;
  s3Url: string;
  primaryFolder: string;
  fileName: string;
  message: string;
}> {
  const primaryFolder = sanitizeS3Name(params.primaryAccountName || params.patientName || 'Account_Holder');
  const cleanPatientName = sanitizeS3Name(params.patientName || 'Patient');
  const timestamp = Date.now();
  const fileName = `${cleanPatientName}_prescription_${timestamp}.pdf`;
  const s3Key = `prescriptions/${primaryFolder}/${fileName}`;
  const bucketName = env.AWS_S3_MEDICAL_RECORDS_BUCKET || 'medflow-medical-records-production';

  try {
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: s3Key,
      Body: params.buffer,
      ContentType: params.mimeType || 'application/pdf',
      ServerSideEncryption: 'aws:kms',
      Metadata: {
        'record-type': 'Prescription',
        'primary-account-name': primaryFolder,
        'patient-name': cleanPatientName,
        'is-relative': params.isRelative ? 'true' : 'false',
        'relation': params.relation || 'self',
        'doctor-name': params.doctorName || 'Unassigned',
        'uploaded-at': new Date().toISOString(),
        'compliance-standard': 'HIPAA-HITECH',
      },
    });

    if (s3Client) {
      await s3Client.send(command);
      logger.info({ bucket: bucketName, s3Key, primaryFolder }, '✅ Successfully uploaded Prescription to AWS S3 Medical Records bucket.');
    }

    return {
      success: true,
      s3Key,
      bucket: bucketName,
      s3Url: `https://${bucketName}.s3.${env.AWS_REGION || 'us-east-1'}.amazonaws.com/${s3Key}`,
      primaryFolder,
      fileName,
      message: `Prescription stored in S3: ${s3Key}`,
    };
  } catch (err: unknown) {
    const error = err as Error;
    logger.warn({ error: error.message, bucket: bucketName, s3Key }, '⚠️ S3 prescription upload fallback status.');
    return {
      success: false,
      s3Key,
      bucket: bucketName,
      s3Url: `https://${bucketName}.s3.${env.AWS_REGION || 'us-east-1'}.amazonaws.com/${s3Key}`,
      primaryFolder,
      fileName,
      message: `Direct S3 upload pending credentials (${error.message}). S3 URI initialized: ${s3Key}`,
    };
  }
}

/**
 * Upload Diagnostic Test Report PDF to AWS S3 Medical Records Bucket (NOT KYC Vault)
 * S3 Path: test-reports/{Primary Account Name}/{Patient Name}_test_report_{timestamp}.pdf
 */
export async function uploadTestReportToS3(params: UploadMedicalRecordParams): Promise<{
  success: boolean;
  s3Key: string;
  bucket: string;
  s3Url: string;
  primaryFolder: string;
  fileName: string;
  message: string;
}> {
  const primaryFolder = sanitizeS3Name(params.primaryAccountName || params.patientName || 'Account_Holder');
  const cleanPatientName = sanitizeS3Name(params.patientName || 'Patient');
  const timestamp = Date.now();
  const fileName = `${cleanPatientName}_test_report_${timestamp}.pdf`;
  const s3Key = `test-reports/${primaryFolder}/${fileName}`;
  const bucketName = env.AWS_S3_MEDICAL_RECORDS_BUCKET || 'medflow-medical-records-production';

  try {
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: s3Key,
      Body: params.buffer,
      ContentType: params.mimeType || 'application/pdf',
      ServerSideEncryption: 'aws:kms',
      Metadata: {
        'record-type': 'Test_Report',
        'primary-account-name': primaryFolder,
        'patient-name': cleanPatientName,
        'is-relative': params.isRelative ? 'true' : 'false',
        'relation': params.relation || 'self',
        'department': params.department || 'Pathology',
        'uploaded-at': new Date().toISOString(),
        'compliance-standard': 'HIPAA-HITECH',
      },
    });

    if (s3Client) {
      await s3Client.send(command);
      logger.info({ bucket: bucketName, s3Key, primaryFolder }, '✅ Successfully uploaded Test Report to AWS S3 Medical Records bucket.');
    }

    return {
      success: true,
      s3Key,
      bucket: bucketName,
      s3Url: `https://${bucketName}.s3.${env.AWS_REGION || 'us-east-1'}.amazonaws.com/${s3Key}`,
      primaryFolder,
      fileName,
      message: `Test report stored in S3: ${s3Key}`,
    };
  } catch (err: unknown) {
    const error = err as Error;
    logger.warn({ error: error.message, bucket: bucketName, s3Key }, '⚠️ S3 test report upload fallback status.');
    return {
      success: false,
      s3Key,
      bucket: bucketName,
      s3Url: `https://${bucketName}.s3.${env.AWS_REGION || 'us-east-1'}.amazonaws.com/${s3Key}`,
      primaryFolder,
      fileName,
      message: `Direct S3 upload pending credentials (${error.message}). S3 URI initialized: ${s3Key}`,
    };
  }
}

