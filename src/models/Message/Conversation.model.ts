import mongoose, { Schema, Document, Types } from "mongoose";

export interface IConversation extends Document {
  participants: Types.ObjectId[];
  messages: Types.ObjectId[];
}

const conversationSchema = new Schema<IConversation>(
  {
    participants: [{ type: Types.ObjectId, ref: "User" }],
    messages: [{ type: Types.ObjectId, ref: "Message" }],
  },
  { timestamps: true }
);

const ConversationModel = mongoose.model<IConversation>(
  "Conversation",
  conversationSchema
);

export default ConversationModel;
