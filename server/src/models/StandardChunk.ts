import mongoose from "mongoose";

const StandardChunkSchema = new mongoose.Schema({
  standardName: { type: String, required: true },
  folder: { type: String, required: true },
  page: { type: Number, required: true },
  text: { type: String, required: true },
  embedding: { type: [Number], required: true }, // Vector embedding
});

export const StandardChunk = mongoose.model("StandardChunk", StandardChunkSchema);
