// Test script to verify cleanup functions work (for development only)
import { runAutomaticCleanup } from './lobbyCleanup';

export const testCleanupSystem = async () => {
  console.log('🧪 Testing lobby cleanup system...');
  
  try {
    const results = await runAutomaticCleanup();
    console.log('✅ Cleanup test completed:', results);
    return results;
  } catch (error) {
    console.error('❌ Cleanup test failed:', error);
    return null;
  }
};

// Export for manual testing in browser console
(window as any).testLobbyCleanup = testCleanupSystem;