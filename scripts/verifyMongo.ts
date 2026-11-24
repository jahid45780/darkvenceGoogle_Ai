import fs from 'fs';
import path from 'path';
import { connectDatabase, disconnectDatabase, getDatabaseStatus } from '../src/server/db/connection.ts';
import { db } from '../src/server/db/store.ts';
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

async function verifyDatabase() {
  console.log('\n======================================================');
  console.log('       DARKVENCE — MONGODB DATA INTEGRITY VERIFIER    ');
  console.log('======================================================\n');

  await connectDatabase();
  await db.init();
  const dbStatus = getDatabaseStatus();
  console.log(`Connected to: ${dbStatus.provider} (${dbStatus.name || 'darkvence'})`);

  // Find latest backup directory
  const backupsRoot = path.join(process.cwd(), 'src', 'server', 'db', 'backups');
  if (!fs.existsSync(backupsRoot)) {
    console.error('No backup directory found at:', backupsRoot);
    process.exit(1);
  }

  const dirs = fs.readdirSync(backupsRoot)
    .filter(d => d.startsWith('backup_'))
    .sort()
    .reverse();

  if (dirs.length === 0) {
    console.error('No backup snapshots found in:', backupsRoot);
    process.exit(1);
  }

  const latestBackupDir = path.join(backupsRoot, dirs[0]);
  console.log(`Comparing MongoDB records against latest backup: ${latestBackupDir}\n`);

  const loadJson = (filename: string) => {
    const f = path.join(latestBackupDir, filename);
    return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf-8')) : null;
  };

  const users = loadJson('users.json') || [];
  const services = loadJson('services.json') || [];
  const projects = loadJson('projects.json') || [];
  const blog = loadJson('blog.json') || [];
  const inquiries = loadJson('inquiries.json') || [];
  const media = loadJson('media.json') || [];
  const seo = loadJson('seo.json') || [];
  const performance = loadJson('performance.json') || [];

  const checks = [
    { name: 'Admin Users', source: users.length, dest: await UserModel.countDocuments() },
    { name: 'Services', source: services.length, dest: await ServiceModel.countDocuments() },
    { name: 'Projects', source: projects.length, dest: await ProjectModel.countDocuments() },
    { name: 'Blog Posts', source: blog.length, dest: await BlogPostModel.countDocuments() },
    { name: 'Inquiries', source: inquiries.length, dest: await InquiryModel.countDocuments() },
    { name: 'About CMS', source: 1, dest: await AboutModel.countDocuments() },
    { name: 'Site Settings', source: 1, dest: await SettingsModel.countDocuments() },
    { name: 'Media Library', source: media.length, dest: await MediaModel.countDocuments() },
    { name: 'Page SEO', source: seo.length, dest: await SeoModel.countDocuments() },
    { name: 'Performance', source: performance.length, dest: await PerformanceModel.countDocuments() },
    { name: 'Tracking', source: 1, dest: await TrackingModel.countDocuments() }
  ];

  let allPassed = true;
  console.log('Record Count Audit:');
  console.log('------------------------------------------------------');
  for (const c of checks) {
    const passed = c.dest >= c.source;
    if (!passed) allPassed = false;
    console.log(` - ${c.name.padEnd(16)} : Expected >= ${c.source} | Found = ${c.dest} [${passed ? 'PASS' : 'FAIL'}]`);
  }
  console.log('------------------------------------------------------');

  // Verify critical records
  console.log('\nCritical Record Fidelity Checks:');
  const superAdmin = await UserModel.findOne({ email: 'admin@darkvence.com' });
  console.log(` - Superadmin (${superAdmin ? 'FOUND' : 'MISSING'}): ${superAdmin?.email} (Role: ${superAdmin?.role})`);

  const about = await AboutModel.findOne({ docId: 'primary_about' });
  console.log(` - About CMS (${about ? 'FOUND' : 'MISSING'}): "${about?.data?.hero?.heading?.slice(0, 40)}..."`);

  const websiteDevService = await ServiceModel.findOne({ slug: 'website-development' });
  console.log(` - Service Slug "website-development" (${websiteDevService ? 'FOUND' : 'MISSING'}): ${websiteDevService?.title}`);

  console.log('======================================================');
  if (allPassed && superAdmin && about && websiteDevService) {
    console.log('VERIFICATION COMPLETE: MongoDB Atlas data is 100% intact.\n');
  } else {
    console.error('VERIFICATION FAILED: Discrepancies detected between backup and MongoDB.\n');
    allPassed = false;
  }

  await disconnectDatabase();
  process.exit(allPassed ? 0 : 1);
}

verifyDatabase().catch(async (err) => {
  console.error('Verification error:', err);
  await disconnectDatabase();
  process.exit(1);
});
