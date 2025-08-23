// Quick scan - just generate manifest without verbose output
import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';

const scanner = {
  async initialize() {
    const credentialsPath = path.join(process.cwd(), 'google_credentials.json');
    const credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));
    const { client_secret, client_id, redirect_uris } = credentials.installed || credentials.web;
    
    this.auth = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
    
    const tokenPath = path.join(process.cwd(), 'drive_tokens.json');
    const token = JSON.parse(fs.readFileSync(tokenPath, 'utf8'));
    this.auth.setCredentials(token);
    
    this.drive = google.drive({ version: 'v3', auth: this.auth });
    console.log('✅ Connected to Google Drive');
  },

  async scanQuick(folderId) {
    console.log('🔍 Quick scanning...');
    
    const result = await this.drive.files.list({
      q: `'${folderId}' in parents and trashed=false`,
      fields: 'files(id,name,mimeType)',
      pageSize: 1000,
    });
    
    const folders = result.data.files.filter(f => f.mimeType === 'application/vnd.google-apps.folder');
    
    console.log(`Found ${folders.length} main categories:`);
    folders.forEach(f => console.log(`  📁 ${f.name}`));
    
    return folders;
  }
};

console.log('🚀 Quick SMITE Drive Scanner');
await scanner.initialize();
const categories = await scanner.scanQuick('1u7oJ71xYMlAmNWkhDqu7stj6UvVIKuCP');

console.log(`\n✅ Drive contains ${categories.length} main categories`);
console.log('🎯 Perfect for your SMITE 2 app!');
console.log('\nNext: Set up DigitalOcean Spaces and sync the assets you need');