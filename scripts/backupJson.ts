import fs from 'fs';
import path from 'path';
import { db } from '../src/server/db/store.ts';

export interface BackupManifest {
  timestamp: string;
  backupDir: string;
  files: {
    collection: string;
    filename: string;
    count: number;
    sizeBytes: number;
  }[];
}

export function performBackup(): BackupManifest {
  const rootDir = process.cwd();
  const dbDir = path.join(rootDir, 'src', 'server', 'db');
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupDir = path.join(dbDir, 'backups', `backup_${timestamp}`);

  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  const manifest: BackupManifest = {
    timestamp: new Date().toISOString(),
    backupDir,
    files: []
  };

  // 1. Existing JSON files on disk
  const existingJsonFiles = [
    { name: 'about', file: path.join(dbDir, 'data_about.json'), getData: () => db.getAboutData() },
    { name: 'users', file: path.join(dbDir, 'data_users.json'), getData: () => db.getAdminUsers() }
  ];

  // 2. All collections from DAL store
  const allCollections = [
    {
      name: 'users',
      getData: () => {
        const usersFile = path.join(dbDir, 'data_users.json');
        if (fs.existsSync(usersFile)) {
          return JSON.parse(fs.readFileSync(usersFile, 'utf-8'));
        }
        return [db.getAdmin()];
      }
    },
    { name: 'about', getData: () => db.getAboutData() },
    { name: 'services', getData: () => db.getServices(true) },
    { name: 'projects', getData: () => db.getProjects(true) },
    { name: 'blog', getData: () => db.getBlogPosts(true) },
    { name: 'inquiries', getData: () => db.getInquiries() },
    { name: 'settings', getData: () => db.getSettings() },
    { name: 'media', getData: () => db.getMedia() },
    { name: 'seo', getData: () => db.getPageSeoConfigs() },
    { name: 'tracking', getData: () => db.getTrackingConfig() },
    { name: 'performance', getData: () => db.getPerformanceSnapshots() }
  ];

  // Also preserve raw existing JSON files directly byte-for-byte
  for (const item of existingJsonFiles) {
    if (fs.existsSync(item.file)) {
      const raw = fs.readFileSync(item.file, 'utf-8');
      const targetPath = path.join(backupDir, `raw_${path.basename(item.file)}`);
      fs.writeFileSync(targetPath, raw, 'utf-8');
    }
  }

  // Export each structured collection into backup
  for (const col of allCollections) {
    const data = col.getData();
    const count = Array.isArray(data) ? data.length : (data ? 1 : 0);
    const filename = `${col.name}.json`;
    const destPath = path.join(backupDir, filename);
    const content = JSON.stringify(data, null, 2);
    fs.writeFileSync(destPath, content, 'utf-8');

    manifest.files.push({
      collection: col.name,
      filename,
      count,
      sizeBytes: Buffer.byteLength(content, 'utf-8')
    });
  }

  // Write manifest
  fs.writeFileSync(
    path.join(backupDir, 'manifest.json'),
    JSON.stringify(manifest, null, 2),
    'utf-8'
  );

  console.log('\n======================================================');
  console.log('       DARKVENCE — ZERO-DATA-LOSS JSON BACKUP         ');
  console.log('======================================================');
  console.log(`Backup Directory: ${backupDir}`);
  console.log(`Backup Timestamp: ${manifest.timestamp}`);
  console.log('------------------------------------------------------');
  for (const f of manifest.files) {
    console.log(` - ${f.collection.padEnd(14)} : ${f.count} records (${(f.sizeBytes / 1024).toFixed(1)} KB)`);
  }
  console.log('======================================================\n');

  return manifest;
}

if (process.argv[1] && process.argv[1].endsWith('backupJson.ts')) {
  try {
    performBackup();
    process.exit(0);
  } catch (err: any) {
    console.error('Backup failed:', err);
    process.exit(1);
  }
}
