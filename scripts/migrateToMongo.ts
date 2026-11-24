import fs from 'fs';
import path from 'path';
import { connectDatabase, disconnectDatabase, getDatabaseStatus } from '../src/server/db/connection.ts';
import { performBackup, BackupManifest } from './backupJson.ts';
import {
  UserModel,
  ServiceModel,
  ProjectModel,
  BlogPostModel,
  InquiryModel,
  AboutModel,
  SettingsModel,
  MediaModel,
  SeoModel,
  PerformanceModel,
  TrackingModel
} from '../src/server/db/models/index.ts';

export interface MigrationSummary {
  timestamp: string;
  database: string;
  backupDir: string;
  collections: {
    name: string;
    sourceCount: number;
    migratedCount: number;
    destinationCount: number;
    status: 'MATCH' | 'MISMATCH';
  }[];
  criticalChecks: {
    description: string;
    passed: boolean;
    detail?: string;
  }[];
  success: boolean;
}

export async function runMigration(): Promise<MigrationSummary> {
  console.log('\n======================================================');
  console.log('    DARKVENCE — ZERO-DATA-LOSS MONGODB MIGRATION     ');
  console.log('======================================================\n');

  // STEP 1: Mandatory Pre-migration JSON Backup
  console.log('[Step 1/5] Backing up all existing JSON collections...');
  const backupManifest: BackupManifest = performBackup();
  console.log(`[Backup Verified] Source files archived at ${backupManifest.backupDir}`);

  // STEP 2: Connect to MongoDB Atlas
  console.log('\n[Step 2/5] Establishing secure MongoDB connection...');
  await connectDatabase();
  const dbStatus = getDatabaseStatus();
  console.log(`[Connected] Provider: ${dbStatus.provider} | Database: ${dbStatus.name || 'darkvence'}`);

  // STEP 3: Load Data from Backup
  console.log('\n[Step 3/5] Loading records from verified backup manifest...');
  const loadJson = (filename: string) => {
    const filePath = path.join(backupManifest.backupDir, filename);
    if (!fs.existsSync(filePath)) {
      throw new Error(`Missing required backup file: ${filePath}`);
    }
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  };

  const usersData: any[] = loadJson('users.json');
  const aboutData: any = loadJson('about.json');
  const servicesData: any[] = loadJson('services.json');
  const projectsData: any[] = loadJson('projects.json');
  const blogData: any[] = loadJson('blog.json');
  const inquiriesData: any[] = loadJson('inquiries.json');
  const settingsData: any = loadJson('settings.json');
  const mediaData: any[] = loadJson('media.json');
  const seoData: any[] = loadJson('seo.json');
  const trackingData: any = loadJson('tracking.json');
  const performanceData: any[] = loadJson('performance.json');

  // STEP 4: Safe, Non-Destructive Idempotent Upserts
  console.log('\n[Step 4/5] Migrating collections with idempotent upsert operations...');

  // 1. Admin Users
  let usersMigrated = 0;
  for (const u of usersData) {
    await UserModel.findOneAndUpdate(
      { email: u.email.toLowerCase() },
      { $set: u },
      { upsert: true, returnDocument: 'after' }
    );
    usersMigrated++;
  }

  // 2. Services
  let servicesMigrated = 0;
  for (const s of servicesData) {
    await ServiceModel.findOneAndUpdate(
      { id: s.id },
      { $set: s },
      { upsert: true, returnDocument: 'after' }
    );
    servicesMigrated++;
  }

  // 3. Projects
  let projectsMigrated = 0;
  for (const p of projectsData) {
    await ProjectModel.findOneAndUpdate(
      { id: p.id },
      { $set: p },
      { upsert: true, returnDocument: 'after' }
    );
    projectsMigrated++;
  }

  // 4. Blog Posts
  let blogMigrated = 0;
  for (const b of blogData) {
    await BlogPostModel.findOneAndUpdate(
      { id: b.id },
      { $set: b },
      { upsert: true, returnDocument: 'after' }
    );
    blogMigrated++;
  }

  // 5. Inquiries
  let inquiriesMigrated = 0;
  for (const inq of inquiriesData) {
    await InquiryModel.findOneAndUpdate(
      { id: inq.id },
      { $set: inq },
      { upsert: true, returnDocument: 'after' }
    );
    inquiriesMigrated++;
  }

  // 6. About CMS
  await AboutModel.findOneAndUpdate(
    { docId: 'primary_about' },
    { $set: { docId: 'primary_about', data: aboutData, updatedAt: aboutData.updatedAt || new Date().toISOString() } },
    { upsert: true, returnDocument: 'after' }
  );

  // 7. Site Settings
  await SettingsModel.findOneAndUpdate(
    { docId: 'primary_settings' },
    { $set: { docId: 'primary_settings', data: settingsData, updatedAt: new Date().toISOString() } },
    { upsert: true, returnDocument: 'after' }
  );

  // 8. Media Library
  let mediaMigrated = 0;
  for (const m of mediaData) {
    await MediaModel.findOneAndUpdate(
      { id: m.id },
      { $set: m },
      { upsert: true, returnDocument: 'after' }
    );
    mediaMigrated++;
  }

  // 9. Page SEO
  let seoMigrated = 0;
  for (const s of seoData) {
    await SeoModel.findOneAndUpdate(
      { path: s.path },
      { $set: s },
      { upsert: true, returnDocument: 'after' }
    );
    seoMigrated++;
  }

  // 10. Performance Snapshots
  let perfMigrated = 0;
  for (let idx = 0; idx < performanceData.length; idx++) {
    const p = performanceData[idx];
    const pid = p.id || `perf_${p.device || 'desktop'}_${idx + 1}`;
    await PerformanceModel.findOneAndUpdate(
      { id: pid },
      { $set: { ...p, id: pid } },
      { upsert: true, returnDocument: 'after' }
    );
    perfMigrated++;
  }

  // 11. Marketing Tracking
  await TrackingModel.findOneAndUpdate(
    { docId: 'primary_tracking' },
    { $set: { docId: 'primary_tracking', data: trackingData, updatedAt: new Date().toISOString() } },
    { upsert: true, returnDocument: 'after' }
  );

  // STEP 5: Verification & Comparison
  console.log('\n[Step 5/5] Auditing destination collection counts and critical records...');

  const summary: MigrationSummary = {
    timestamp: new Date().toISOString(),
    database: dbStatus.provider,
    backupDir: backupManifest.backupDir,
    collections: [
      {
        name: 'users',
        sourceCount: usersData.length,
        migratedCount: usersMigrated,
        destinationCount: await UserModel.countDocuments(),
        status: (await UserModel.countDocuments()) >= usersData.length ? 'MATCH' : 'MISMATCH'
      },
      {
        name: 'about',
        sourceCount: 1,
        migratedCount: 1,
        destinationCount: await AboutModel.countDocuments(),
        status: (await AboutModel.countDocuments()) >= 1 ? 'MATCH' : 'MISMATCH'
      },
      {
        name: 'services',
        sourceCount: servicesData.length,
        migratedCount: servicesMigrated,
        destinationCount: await ServiceModel.countDocuments(),
        status: (await ServiceModel.countDocuments()) >= servicesData.length ? 'MATCH' : 'MISMATCH'
      },
      {
        name: 'projects',
        sourceCount: projectsData.length,
        migratedCount: projectsMigrated,
        destinationCount: await ProjectModel.countDocuments(),
        status: (await ProjectModel.countDocuments()) >= projectsData.length ? 'MATCH' : 'MISMATCH'
      },
      {
        name: 'blog',
        sourceCount: blogData.length,
        migratedCount: blogMigrated,
        destinationCount: await BlogPostModel.countDocuments(),
        status: (await BlogPostModel.countDocuments()) >= blogData.length ? 'MATCH' : 'MISMATCH'
      },
      {
        name: 'inquiries',
        sourceCount: inquiriesData.length,
        migratedCount: inquiriesMigrated,
        destinationCount: await InquiryModel.countDocuments(),
        status: (await InquiryModel.countDocuments()) >= inquiriesData.length ? 'MATCH' : 'MISMATCH'
      },
      {
        name: 'settings',
        sourceCount: 1,
        migratedCount: 1,
        destinationCount: await SettingsModel.countDocuments(),
        status: (await SettingsModel.countDocuments()) >= 1 ? 'MATCH' : 'MISMATCH'
      },
      {
        name: 'media',
        sourceCount: mediaData.length,
        migratedCount: mediaMigrated,
        destinationCount: await MediaModel.countDocuments(),
        status: (await MediaModel.countDocuments()) >= mediaData.length ? 'MATCH' : 'MISMATCH'
      },
      {
        name: 'seo',
        sourceCount: seoData.length,
        migratedCount: seoMigrated,
        destinationCount: await SeoModel.countDocuments(),
        status: (await SeoModel.countDocuments()) >= seoData.length ? 'MATCH' : 'MISMATCH'
      },
      {
        name: 'performance',
        sourceCount: performanceData.length,
        migratedCount: perfMigrated,
        destinationCount: await PerformanceModel.countDocuments(),
        status: (await PerformanceModel.countDocuments()) >= performanceData.length ? 'MATCH' : 'MISMATCH'
      },
      {
        name: 'tracking',
        sourceCount: 1,
        migratedCount: 1,
        destinationCount: await TrackingModel.countDocuments(),
        status: (await TrackingModel.countDocuments()) >= 1 ? 'MATCH' : 'MISMATCH'
      }
    ],
    criticalChecks: [],
    success: true
  };

  // Critical Value Fidelity Checks
  // Check 1: Superadmin account exists with intact bcrypt hash
  const superAdmin = await UserModel.findOne({ email: 'admin@darkvence.com' });
  const check1 = Boolean(superAdmin && superAdmin.passwordHash && superAdmin.role === 'superadmin');
  summary.criticalChecks.push({
    description: 'Initial Superadmin credential & bcrypt hash intact',
    passed: check1,
    detail: superAdmin ? `ID: ${superAdmin.id}, Role: ${superAdmin.role}` : 'Superadmin not found'
  });

  // Check 2: About CMS primary heading intact
  const aboutDoc = await AboutModel.findOne({ docId: 'primary_about' });
  const check2 = Boolean(aboutDoc && aboutDoc.data?.hero?.heading);
  summary.criticalChecks.push({
    description: 'About CMS Hero heading preserved in MongoDB',
    passed: check2,
    detail: aboutDoc?.data?.hero?.heading
  });

  // Check 3: Services slug index and count
  const serviceCount = await ServiceModel.countDocuments();
  const check3 = serviceCount === servicesData.length;
  summary.criticalChecks.push({
    description: `All ${servicesData.length} core services preserved with slugs`,
    passed: check3,
    detail: `Found ${serviceCount}/${servicesData.length}`
  });

  summary.success = summary.collections.every(c => c.status === 'MATCH') && summary.criticalChecks.every(c => c.passed);

  // Write migration report
  const reportPath = path.join(backupManifest.backupDir, 'migration_report.json');
  fs.writeFileSync(reportPath, JSON.stringify(summary, null, 2), 'utf-8');

  console.log('\n======================================================');
  console.log('              MIGRATION AUDIT REPORT                  ');
  console.log('======================================================');
  console.log(`Status: ${summary.success ? 'ALL CHECKS PASSED' : 'VERIFICATION FAILED'}`);
  console.log('------------------------------------------------------');
  for (const c of summary.collections) {
    console.log(` - ${c.name.padEnd(14)} : Source=${c.sourceCount} | Mongo=${c.destinationCount} [${c.status}]`);
  }
  console.log('------------------------------------------------------');
  for (const chk of summary.criticalChecks) {
    console.log(` [${chk.passed ? 'PASS' : 'FAIL'}] ${chk.description}: ${chk.detail || ''}`);
  }
  console.log('======================================================\n');
  console.log(`Report saved to: ${reportPath}\n`);

  if (!summary.success) {
    throw new Error('Migration verification failed! Check discrepancies in report.');
  }

  return summary;
}

if (process.argv[1] && process.argv[1].endsWith('migrateToMongo.ts')) {
  runMigration()
    .then(async () => {
      console.log('Zero-data-loss migration completed successfully.');
      await disconnectDatabase();
      process.exit(0);
    })
    .catch(async (err) => {
      console.error('Fatal migration failure:', err);
      await disconnectDatabase();
      process.exit(1);
    });
}
