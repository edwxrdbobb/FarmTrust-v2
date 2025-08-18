import mongoose from "mongoose";

export async function startTransaction() {
  const session = await mongoose.startSession();
  session.startTransaction();
  return session;
}

// Function to commit a transaction
export async function commitTransaction(session: any) {
  await session.commitTransaction();
  session.endSession();
}

// Function to abort a transaction
export async function abortTransaction(session: any) {
  await session.abortTransaction();
  session.endSession();
}
