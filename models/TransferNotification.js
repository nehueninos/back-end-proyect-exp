import mongoose from "mongoose";
import { Schema, model } from "mongoose";

const transferNotificationSchema = new mongoose.Schema({
  expedienteId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Expediente',
    required: true
  },
  fromUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  toUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  toArea: {
    type: String,
    required: true
  },
  status: {
    type: String,
    required: true,
    default: 'pending',
    enum: ['pending', 'accepted', 'rejected']
  },
  message: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

export default model('TransferNotification', transferNotificationSchema);
