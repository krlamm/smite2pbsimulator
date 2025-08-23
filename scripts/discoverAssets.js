#!/usr/bin/env node

// Asset Discovery Script
// Run this to scan the Google Drive and create an asset manifest
// Usage: node scripts/discoverAssets.js [folder-id]

import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class DriveScanner {
  constructor() {
    this.drive = null;
    this.auth = null;
  }

  // Initialize authentication
  async initialize() {
    try {
      console.log('🔧 Initializing Google Drive scanner...');
      
      // Load credentials
      const credentialsPath = path.join(process.cwd(), 'google_credentials.json');
      if (!fs.existsSync(credentialsPath)) {
        throw new Error('❌ google_credentials.json not found in project root');
      }
      
      const credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));
      const { client_secret, client_id, redirect_uris } = credentials.installed || credentials.web;
      
      this.auth = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
      
      // Check for existing token
      const tokenPath = path.join(process.cwd(), 'drive_tokens.json');
      if (fs.existsSync(tokenPath)) {
        const token = JSON.parse(fs.readFileSync(tokenPath, 'utf8'));
        this.auth.setCredentials(token);
        console.log('✅ Using existing authentication token');
      } else {
        console.log('🔑 No existing token found, starting authentication...');
        await this.authenticate();
      }
      
      this.drive = google.drive({ version: 'v3', auth: this.auth });
      
      // Test the connection
      await this.drive.about.get({ fields: 'user' });
      console.log('✅ Google Drive connection established');
      
    } catch (error) {
      console.error('❌ Initialization failed:', error.message);
      throw error;
    }
  }

  // Handle OAuth flow
  async authenticate() {
    const authUrl = this.auth.generateAuthUrl({
      access_type: 'offline',
      scope: ['https://www.googleapis.com/auth/drive.readonly'],
    });

    console.log('\n📖 AUTHENTICATION REQUIRED:');
    console.log('1. Open this URL in your browser:');
    console.log(`   ${authUrl}`);
    console.log('2. Complete authorization and copy the code\n');

    const code = await this.promptForCode();
    
    try {
      const { tokens } = await this.auth.getToken(code);
      this.auth.setCredentials(tokens);
      
      // Save token for future use
      const tokenPath = path.join(process.cwd(), 'drive_tokens.json');
      fs.writeFileSync(tokenPath, JSON.stringify(tokens, null, 2));
      console.log('✅ Authentication successful, token saved');
      
    } catch (error) {
      console.error('❌ Authentication failed:', error.message);
      throw error;
    }
  }

  // Prompt user for auth code
  promptForCode() {
    return new Promise((resolve) => {
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      });
      
      rl.question('Enter the authorization code: ', (code) => {
        rl.close();
        resolve(code.trim());
      });
    });
  }

  // Get folder contents
  async getFolderContents(folderId, pageToken = null) {
    const params = {
      q: `'${folderId}' in parents and trashed=false`,
      fields: 'nextPageToken,files(id,name,mimeType,size,parents,createdTime,modifiedTime)',
      pageSize: 1000,
    };
    
    if (pageToken) params.pageToken = pageToken;
    
    const response = await this.drive.files.list(params);
    return response.data;
  }

  // Recursively scan folder
  async scanFolder(folderId, folderName = 'root', currentPath = '', depth = 0) {
    const indent = '  '.repeat(depth);
    console.log(`${indent}📁 ${currentPath || 'root'}`);
    
    let allFiles = [];
    let nextPageToken = null;
    
    // Handle pagination
    do {
      const result = await this.getFolderContents(folderId, nextPageToken);
      allFiles = allFiles.concat(result.files || []);
      nextPageToken = result.nextPageToken;
    } while (nextPageToken);
    
    const folders = allFiles.filter(f => f.mimeType === 'application/vnd.google-apps.folder');
    const files = allFiles.filter(f => f.mimeType !== 'application/vnd.google-apps.folder');
    
    console.log(`${indent}   📄 ${files.length} files, 📁 ${folders.length} subfolders`);
    
    // Process files
    const assets = files.map(file => ({
      id: file.id,
      name: file.name,
      mimeType: file.mimeType,
      size: parseInt(file.size || '0'),
      path: currentPath ? `${currentPath}/${file.name}` : file.name,
      parentId: folderId,
      createdTime: file.createdTime,
      modifiedTime: file.modifiedTime,
    }));

    // Process subfolders
    const subfolders = [];
    for (const folder of folders) {
      const subPath = currentPath ? `${currentPath}/${folder.name}` : folder.name;
      try {
        const subfolder = await this.scanFolder(folder.id, folder.name, subPath, depth + 1);
        subfolders.push(subfolder);
      } catch (error) {
        console.error(`${indent}   ❌ Error scanning ${folder.name}:`, error.message);
      }
    }

    const totalSize = assets.reduce((sum, a) => sum + a.size, 0) +
                     subfolders.reduce((sum, f) => sum + f.totalSize, 0);
    const assetCount = assets.length + subfolders.reduce((sum, f) => sum + f.assetCount, 0);

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

  // Create asset manifest
  createManifest(rootFolder) {
    const allAssets = [];
    
    const collectAssets = (folder) => {
      allAssets.push(...folder.assets);
      folder.subfolders.forEach(collectAssets);
    };
    
    collectAssets(rootFolder);

    // Group by type
    const assetsByType = {};
    allAssets.forEach(asset => {
      const type = asset.mimeType.split('/')[0];
      if (!assetsByType[type]) assetsByType[type] = [];
      assetsByType[type].push(asset);
    });

    // Group by possible god names
    const assetsByGod = {};
    const godNames = [
      'anubis', 'ra', 'thor', 'athena', 'neith', 'ymir', 'artemis', 'loki', 
      'hercules', 'cupid', 'zeus', 'hades', 'poseidon', 'kali', 'sobek',
      'vulcan', 'arachne', 'odin', 'guan-yu', 'anhur', 'bastet', 'ares',
      'agni', 'ao-kuang', 'aphrodite', 'apollo', 'awilix', 'bacchus',
      'bakasura', 'baron-samedi', 'bellona', 'cabrakan', 'camazotz',
      'cerberus', 'cernunnos', 'chaac', 'chang-e', 'chiron', 'chronos',
      'da-ji', 'danzaburou', 'discordia', 'erlang-shen', 'fafnir',
      'fenrir', 'freya', 'geb', 'guan-yu', 'he-bo', 'hel', 'hera',
      'hou-yi', 'hun-batz', 'isis', 'izanami', 'janus', 'jing-wei',
      'jormungandr', 'khepri', 'king-arthur', 'kukulkan', 'kumbhakarna',
      'kuzenbo', 'medusa', 'mercury', 'merlin', 'mulan', 'ne-zha',
      'nemesis', 'nike', 'nox', 'nu-wa', 'osiris', 'pele', 'persephone',
      'raijin', 'rama', 'ratatoskr', 'ravana', 'scylla', 'serqet',
      'set', 'skadi', 'sol', 'sun-wukong', 'susano', 'sylvanus',
      'terra', 'thanatos', 'the-morrigan', 'thoth', 'tiamat', 'tyr',
      'ullr', 'vamana', 'vulcan', 'xbalanque', 'xing-tian', 'yemoja',
      'zhong-kui'
    ];

    allAssets.forEach(asset => {
      const searchText = (asset.path + ' ' + asset.name).toLowerCase();
      godNames.forEach(god => {
        if (searchText.includes(god.replace('-', ' ')) || searchText.includes(god.replace(' ', '-'))) {
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

  // Format file size
  formatSize(bytes) {
    const sizes = ['B', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 B';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  }

  // Print summary
  printSummary(manifest) {
    console.log('\n📊 SCAN COMPLETE - SUMMARY:');
    console.log(`📅 Scan Date: ${new Date(manifest.scanDate).toLocaleString()}`);
    console.log(`📁 Total Assets: ${manifest.totalAssets.toLocaleString()}`);
    console.log(`💾 Total Size: ${this.formatSize(manifest.totalSize)}`);
    
    console.log('\n📋 By Type:');
    Object.entries(manifest.assetsByType).forEach(([type, assets]) => {
      console.log(`   ${type}: ${assets.length} files`);
    });
    
    console.log('\n🎮 By God (detected):');
    const godEntries = Object.entries(manifest.assetsByGod).slice(0, 10);
    godEntries.forEach(([god, assets]) => {
      console.log(`   ${god}: ${assets.length} assets`);
    });
    
    if (Object.keys(manifest.assetsByGod).length > 10) {
      console.log(`   ... and ${Object.keys(manifest.assetsByGod).length - 10} more gods`);
    }
  }

  // Filter assets based on criteria
  filterAssets(manifest, options = {}) {
    const {
      fileTypes = ['image', 'audio'], // Only images and audio by default
      maxFileSize = 50 * 1024 * 1024, // 50MB max per file
      includeKeywords = ['smite', 'god', 'avatar', 'card', 'ability'], // Must contain these
      excludeKeywords = ['backup', 'old', 'temp', 'test'], // Skip these
      maxTotalSize = 500 * 1024 * 1024, // 500MB total max
    } = options;

    const filtered = [];
    let totalSize = 0;

    const processFolder = (folder) => {
      folder.assets.forEach(asset => {
        // Check file type
        const fileType = asset.mimeType.split('/')[0];
        if (!fileTypes.includes(fileType)) return;

        // Check file size
        if (asset.size > maxFileSize) return;

        // Check keywords
        const searchText = (asset.path + ' ' + asset.name).toLowerCase();
        
        // Must include at least one include keyword
        const hasIncludeKeyword = includeKeywords.some(keyword => 
          searchText.includes(keyword.toLowerCase())
        );
        if (!hasIncludeKeyword) return;

        // Must not include any exclude keywords
        const hasExcludeKeyword = excludeKeywords.some(keyword => 
          searchText.includes(keyword.toLowerCase())
        );
        if (hasExcludeKeyword) return;

        // Check total size limit
        if (totalSize + asset.size > maxTotalSize) {
          console.log(`⚠️  Skipping ${asset.name} - would exceed size limit`);
          return;
        }

        filtered.push(asset);
        totalSize += asset.size;
      });

      folder.subfolders.forEach(processFolder);
    };

    processFolder(manifest.rootFolder);

    return {
      assets: filtered,
      totalSize,
      count: filtered.length,
    };
  }

  // Main scan function with filtering
  async scanDrive(folderId, options = {}) {
    try {
      await this.initialize();
      
      console.log(`\n🔍 Starting scan of folder: ${folderId}`);
      const rootFolder = await this.scanFolder(folderId);
      
      console.log('\n📝 Creating manifest...');
      const manifest = this.createManifest(rootFolder);
      
      // Apply filtering
      console.log('\n🎯 Applying filters...');
      const filtered = this.filterAssets(manifest, options);
      
      const manifestPath = path.join(process.cwd(), 'asset_manifest.json');
      const filteredPath = path.join(process.cwd(), 'filtered_assets.json');
      
      fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
      fs.writeFileSync(filteredPath, JSON.stringify(filtered, null, 2));
      
      this.printSummary(manifest);
      this.printFilteredSummary(filtered);
      
      console.log(`\n💾 Full manifest: ${manifestPath}`);
      console.log(`💾 Filtered assets: ${filteredPath}`);
      
      return { manifest, filtered };
      
    } catch (error) {
      console.error('❌ Scan failed:', error.message);
      throw error;
    }
  }

  // Print filtered summary
  printFilteredSummary(filtered) {
    console.log('\n🎯 FILTERED RESULTS:');
    console.log(`📁 Filtered Assets: ${filtered.count}`);
    console.log(`💾 Total Size: ${this.formatSize(filtered.totalSize)}`);
    console.log(`💰 Estimated Cost: ~$${(filtered.totalSize / (1024**3) * 0.02).toFixed(2)}/month (DO Spaces)`);
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('📖 SMITE Asset Discovery Tool');
    console.log('');
    console.log('Usage: node scripts/discoverAssets.js <folder-id>');
    console.log('');
    console.log('To get the folder ID:');
    console.log('1. Go to the Google Drive folder in your browser');
    console.log('2. Copy the folder ID from the URL');
    console.log('   (the part after /folders/)');
    console.log('');
    console.log('Example:');
    console.log('  node scripts/discoverAssets.js 1ABC123def456GHI789jkl');
    process.exit(1);
  }
  
  const folderId = args[0];
  console.log('🚀 SMITE Asset Discovery Tool Starting...\n');
  
  const scanner = new DriveScanner();
  await scanner.scanDrive(folderId);
  
  console.log('\n🎉 Discovery complete! Check asset_manifest.json for full results.');
}

// Run if called directly
const isMainModule = import.meta.url === new URL(import.meta.url).href && process.argv[1] && import.meta.url === `file://${process.argv[1].replace(/\\/g, '/')}`;

if (process.argv[1] && process.argv[1].endsWith('discoverAssets.js')) {
  main().catch(error => {
    console.error('\n💥 Fatal error:', error.message);
    process.exit(1);
  });
}

export { DriveScanner };