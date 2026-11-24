import readline from 'readline';
import { db } from '../src/server/db/store.ts';
import { connectDatabase, disconnectDatabase } from '../src/server/db/connection.ts';
import { UserModel } from '../src/server/db/models/index.ts';

// Helper to ask a question via readline
function askQuestion(query: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  return new Promise((resolve) => {
    rl.question(query, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

// Helper to securely ask for password with asterisk masking
function askPassword(query: string): Promise<string> {
  return new Promise((resolve) => {
    // If running in non-interactive shell (piped or CI), read line directly
    if (!process.stdin.isTTY) {
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });
      rl.question(query, (answer) => {
        rl.close();
        resolve(answer.trim());
      });
      return;
    }

    process.stdout.write(query);
    let password = '';

    if (process.stdin.setRawMode) {
      process.stdin.setRawMode(true);
    }
    process.stdin.resume();

    const onData = (chunk: Buffer) => {
      const char = chunk.toString();

      // Enter / Return
      if (char === '\r' || char === '\n' || char === '\u0004') {
        if (process.stdin.setRawMode) {
          process.stdin.setRawMode(false);
        }
        process.stdin.pause();
        process.stdin.removeListener('data', onData);
        process.stdout.write('\n');
        resolve(password.trim());
      } else if (char === '\u0003') {
        // Ctrl+C
        process.stdout.write('\n[Aborted by user]\n');
        process.exit(1);
      } else if (char === '\b' || char === '\x7f') {
        // Backspace
        if (password.length > 0) {
          password = password.slice(0, -1);
          process.stdout.write('\b \b');
        }
      } else {
        password += char;
        process.stdout.write('*');
      }
    };

    process.stdin.on('data', onData);
  });
}

// Parse optional CLI arguments for non-interactive execution
function parseArgs(): { name?: string; email?: string; password?: string; role?: 'superadmin' | 'admin' } {
  const args = process.argv.slice(2);
  const parsed: { name?: string; email?: string; password?: string; role?: 'superadmin' | 'admin' } = {};

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--name' && args[i + 1]) parsed.name = args[++i];
    if (args[i] === '--email' && args[i + 1]) parsed.email = args[++i];
    if (args[i] === '--password' && args[i + 1]) parsed.password = args[++i];
    if (args[i] === '--role' && args[i + 1]) parsed.role = args[++i] as any;
  }

  // Also check environment variables
  if (!parsed.name && process.env.NEW_ADMIN_NAME) parsed.name = process.env.NEW_ADMIN_NAME;
  if (!parsed.email && process.env.NEW_ADMIN_EMAIL) parsed.email = process.env.NEW_ADMIN_EMAIL;
  if (!parsed.password && process.env.NEW_ADMIN_PASSWORD) parsed.password = process.env.NEW_ADMIN_PASSWORD;

  return parsed;
}

async function main() {
  console.log('\n======================================================');
  console.log('       DARKVENCE — Administrator Initialization       ');
  console.log('======================================================\n');
  console.log('Connecting to database...');

  // Initialize and connect to database
  await connectDatabase();
  await db.init();

  // Inspect existing admins count
  const existingAdmins = db.getAdminUsers();
  console.log(`Connected. Current registered administrators: ${existingAdmins.length}\n`);

  const cliArgs = parseArgs();

  // 1. Prompt for Name
  let name = cliArgs.name || '';
  while (!name || name.trim().length < 2) {
    name = await askQuestion('Enter Admin Full Name: ');
    if (name.trim().length < 2) {
      console.log('Name must be at least 2 characters long. Please try again.');
    }
  }

  // 2. Prompt for Email
  let email = cliArgs.email || '';
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  while (!email || !emailRegex.test(email.trim())) {
    email = await askQuestion('Enter Admin Email Address: ');
    if (!emailRegex.test(email.trim())) {
      console.log('Invalid email address format. Please try again.');
    }
  }

  // Check for duplicate account early
  const duplicate = db.findAdminByEmail(email.trim());
  if (duplicate) {
    console.error(`\n[ERROR] An administrator with email "${email.trim()}" already exists.`);
    console.error(`Account ID: ${duplicate.id} | Role: ${duplicate.role}`);
    console.error('Please choose a different email or log in with your existing credentials.\n');
    await disconnectDatabase();
    process.exit(1);
  }

  // 3. Prompt for Password
  let password = cliArgs.password || '';
  while (!password || password.length < 6) {
    password = await askPassword('Enter Admin Password (min 6 characters): ');
    if (password.length < 6) {
      console.log('Password must be at least 6 characters long. Please try again.');
    }
  }

  // 4. Role Assignment
  const role: 'superadmin' | 'admin' = (cliArgs.role === 'admin' ? 'admin' : 'superadmin');

  console.log('\nHashing password and creating administrator record in database...');

  try {
    const newAdmin = await db.createAdminUser({
      name: name.trim(),
      email: email.trim(),
      password,
      role
    });

    // Verify record in MongoDB
    await UserModel.findOne({ id: newAdmin.id });

    console.log('\n======================================================');
    console.log('     ADMINISTRATOR ACCOUNT CREATED SUCCESSFULLY       ');
    console.log('======================================================');
    console.log(` User ID : ${newAdmin.id}`);
    console.log(` Name    : ${newAdmin.name}`);
    console.log(` Email   : ${newAdmin.email}`);
    console.log(` Role    : ${newAdmin.role}`);
    console.log(` Created : ${newAdmin.createdAt}`);
    console.log('======================================================\n');
    console.log('Next Steps:');
    console.log('1. Start your local server: npm run dev');
    console.log('2. Open the application:    http://localhost:3000');
    console.log('3. Log in with your new administrative credentials.');
    console.log('   (Click "Admin CMS Portal" in the footer or navigate to Admin)');
    console.log('\nHappy engineering!\n');

    await disconnectDatabase();
    process.exit(0);
  } catch (err: any) {
    console.error(`\n[ERROR] Failed to create administrator: ${err.message}\n`);
    await disconnectDatabase();
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('\nFatal initialization error:', err);
  process.exit(1);
});
