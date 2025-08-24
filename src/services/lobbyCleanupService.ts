import { runAutomaticCleanup } from '../utils/lobbyCleanup';

class LobbyCleanupService {
  private cleanupInterval: NodeJS.Timeout | null = null;
  private isRunning = false;

  // Start automatic cleanup service
  start() {
    if (this.isRunning) return;

    this.isRunning = true;
    console.log('🧹 Starting automatic lobby cleanup service (runs every 30 minutes)');

    // Run cleanup immediately after 2 minutes (to allow app to fully load)
    setTimeout(() => {
      this.runCleanup();
    }, 2 * 60 * 1000);

    // Then run every 30 minutes
    this.cleanupInterval = setInterval(() => {
      this.runCleanup();
    }, 30 * 60 * 1000); // 30 minutes
  }

  // Stop the service
  stop() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.isRunning = false;
    console.log('🧹 Automatic lobby cleanup service stopped');
  }

  private async runCleanup() {
    try {
      await runAutomaticCleanup();
    } catch (error) {
      console.error('Error during automatic lobby cleanup:', error);
    }
  }

  get running() {
    return this.isRunning;
  }
}

// Create singleton instance and auto-start
const cleanupService = new LobbyCleanupService();

// Auto-start the service when this module loads (browser only)
if (typeof window !== 'undefined') {
  cleanupService.start();
}

export { cleanupService };