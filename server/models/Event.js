import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now },
  severity: { type: String, enum: ['Critical', 'High', 'Medium', 'Low', 'Info'], default: 'Info' },
  category: { type: String, default: 'Network' },
  title: { type: String, required: true },
  sourceIp: { type: String, default: '192.168.1.10' },
  destination: { type: String, default: '10.0.0.8' },
  status: { type: String, enum: ['New', 'Acknowledged'], default: 'New' },
  description: { type: String, default: '' }
}, { timestamps: true });

export default mongoose.model('Event', eventSchema);
