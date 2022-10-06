import { Schema, model, ObjectId } from 'mongoose';

export interface IChat {
  _id: string;
  chatName: string;
  isGroupChat: boolean;
  users: ObjectId[];
  latestMessage: ObjectId;
  groupAdmin: ObjectId;
}

const chatSchema = new Schema<IChat>(
  {
    chatName: { type: String, trim: true },
    isGroupChat: { type: Boolean, default: false },
    users: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    latestMessage: {
      type: Schema.Types.ObjectId,
      ref: 'Message',
    },
    groupAdmin: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

const Chat = model<IChat>('Chat', chatSchema);

export default Chat;
