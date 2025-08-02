import { RouterOSAPI } from 'node-routeros';
import { query } from '../database';

interface RouterConfig {
  id: number;
  name: string;
  ip_address: string;
  username: string;
  password: string;
  api_port: number;
  router_type: string;
}

interface UserSession {
  username: string;
  ip: string;
  macAddress: string;
  planName: string;
  timeLimit: number; // in seconds
  speedLimit: string; // e.g., "5M/2M"
}

class RouterService {
  private connections: Map<number, RouterOSAPI> = new Map();

  // Connect to a router
  async connectRouter(routerConfig: RouterConfig): Promise<RouterOSAPI> {
    try {
      const api = new RouterOSAPI({
        host: routerConfig.ip_address,
        user: routerConfig.username,
        password: routerConfig.password,
        port: routerConfig.api_port || 8728,
        timeout: 10000
      });

      await api.connect();
      this.connections.set(routerConfig.id, api);
      
      // Update router status
      await query(
        'UPDATE routers SET status = $1, last_sync = CURRENT_TIMESTAMP WHERE id = $2',
        ['Active', routerConfig.id]
      );
      
      console.log(`Connected to router: ${routerConfig.name}`);
      return api;
    } catch (error) {
      console.error(`Failed to connect to router ${routerConfig.name}:`, error);
      
      // Update router status to inactive
      await query(
        'UPDATE routers SET status = $1 WHERE id = $2',
        ['Inactive', routerConfig.id]
      );
      
      throw error;
    }
  }

  // Disconnect from a router
  async disconnectRouter(routerId: number): Promise<void> {
    const connection = this.connections.get(routerId);
    if (connection) {
      await connection.close();
      this.connections.delete(routerId);
    }
  }

  // Create user profile on router
  async createUserProfile(routerId: number, userSession: UserSession): Promise<string> {
    const connection = this.connections.get(routerId);
    if (!connection) {
      throw new Error('Router not connected');
    }

    try {
      // Create user profile in hotspot
      const profileData = [
        '=name=' + userSession.planName,
        '=rate-limit=' + userSession.speedLimit,
        '=session-timeout=' + userSession.timeLimit.toString(),
        '=idle-timeout=00:15:00',
        '=keepalive-timeout=00:02:00'
      ];

      const profileResult = await connection.write('/ip/hotspot/user-profile/add', profileData);
      
      // Create hotspot user
      const userData = [
        '=name=' + userSession.username,
        '=password=' + Math.random().toString(36).slice(-8), // Generate random password
        '=profile=' + userSession.planName,
        '=mac-address=' + userSession.macAddress,
        '=address=' + userSession.ip
      ];

      const userResult = await connection.write('/ip/hotspot/user/add', userData);
      
      console.log(`Created user profile for ${userSession.username} on router ${routerId}`);
      return userResult.toString();
    } catch (error) {
      console.error('Error creating user profile:', error);
      throw error;
    }
  }

  // Remove user from router
  async removeUser(routerId: number, username: string): Promise<void> {
    const connection = this.connections.get(routerId);
    if (!connection) {
      throw new Error('Router not connected');
    }

    try {
      // Find and remove user
      const users = await connection.write('/ip/hotspot/user/print', ['?name=' + username]);
      
      if (users.length > 0) {
        await connection.write('/ip/hotspot/user/remove', ['=.id=' + users[0]['.id']]);
        console.log(`Removed user ${username} from router ${routerId}`);
      }
    } catch (error) {
      console.error('Error removing user:', error);
      throw error;
    }
  }

  // Get active users from router
  async getActiveUsers(routerId: number): Promise<any[]> {
    const connection = this.connections.get(routerId);
    if (!connection) {
      throw new Error('Router not connected');
    }

    try {
      const activeUsers = await connection.write('/ip/hotspot/active/print');
      return activeUsers;
    } catch (error) {
      console.error('Error getting active users:', error);
      throw error;
    }
  }

  // Disconnect user session
  async disconnectUser(routerId: number, sessionId: string): Promise<void> {
    const connection = this.connections.get(routerId);
    if (!connection) {
      throw new Error('Router not connected');
    }

    try {
      await connection.write('/ip/hotspot/active/remove', ['=.id=' + sessionId]);
      console.log(`Disconnected session ${sessionId} on router ${routerId}`);
    } catch (error) {
      console.error('Error disconnecting user:', error);
      throw error;
    }
  }

  // Get router statistics
  async getRouterStats(routerId: number): Promise<any> {
    const connection = this.connections.get(routerId);
    if (!connection) {
      throw new Error('Router not connected');
    }

    try {
      const [identity, resources, interfaces] = await Promise.all([
        connection.write('/system/identity/print'),
        connection.write('/system/resource/print'),
        connection.write('/interface/print')
      ]);

      return {
        identity: identity[0],
        resources: resources[0],
        interfaces: interfaces
      };
    } catch (error) {
      console.error('Error getting router stats:', error);
      throw error;
    }
  }

  // Create bandwidth profile
  async createBandwidthProfile(routerId: number, profileName: string, downloadSpeed: number, uploadSpeed: number): Promise<void> {
    const connection = this.connections.get(routerId);
    if (!connection) {
      throw new Error('Router not connected');
    }

    try {
      const rateLimit = `${uploadSpeed}M/${downloadSpeed}M`;
      
      const profileData = [
        '=name=' + profileName,
        '=rate-limit=' + rateLimit,
        '=session-timeout=00:00:00', // No timeout by default
        '=idle-timeout=00:15:00',
        '=keepalive-timeout=00:02:00'
      ];

      await connection.write('/ip/hotspot/user-profile/add', profileData);
      console.log(`Created bandwidth profile ${profileName} with rate ${rateLimit}`);
    } catch (error) {
      console.error('Error creating bandwidth profile:', error);
      throw error;
    }
  }

  // Initialize all routers
  async initializeRouters(): Promise<void> {
    try {
      const result = await query('SELECT * FROM routers WHERE status = $1', ['Active']);
      
      for (const router of result.rows) {
        try {
          await this.connectRouter(router);
        } catch (error) {
          console.error(`Failed to initialize router ${router.name}:`, error);
        }
      }
    } catch (error) {
      console.error('Error initializing routers:', error);
    }
  }

  // Test router connection
  async testConnection(routerConfig: RouterConfig): Promise<boolean> {
    try {
      const api = new RouterOSAPI({
        host: routerConfig.ip_address,
        user: routerConfig.username,
        password: routerConfig.password,
        port: routerConfig.api_port || 8728,
        timeout: 5000
      });

      await api.connect();
      const identity = await api.write('/system/identity/print');
      await api.close();
      
      return identity.length > 0;
    } catch (error) {
      console.error('Router connection test failed:', error);
      return false;
    }
  }

  // Get connection status
  isConnected(routerId: number): boolean {
    return this.connections.has(routerId);
  }

  // Close all connections
  async closeAllConnections(): Promise<void> {
    const disconnectPromises = Array.from(this.connections.entries()).map(
      ([routerId]) => this.disconnectRouter(routerId)
    );
    
    await Promise.all(disconnectPromises);
    this.connections.clear();
  }
}

export const routerService = new RouterService();

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Closing router connections...');
  await routerService.closeAllConnections();
});

process.on('SIGTERM', async () => {
  console.log('Closing router connections...');
  await routerService.closeAllConnections();
});
