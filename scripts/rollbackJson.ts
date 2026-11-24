import fs from 'fs';
import path from 'path';

/**
 * Rollback Script: Restores JSON database files from a verified backup folder.
 */
async function rollback() {
  const backupsDir = path.resolve(process.cwd(), 'src', 'server', 'db', 'backups');
  if (!fs.existsSync(backupsDir)) {
    console.error('[Rollback] No backups directory found at:', backupsDir);
    process.exit(1);
  }

  const entries = fs.readdirSync(backupsDir)
    .filter((f) => f.startsWith('backup_'))
    .sort()
    .reverse();

  if (entries.length === 0) {
    console.error('[Rollback] No backup archives found in:', backupsDir);
    process.exit(1);
  }

  const targetBackup = process.argv[2] || entries[0];
  const targetDir = path.resolve(backupsDir, targetBackup);

  if (!fs.existsSync(targetDir)) {
    console.error(`[Rollback] Specified backup not found: ${targetDir}`);
    process.exit(1);
  }

  console.log(`[Rollback] Restoring JSON store files from: ${targetDir}`);
  const manifestPath = path.resolve(targetDir, 'manifest.json');
  if (fs.existsSync(manifestPath)) {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    console.log(`[Rollback] Backup Manifest Timestamp: ${manifest.timestamp}`);
    console.log(`[Rollback] Collections in archive: ${manifest.files?.length || 0}`);
  }

  const dbDir = path.resolve(process.cwd(), 'src', 'server', 'db');
  let restoredCount = 0;

  // Restore raw files if present
  const rawAbout = path.resolve(targetDir, 'raw_data_about.json');
  if (fs.existsSync(rawAbout)) {
    fs.copyFileSync(rawAbout, path.resolve(dbDir, 'data_about.json'));
    console.log('  Restored: data_about.json (from raw snapshot)');
    restoredCount++;
  } else {
    const aboutJson = path.resolve(targetDir, 'about.json');
    if (fs.existsSync(aboutJson)) {
      fs.copyFileSync(aboutJson, path.resolve(dbDir, 'data_about.json'));
      console.log('  Restored: data_about.json (from about.json)');
      restoredCount++;
    }
  }

  const rawUsers = path.resolve(targetDir, 'raw_data_users.json');
  if (fs.existsSync(rawUsers)) {
    fs.copyFileSync(rawUsers, path.resolve(dbDir, 'data_users.json'));
    console.log('  Restored: data_users.json (from raw snapshot)');
    restoredCount++;
  } else {
    const usersJson = path.resolve(targetDir, 'users.json');
    if (fs.existsSync(usersJson)) {
      fs.copyFileSync(usersJson, path.resolve(dbDir, 'data_users.json'));
      console.log('  Restored: data_users.json (from users.json)');
      restoredCount++;
    }
  }

  console.log(`\n[Rollback] Successfully restored ${restoredCount} JSON collection files.`);
  console.log('[Rollback] The JSON storage layer has been restored safely.');
}

rollback().catch((err) => {
  console.error('[Rollback Error]:', err);
  process.exit(1);
});
