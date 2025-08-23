// Google Drive Asset Discovery System
// Scans private Google Drive folders and catalogs all SMITE assets

import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';

export interface DriveAsset {
  id: string;
  name: string;
  mimeType: string;
  size: string;
  webContentLink?: string;
  path: string; // Full path in the drive structure
  parentId: string;
  createdTime: string;
  modifiedTime: string;
}

export interface DriveFolder {
  id: string;
  name: string;
  path: string;
  assets: DriveAsset[];
  subfolders: DriveFolder[];
  totalSize: number;
  assetCount: number;
}

export interface AssetManifest {
  scanDate: string;
  rootFolder: DriveFolder;
  totalAssets: number;
  totalSize: number;
  assetsByType: Record<string, DriveAsset[]>;
  assetsByGod: Record<string, DriveAsset[]>;
}

class DriveDiscoveryService {
  private drive: any = null;
  private auth: any = null;

  // Initialize the Google Drive client
  async initialize(): Promise<void> {
    try {
      // Load client credentials
      const credentialsPath = path.join(process.cwd(), 'google_credentials.json');
      const credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));

      // Set up OAuth2 client
      const { client_secret, client_id, redirect_uris } = credentials.installed || credentials.web;
      this.auth = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

      // Try to load existing token
      const tokenPath = path.join(process.cwd(), 'drive_tokens.json');
      if (fs.existsSync(tokenPath)) {
        const token = JSON.parse(fs.readFileSync(tokenPath, 'utf8'));
        this.auth.setCredentials(token);
      } else {
        // Need to authenticate
        await this.authenticate();
      }

      // Initialize Drive client
      this.drive = google.drive({ version: 'v3', auth: this.auth });
      
      console.log('✅ Google Drive client initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Google Drive client:', error);
      throw error;
    }
  }

  // Authenticate user and save token
  private async authenticate(): Promise<void> {
    const authUrl = this.auth.generateAuthUrl({
      access_type: 'offline',
      scope: ['https://www.googleapis.com/auth/drive.readonly'],
    });

    console.log('\n🔑 AUTHENTICATION REQUIRED');
    console.log('1. Open this URL in your browser:');
    console.log(`   ${authUrl}`);
    console.log('2. Complete the authorization');
    console.log('3. Copy the authorization code');
    console.log('4. Enter it below:\n');

    // In a real implementation, you'd prompt for the auth code here
    // For now, we'll throw an error with instructions
    throw new Error(`
      AUTHENTICATION NEEDED:
      1. Go to: ${authUrl}
      2. Authorize access to your Google Drive
      3. Copy the code from the URL
      4. Run the authentication helper first
    `);
  }

  // Save authentication token
  async saveToken(code: string): Promise<void> {
    try {
      const { tokens } = await this.auth.getToken(code);
      this.auth.setCredentials(tokens);
      
      const tokenPath = path.join(process.cwd(), 'drive_tokens.json');
      fs.writeFileSync(tokenPath, JSON.stringify(tokens));
      
      console.log('✅ Token saved successfully');
    } catch (error) {
      console.error('❌ Error saving token:', error);
      throw error;
    }
  }

  // Get folder contents
  async getFolderContents(folderId: string): Promise<any[]> {
    if (!this.drive) {
      throw new Error('Drive client not initialized. Call initialize() first.');
    }

    try {
      const response = await this.drive.files.list({
        q: `'${folderId}' in parents and trashed=false`,
        fields: 'files(id,name,mimeType,size,parents,createdTime,modifiedTime,webContentLink)',
        pageSize: 1000,
      });

      return response.data.files || [];
    } catch (error) {
      console.error(`❌ Error fetching folder contents for ${folderId}:`, error);
      return [];
    }
  }

  // Recursively scan folder structure
  async scanFolder(folderId: string, folderName: string = 'root', currentPath: string = ''): Promise<DriveFolder> {
    console.log(`📁 Scanning: ${currentPath || 'root'}`);
    
    const contents = await this.getFolderContents(folderId);
    
    const folders = contents.filter(item => item.mimeType === 'application/vnd.google-apps.folder');
    const files = contents.filter(item => item.mimeType !== 'application/vnd.google-apps.folder');

    // Process files
    const assets: DriveAsset[] = files.map(file => ({
      id: file.id,
      name: file.name,
      mimeType: file.mimeType,
      size: file.size || '0',
      webContentLink: file.webContentLink,
      path: currentPath ? `${currentPath}/${file.name}` : file.name,
      parentId: folderId,
      createdTime: file.createdTime,
      modifiedTime: file.modifiedTime,
    }));

    // Process subfolders recursively
    const subfolders: DriveFolder[] = [];
    for (const folder of folders) {
      const subfolderPath = currentPath ? `${currentPath}/${folder.name}` : folder.name;
      const subfolder = await this.scanFolder(folder.id, folder.name, subfolderPath);
      subfolders.push(subfolder);
    }

    // Calculate totals
    const totalSize = assets.reduce((sum, asset) => sum + parseInt(asset.size || '0'), 0) +
                     subfolders.reduce((sum, folder) => sum + folder.totalSize, 0);
    const assetCount = assets.length + subfolders.reduce((sum, folder) => sum + folder.assetCount, 0);

    return {
      id: folderId,
      name: folderName,
      path: currentPath,
      assets,
      subfolders,
      totalSize,
      assetCount,
    };
  }

  // Create comprehensive asset manifest
  createManifest(rootFolder: DriveFolder): AssetManifest {
    const allAssets: DriveAsset[] = [];
    
    // Collect all assets recursively
    const collectAssets = (folder: DriveFolder) => {
      allAssets.push(...folder.assets);
      folder.subfolders.forEach(collectAssets);
    };
    
    collectAssets(rootFolder);

    // Group by type
    const assetsByType: Record<string, DriveAsset[]> = {};
    allAssets.forEach(asset => {
      const type = asset.mimeType.split('/')[0] || 'unknown';
      if (!assetsByType[type]) assetsByType[type] = [];
      assetsByType[type].push(asset);
    });

    // Group by god (detect god names in paths/filenames)
    const assetsByGod: Record<string, DriveAsset[]> = {};
    const godNames = [
      'anubis', 'ra', 'thor', 'athena', 'neith', 'ymir', 'artemis', 'loki', 
      'hercules', 'cupid', 'zeus', 'hades', 'poseidon', 'kali', 'sobek',
      'vulcan', 'arachne', 'odin', 'guan-yu', 'anhur', 'bastet', 'ares',
      // Add more god names as needed
    ];

    allAssets.forEach(asset => {
      const assetPath = asset.path.toLowerCase();
      const assetName = asset.name.toLowerCase();
      
      godNames.forEach(god => {
        if (assetPath.includes(god) || assetName.includes(god)) {
          if (!assetsByGod[god]) assetsByGod[god] = [];
          assetsByGod[god].push(asset);
        }
      });
    });

    return {
      scanDate: new Date().toISOString(),
      rootFolder,
      totalAssets: allAssets.length,
      totalSize: rootFolder.totalSize,
      assetsByType,
      assetsByGod,
    };
  }

  // Save manifest to file
  saveManifest(manifest: AssetManifest, filename: string = 'asset_manifest.json'): void {
    const manifestPath = path.join(process.cwd(), filename);
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
    console.log(`✅ Asset manifest saved to: ${manifestPath}`);
  }

  // Load existing manifest
  loadManifest(filename: string = 'asset_manifest.json'): AssetManifest | null {
    try {
      const manifestPath = path.join(process.cwd(), filename);
      const data = fs.readFileSync(manifestPath, 'utf8');
      return JSON.parse(data);
    } catch {
      return null;
    }
  }
}

// Export singleton instance
export const driveDiscovery = new DriveDiscoveryService();

// Utility functions
export const formatFileSize = (bytes: number): string => {
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 Bytes';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
};

export const getAssetsByType = (manifest: AssetManifest, type: string): DriveAsset[] => {
  return manifest.assetsByType[type] || [];
};

export const getAssetsByGod = (manifest: AssetManifest, godName: string): DriveAsset[] => {
  return manifest.assetsByGod[godName.toLowerCase()] || [];
};