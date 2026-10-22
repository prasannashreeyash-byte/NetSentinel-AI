import mongoose from 'mongoose';
const schema = new mongoose.Schema({
  actorId: String, actorEmail: String, action: String, targetType: String, targetId: String,
  details: String, createdAt: { type: Date, default: Date.now }
});
export default mongoose.model('AuditLog', schema);
