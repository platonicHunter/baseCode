import mongoose, { Document, Schema, Types } from "mongoose";

export interface IMessage extends Document {
  _id: Types.ObjectId;
  senderId: Types.ObjectId;
  receiverId: Types.ObjectId;
  message: string;
  createdAt: Date;
  updatedAt: Date;
}

const messageSchema = new Schema<IMessage>(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
    },
    updatedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

const MessageModel = mongoose.model("Message", messageSchema);
export default MessageModel;
