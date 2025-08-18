import { connectDB } from '../lib/db';
import Product from '../models/product_model';
import mongoose from 'mongoose';

async function resetProducts() {
  try {
    console.log('🔄 Connecting to database...');
    await connectDB();
    
    console.log('📊 Checking current product count...');
    const currentCount = await Product.countDocuments();
    console.log(`Found ${currentCount} products in the collection.`);
    
    if (currentCount === 0) {
      console.log('✅ Products collection is already empty.');
      return;
    }
    
    console.log('🗑️  Deleting all products...');
    const result = await Product.deleteMany({});
    
    console.log(`✅ Successfully deleted ${result.deletedCount} products from the collection.`);
    
    // Verify the collection is empty
    const remainingCount = await Product.countDocuments();
    console.log(`📊 Remaining products: ${remainingCount}`);
    
    if (remainingCount === 0) {
      console.log('🎉 Products collection has been successfully reset!');
    } else {
      console.log('⚠️  Warning: Some products may not have been deleted.');
    }
    
  } catch (error) {
    console.error('❌ Error resetting products collection:', error);
    process.exit(1);
  } finally {
    try {
      await mongoose.connection.close();
      console.log('🔌 Database connection closed.');
    } catch (error) {
      console.error('Error closing database connection:', error);
    }
    process.exit(0);
  }
}

// Add confirmation prompt
async function confirmReset() {
  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    readline.question(
      '⚠️  WARNING: This will permanently delete ALL products from the database.\n' +
      'Are you sure you want to continue? (yes/no): ',
      (answer: string) => {
        readline.close();
        resolve(answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y');
      }
    );
  });
}

// Main execution
async function main() {
  console.log('🚀 Product Collection Reset Script');
  console.log('=====================================');
  
  const confirmed = await confirmReset();
  
  if (!confirmed) {
    console.log('❌ Operation cancelled by user.');
    process.exit(0);
  }
  
  await resetProducts();
}

main();
