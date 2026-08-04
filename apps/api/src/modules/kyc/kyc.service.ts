import { KycModel, IKycDocument } from './kyc.model.js';
import { AppError } from '../../middleware/errorHandler.js';

export class KycService {
  static async createKyc(data: Partial<IKycDocument>) {
    const kyc = new KycModel({
      userId: data.userId || 'usr_anonymous',
      userName: data.userName || 'User',
      userRole: data.userRole || 'PATIENT',
      userEmail: data.userEmail,
      docType: data.docType || 'Aadhaar Card',
      idNumber: data.idNumber || 'N/A',
      status: data.status || 'VERIFIED',
      s3Key: data.s3Key,
      s3Url: data.s3Url,
      bucket: data.bucket,
    });
    return kyc.save();
  }

  static async getAllKycs(filter: any = {}) {
    return KycModel.find(filter).sort({ createdAt: -1 });
  }

  static async getKycById(id: string) {
    const kyc = await KycModel.findById(id);
    if (!kyc) throw new AppError('KYC record not found', 404, 'NOT_FOUND');
    return kyc;
  }

  static async updateKyc(id: string, data: Partial<IKycDocument>) {
    const kyc = await KycModel.findByIdAndUpdate(id, data, { new: true });
    if (!kyc) throw new AppError('KYC record not found', 404, 'NOT_FOUND');
    return kyc;
  }

  static async deleteKyc(id: string) {
    const kyc = await KycModel.findByIdAndDelete(id);
    if (!kyc) throw new AppError('KYC record not found', 404, 'NOT_FOUND');
    return kyc;
  }
}
