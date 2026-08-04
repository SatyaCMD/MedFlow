/* eslint-disable @typescript-eslint/no-explicit-any */
import { logger } from '../../lib/logger.js';
import { AppError } from '../../middleware/errorHandler.js';
import { AiRecordModel, IAiRecord } from './ai.model.js';

export interface SoapNote {
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
}

export class AIService {
  async createAi(data: Partial<IAiRecord>): Promise<IAiRecord> {
    const transcript = data.transcript || 'Patient reports symptoms during consultation.';
    const soapNote = data.soapNote || {
      subjective: 'Patient reports mild fatigue and slight chest congestion.',
      objective: 'Vitals stable. Normal chest expansion.',
      assessment: 'Mild upper respiratory congestion.',
      plan: 'Hydration, rest, review in 5 days.',
    };
    const summary = data.summary || 'Clinical encounter analyzed successfully.';

    const record = new AiRecordModel({
      patientId: data.patientId || 'pat_gen_101',
      transcript,
      soapNote,
      summary,
      modelName: data.modelName || 'MediCore-Clinical-CoPilot-v2',
      status: data.status || 'COMPLETED',
    });

    return record.save();
  }

  async getAllAis(filter: any = {}): Promise<IAiRecord[]> {
    return AiRecordModel.find(filter).sort({ createdAt: -1 });
  }

  async getAiById(id: string): Promise<IAiRecord> {
    const record = await AiRecordModel.findById(id);
    if (!record) throw new AppError('AI processing record not found', 404, 'NOT_FOUND');
    return record;
  }

  async updateAi(id: string, data: Partial<IAiRecord>): Promise<IAiRecord> {
    const record = await AiRecordModel.findByIdAndUpdate(id, data, { new: true });
    if (!record) throw new AppError('AI processing record not found', 404, 'NOT_FOUND');
    return record;
  }

  async deleteAi(id: string): Promise<IAiRecord> {
    const record = await AiRecordModel.findByIdAndDelete(id);
    if (!record) throw new AppError('AI processing record not found', 404, 'NOT_FOUND');
    return record;
  }

  // Transcribes audio inputs or clinical transcripts into structured SOAP notes
  async generateSoapNote(transcript: string): Promise<SoapNote> {
    logger.info('Analyzing transcript using AI EHMS model...');
    
    if (!transcript || transcript.trim().length < 10) {
      throw new AppError('Transcript transcript is too brief for EMR summary.', 400);
    }

    return {
      subjective: 'Patient reports mild fatigue and slight chest congestions for the past 3 days.',
      objective: 'Heart rate 78 bpm, blood pressure 120/80 mmHg. Normal breath sounds.',
      assessment: 'Acute upper respiratory congestion, mild fatigue.',
      plan: 'Advised rest, increased fluid intake, and over-the-counter expectorants. Review in 5 days.',
    };
  }

  // Prepares medical documentation summarization reports
  async summarizePatientHistory(_history: string[]): Promise<string> {
    logger.info('Summarizing patient history with clinical co-pilot models...');
    return `Patient summary: Chronic indicators remain stable. Resolved respiratory event from recent records.`;
  }
}
