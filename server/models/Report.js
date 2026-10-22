import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema({
  incidentId: { type: String, unique: true, index: true },
  reporter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  reporterName: { type: String, required: true },
  reporterEmail: { type: String, default: '' },
  title: { type: String, required: true, trim: true, maxlength: 200 },
  description: { type: String, required: true, maxlength: 10000 },
  category: {
    type: String,
    enum: [
      'Suspicious login attempts',
      'Malware or virus concerns',
      'Unauthorized access',
      'Network problems',
      'Application errors',
      'Website security vulnerabilities',
      'Source-code errors or bugs',
      'Other cybersecurity concerns',
      'Suspicious login',
      'Unusual network activity',
      'Suspected unauthorized access',
      'Malware concern',
      'Other'
    ],
    default: 'Other cybersecurity concerns'
  },
  affectedSystem: { type: String, default: 'Not specified', maxlength: 300 },
  errorMessage: { type: String, default: '', maxlength: 10000 },
  codeSnippet: { type: String, default: '', maxlength: 25000 },
  attachment: {
    name: { type: String, default: '' },
    mimeType: { type: String, default: '' },
    size: { type: Number, default: 0 },
    dataUrl: { type: String, default: '' }
  },
  automatedGuidance: {
    category: { type: String, default: '' },
    estimatedSeverity: { type: String, default: '' },
    possibleCauses: [{ type: String }],
    troubleshootingSteps: [{ type: String }],
    disclaimer: { type: String, default: '' }
  },
  severity: { type: String, enum: ['Low', 'Medium', 'High', 'Critical'], default: 'Medium' },
  status: {
    type: String,
    enum: ['Open', 'Under Investigation', 'Under investigation', 'Resolved', 'Closed'],
    default: 'Open'
  },
  assignee: { type: String, default: '' },
  investigationFindings: { type: String, default: '', maxlength: 10000 },
  suspectedCause: { type: String, default: '', maxlength: 10000 },
  remediation: { type: String, default: '', maxlength: 10000 },
  resolutionNotes: { type: String, default: '', maxlength: 10000 },
  codeCorrection: {
    originalCode: { type: String, default: '' },
    reportedError: { type: String, default: '' },
    suspectedCause: { type: String, default: '' },
    correctedCode: { type: String, default: '' },
    explanation: { type: String, default: '' },
    verificationStatus: { type: String, default: 'Pending Review' }
  },
  updates: [{
    author: String,
    role: String,
    message: String,
    createdAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

export default mongoose.model('Report', reportSchema);

