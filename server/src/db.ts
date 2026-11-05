import mongoose from "mongoose";

export async function connectDb() {
  const uri = process.env.MONGODB_URI;
  if (process.env.NODE_ENV === "production" && !uri) throw new Error("MONGODB_URI must be set in production (the in-memory database loses all data on restart)");
  const useMemory = process.env.USE_MEMORY_DB === "1" || !uri;
  if (useMemory) {
    if (!uri) console.warn("[db] MONGODB_URI is not set — starting an in-memory MongoDB for local development. Data is lost when the server stops. Set MONGODB_URI in server/.env (see .env.example) for persistence.");
    const { MongoMemoryServer } = await import("mongodb-memory-server");
    const mem = await MongoMemoryServer.create();
    await mongoose.connect(mem.getUri("vendoriq"));
    console.log("[db] in-memory MongoDB ready");
    return;
  }
  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
    console.log("[db] connected to MongoDB");
  } catch (e) {
    console.error("[db] could not connect to MONGODB_URI:", e instanceof Error ? e.message : e);
    console.error("[db] check the connection string, database user/password and Atlas IP allow-list (0.0.0.0/0 for hosted APIs).");
    throw e;
  }
}
