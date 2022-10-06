import { Schema, model, ObjectId } from 'mongoose';

export interface IMessage {
  _id: string;
  sender: ObjectId;
  content: string;
  chat: ObjectId;
}

const userMessage = new Schema<IMessage>(
  {
    sender: { type: Schema.Types.ObjectId, ref: 'User' },
    content: { type: String, trim: true },
    chat: { type: Schema.Types.ObjectId, ref: 'Chat' },
  },
  {
    timestamps: true,
  }
);

const Message = model<IMessage>('Message', userMessage);

export default Message;
