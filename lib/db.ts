import mongoose from 'mongoose';

// Load environment variables from .env.local
if (process.env.NODE_ENV !== 'production') {
  try {
    require('dotenv').config({ path: '.env.local' });
  } catch (error) {
    console.log('dotenv not available, using system environment variables');
  }
}

const MONGODB_URI = process.env.MONGO_URI;

if (!MONGODB_URI) {
    throw new Error(
        'Please define the MONGODB_URI environment variable inside .env.local'
    );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const cached = (global as any).mongoose || {conn: null, promise: null}

export async function connectDB(){
  console.log('COnnecting to db...')
    if (cached.conn) return cached.conn;

    if (!cached.promise) {
        cached.promise = mongoose.connect(MONGODB_URI as string).then((mongoose) => {
          return mongoose
        }).catch((error) => {
          console.log(error)
        })

      }
    cached.conn = await cached.promise;
    console.log('Mongodb connected');
    return cached.conn;
}