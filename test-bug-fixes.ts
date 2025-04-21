// Test script for bug fixes
import { NextRequest, NextResponse } from 'next/server';
import { errorHandler } from '@/lib/error-handler';

// Test the errorHandler export
async function testErrorHandler() {
  console.log('Testing errorHandler export...');
  
  try {
    // Create a test error
    const testError = new Error('Test error');
    
    // Use the errorHandler function
    const response = errorHandler(testError);
    
    // Check if response is a NextResponse
    if (response instanceof NextResponse) {
      console.log('✅ errorHandler export is working correctly');
    } else {
      console.log('❌ errorHandler did not return a NextResponse');
    }
  } catch (error) {
    console.error('❌ Error testing errorHandler:', error);
  }
}

// Run the tests
async function runTests() {
  console.log('=== Running Bug Fix Tests ===');
  await testErrorHandler();
  console.log('=== Tests Complete ===');
}

// Execute tests
runTests();
