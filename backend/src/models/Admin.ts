import { Schema, model, Document } from 'mongoose';

export interface IAdmin extends Document {
  userId: string;        // the phone number / login id, e.g. "01745532902"
  passwordHash: string;
}

const adminSchema = new Schema<IAdmin>(
  {
    userId: { type: String, required: true, unique: true, trim: true },
    passwordHash: { type: String, required: true }
  },
  { timestamps: true }
);

export default model<IAdmin>('Admin', adminSchema);
