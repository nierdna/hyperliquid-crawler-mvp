import mongoose, { Schema, Document } from 'mongoose';
import { EnrichedEvent } from '../types';

export interface EventDocument extends EnrichedEvent, Document {}

const EventSchema: Schema = new Schema(
  {
    type: { type: String, required: true, index: true },
    timestamp: { type: Number, required: true, index: true },
    data: { type: Schema.Types.Mixed, required: true },
    source: { type: String, required: true },
    filteredAt: { type: Number, required: true },
    isValid: { type: Boolean, required: true },
    enrichedAt: { type: Number, required: true },
    additionalData: { type: Schema.Types.Mixed },
  },
  {
    timestamps: true,
  }
);

// Create index for efficient searching
EventSchema.index({ type: 1, timestamp: 1 });
EventSchema.index({ source: 1, timestamp: 1 });

export default mongoose.model<EventDocument>('Event', EventSchema); 