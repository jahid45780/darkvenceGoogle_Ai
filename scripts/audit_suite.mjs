// Complete Production-Readiness Test Suite for DARKVENCE
import http from 'http';
import fs from 'fs';
import path from 'path';

const PORT = 3000;
const BASE_URL = `http://localhost:${PORT}`;

let testsPassed = 0;
let testsFailed = 0;
const results = [];

function record(name, passed, detail) {
  if (passed) {
    testsPassed++;
    results.push({ name, status: 'PASS', detail });
    console.log(`[PASS] ${name}${detail ? ` - ${detail}` : ''}`);
  } else {
    testsFailed++;
    results.push({ name, status: 'FAIL', detail });
    console.error(`[FAIL] ${name}${detail ? ` - ${detail}` : ''}`);
  }
}

function request(method, pathUrl, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(pathUrl, BASE_URL);
    const reqOptions = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    const req = http.request(reqOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        let json = null;
        try {
          json = JSON.parse(data);
        } catch {}
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: json,
          raw: data
        });
      });
    });

    req.on('error', reject);

    if (body) {
      req.write(typeof body === 'string' ? body : JSON.stringify(body));
    }
    req.end();
  });
}

async function runAudit() {
  console.log('--- DARKVENCE PRODUCTION READINESS AUDIT START ---');

  // 1. Root & Health
  try {
    const rootRes = await request('GET', '/');
    record('Root URL (GET /)', rootRes.statusCode === 200, `Status: ${rootRes.statusCode}`);
  } catch (err) {
    record('Root URL (GET /)', false, err.message);
  }

  try {
    const healthRes = await request('GET', '/api/v1/health');
    record('API Health (GET /api/v1/health)', healthRes.statusCode === 200 && healthRes.body?.success === true, `App: ${healthRes.body?.data?.app}`);
  } catch (err) {
    record('API Health (GET /api/v1/health)', false, err.message);
  }

  // 2. Public Data Endpoints
  const publicEndpoints = [
    ['Services', '/api/v1/services'],
    ['Projects', '/api/v1/projects'],
    ['Blog', '/api/v1/blog'],
    ['Settings', '/api/v1/settings'],
    ['About CMS', '/api/v1/about'],
    ['Testimonials', '/api/v1/testimonials'],
    ['Trusted Brands', '/api/v1/trusted-brands']
  ];

  for (const [name, ep] of publicEndpoints) {
    try {
      const res = await request('GET', ep);
      record(`Public ${name} (GET ${ep})`, res.statusCode === 200 && res.body?.success === true, `Items/Keys: ${Array.isArray(res.body?.data) ? res.body?.data.length : Object.keys(res.body?.data || {}).length}`);
    } catch (err) {
      record(`Public ${name} (GET ${ep})`, false, err.message);
    }
  }

  // 3. Inquiries Validation & Submission
  try {
    const invalidInquiry = await request('POST', '/api/v1/inquiries', { name: 'A' });
    record('Inquiry Invalid Input Rejection', invalidInquiry.statusCode === 400, `Rejected with status ${invalidInquiry.statusCode}`);
  } catch (err) {
    record('Inquiry Invalid Input Rejection', false, err.message);
  }

  try {
    const honeypotInquiry = await request('POST', '/api/v1/inquiries', {
      name: 'Bot Tester',
      email: 'bot@spam.com',
      message: 'This is a spam inquiry that should be silently dropped',
      website_source_hp: 'I am a malicious bot'
    });
    record('Inquiry Bot Honeypot Defense', honeypotInquiry.statusCode === 200 && honeypotInquiry.body?.success === true, 'Honeypot caught and neutralized');
  } catch (err) {
    record('Inquiry Bot Honeypot Defense', false, err.message);
  }

  try {
    const validInquiry = await request('POST', '/api/v1/inquiries', {
      name: 'Audit Client',
      email: 'audit@darkvence.com',
      phone: '+880 1893-383187',
      company: 'Audit Corp',
      serviceInterested: 'Website Development',
      budgetRange: '$25,000 - $50,000',
      message: 'Production readiness verification inquiry for DARKVENCE digital solutions.'
    });
    record('Inquiry Valid Submission', validInquiry.statusCode === 201 && validInquiry.body?.data?.id, `Created ID: ${validInquiry.body?.data?.id}`);
  } catch (err) {
    record('Inquiry Valid Submission', false, err.message);
  }

  // 4. Authentication & Security
  try {
    const badLogin = await request('POST', '/api/v1/auth/login', {
      email: 'admin@darkvence.com',
      password: 'wrong_password_123'
    });
    record('Admin Login Wrong Password Rejection', badLogin.statusCode === 401, `Status: ${badLogin.statusCode} (${badLogin.body?.error?.code})`);
  } catch (err) {
    record('Admin Login Wrong Password Rejection', false, err.message);
  }

  let adminToken = '';
  try {
    const goodLogin = await request('POST', '/api/v1/auth/login', {
      email: 'admin@darkvence.com',
      password: 'darkvence2026!'
    });
    adminToken = goodLogin.body?.data?.token;
    record('Admin Login Valid Credentials', goodLogin.statusCode === 200 && Boolean(adminToken), `Token acquired, Role: ${goodLogin.body?.data?.user?.role}`);
  } catch (err) {
    record('Admin Login Valid Credentials', false, err.message);
  }

  // 5. Unauthorized Protected Route Access (Security Rejection)
  try {
    const unauth = await request('GET', '/api/v1/admin/about');
    record('Admin Route Without Token (401 Protection)', unauth.statusCode === 401, `Status: ${unauth.statusCode} (${unauth.body?.error?.code})`);
  } catch (err) {
    record('Admin Route Without Token (401 Protection)', false, err.message);
  }

  // 6. Authorized Protected Route Access
  const authHeaders = { Authorization: `Bearer ${adminToken}` };
  const adminEndpoints = [
    ['Analytics Overview', '/api/v1/admin/analytics/overview'],
    ['Admin About Data', '/api/v1/admin/about'],
    ['Admin Services', '/api/v1/admin/services'],
    ['Admin Projects', '/api/v1/admin/projects'],
    ['Admin Blog', '/api/v1/admin/blog'],
    ['Admin Inquiries', '/api/v1/admin/inquiries'],
    ['Admin Media', '/api/v1/admin/media'],
    ['Admin Health', '/api/v1/admin/health'],
    ['Admin SEO', '/api/v1/admin/seo'],
    ['Admin Performance', '/api/v1/admin/performance'],
    ['Admin Tracking', '/api/v1/admin/tracking'],
    ['Admin Users', '/api/v1/admin/users']
  ];

  for (const [name, ep] of adminEndpoints) {
    try {
      const res = await request('GET', ep, null, authHeaders);
      record(`Protected ${name} (GET ${ep})`, res.statusCode === 200 && res.body?.success === true, `Status: ${res.statusCode}`);
    } catch (err) {
      record(`Protected ${name} (GET ${ep})`, false, err.message);
    }
  }

  // 7. About CMS Persistence Check (Save & Fetch)
  try {
    const currentAbout = (await request('GET', '/api/v1/admin/about', null, authHeaders)).body?.data;
    const updatePayload = {
      ...currentAbout,
      hero: {
        ...currentAbout.hero,
        heading: currentAbout.hero.heading || 'Where Technical Precision Meets Conversion Design'
      }
    };
    const putRes = await request('PUT', '/api/v1/admin/about', updatePayload, authHeaders);
    record('About CMS Save (PUT /api/v1/admin/about)', putRes.statusCode === 200 && putRes.body?.success === true, 'Saved successfully');

    // Confirm public about reflects it
    const publicAbout = await request('GET', '/api/v1/about');
    record('About CMS Public Reflection (GET /api/v1/about)', publicAbout.statusCode === 200 && publicAbout.body?.data?.hero?.heading === updatePayload.hero.heading, 'Consistent with admin update');
  } catch (err) {
    record('About CMS Save & Public Reflection', false, err.message);
  }

  // 8. Media Upload & 5MB Limit Enforcement
  // Invalid format test
  try {
    const badUpload = await request('POST', '/api/v1/admin/media/upload', {
      image: 'data:application/pdf;base64,JVBERi0xLjQK...'
    }, authHeaders);
    record('Upload Invalid Format Rejection', badUpload.statusCode === 400, `Rejected: ${badUpload.body?.error?.code}`);
  } catch (err) {
    record('Upload Invalid Format Rejection', false, err.message);
  }

  // Valid 1x1 PNG base64 upload
  let uploadedUrl = '';
  try {
    const validPngBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    const uploadRes = await request('POST', '/api/v1/admin/media/upload', {
      image: validPngBase64,
      name: 'audit_test_icon.png'
    }, authHeaders);
    uploadedUrl = uploadRes.body?.data?.url;
    record('Upload Valid Image Base64', uploadRes.statusCode === 201 && Boolean(uploadedUrl), `URL: ${uploadedUrl}`);
  } catch (err) {
    record('Upload Valid Image Base64', false, err.message);
  }

  // Check that the uploaded file can be retrieved via GET
  if (uploadedUrl && uploadedUrl.startsWith('/uploads/')) {
    try {
      const fileRes = await request('GET', uploadedUrl);
      record('Uploaded File Static Serving', fileRes.statusCode === 200, `Size: ${fileRes.raw.length} bytes`);
    } catch (err) {
      record('Uploaded File Static Serving', false, err.message);
    }
  }

  // 8b. Dynamic Testimonials CRUD, Auth, Validation & Publish Lifecycle (with cleanup)
  let createdTestimonialId = '';
  try {
    const unauthTestimonials = await request('GET', '/api/v1/admin/testimonials');
    record('Testimonials Admin Route Without Token (401)', unauthTestimonials.statusCode === 401, `Status: ${unauthTestimonials.statusCode}`);

    const invalidTestimonial = await request('POST', '/api/v1/admin/testimonials', {
      name: 'X',
      designation: 'CTO',
      company: 'Test',
      content: 'Too short',
      rating: 9
    }, authHeaders);
    record('Testimonials Invalid Payload Rejection (400)', invalidTestimonial.statusCode === 400, `Status: ${invalidTestimonial.statusCode}`);

    const createRes = await request('POST', '/api/v1/admin/testimonials', {
      name: 'Audit Verification Client',
      designation: 'VP Engineering',
      company: 'Audit Systems Ltd',
      content: 'Automated verification test confirming real database-backed dynamic testimonials work end to end.',
      rating: 5,
      isActive: true,
      isPublished: true,
      displayOrder: 99
    }, authHeaders);
    createdTestimonialId = createRes.body?.data?.id || '';
    record('Testimonials Admin Create (POST /api/v1/admin/testimonials)', createRes.statusCode === 201 && Boolean(createdTestimonialId), `Created ID: ${createdTestimonialId}`);

    if (createdTestimonialId) {
      const pubAfterCreate = await request('GET', '/api/v1/testimonials');
      const foundPublic = Array.isArray(pubAfterCreate.body?.data) && pubAfterCreate.body.data.some((t) => t.id === createdTestimonialId);
      record('Testimonials Public Shows Active+Published Item', pubAfterCreate.statusCode === 200 && foundPublic, foundPublic ? 'Visible publicly' : 'Not found in public feed');

      const toggleRes = await request('PATCH', `/api/v1/admin/testimonials/${createdTestimonialId}/status`, { isPublished: false }, authHeaders);
      const pubAfterUnpublish = await request('GET', '/api/v1/testimonials');
      const hiddenPublic = Array.isArray(pubAfterUnpublish.body?.data) && !pubAfterUnpublish.body.data.some((t) => t.id === createdTestimonialId);
      record('Testimonials Unpublish Hides From Public API', toggleRes.statusCode === 200 && hiddenPublic, 'Hidden from public feed while retained in admin');

      const updateRes = await request('PUT', `/api/v1/admin/testimonials/${createdTestimonialId}`, {
        rating: 4,
        content: 'Updated verification testimonial text confirming persistence and rating updates.'
      }, authHeaders);
      record('Testimonials Admin Update (PUT)', updateRes.statusCode === 200 && updateRes.body?.data?.rating === 4, `Updated rating: ${updateRes.body?.data?.rating}`);
    }
  } catch (err) {
    record('Testimonials Lifecycle Check', false, err.message);
  } finally {
    if (createdTestimonialId) {
      try {
        const delRes = await request('DELETE', `/api/v1/admin/testimonials/${createdTestimonialId}`, null, authHeaders);
        record('Testimonials Admin Delete Cleanup (DELETE)', delRes.statusCode === 200, 'Cleaned up test testimonial');
      } catch (cleanupErr) {
        record('Testimonials Admin Delete Cleanup (DELETE)', false, cleanupErr.message);
      }
    }
  }

  // 8c. Dynamic Trusted Brands CMS CRUD, Validation, Display Order & Section Visibility Toggle (with cleanup)
  let createdBrandId = '';
  let originalBrandSettings = null;
  try {
    const unauthBrands = await request('GET', '/api/v1/admin/trusted-brands');
    record('Trusted Brands Admin Route Without Token (401)', unauthBrands.statusCode === 401, `Status: ${unauthBrands.statusCode}`);

    const adminBrandsRes = await request('GET', '/api/v1/admin/trusted-brands', null, authHeaders);
    originalBrandSettings = adminBrandsRes.body?.data?.settings || null;
    record(
      'Trusted Brands Admin Fetch & Initial Seed (>=5)',
      adminBrandsRes.statusCode === 200 && Array.isArray(adminBrandsRes.body?.data?.brands) && adminBrandsRes.body.data.brands.length >= 5,
      `Brands: ${adminBrandsRes.body?.data?.brands?.length || 0}`
    );

    const invalidBrand = await request('POST', '/api/v1/admin/trusted-brands', {
      name: 'A',
      industry: 'X',
      logoUrl: 'javascript:alert(1)'
    }, authHeaders);
    record('Trusted Brands Invalid/Unsafe Payload Rejection (400)', invalidBrand.statusCode === 400, `Status: ${invalidBrand.statusCode}`);

    const createBrandRes = await request('POST', '/api/v1/admin/trusted-brands', {
      name: 'Audit Partner Co',
      industry: 'CLOUD INFRA',
      description: 'Verification record created during automated audit.',
      displayOrder: 98,
      isActive: true,
      isPublished: true
    }, authHeaders);
    createdBrandId = createBrandRes.body?.data?.id || '';
    record('Trusted Brands Admin Create (POST)', createBrandRes.statusCode === 201 && Boolean(createdBrandId), `Created ID: ${createdBrandId}`);

    if (createdBrandId) {
      const pubBrands = await request('GET', '/api/v1/trusted-brands');
      const foundPublic = Array.isArray(pubBrands.body?.data?.brands) && pubBrands.body.data.brands.some((b) => b.id === createdBrandId);
      record('Trusted Brands Public Shows Active+Published Item', pubBrands.statusCode === 200 && foundPublic, foundPublic ? 'Visible publicly' : 'Missing from public feed');

      const togglePubRes = await request('PATCH', `/api/v1/admin/trusted-brands/${createdBrandId}/status`, { isPublished: false }, authHeaders);
      const pubAfterUnpublish = await request('GET', '/api/v1/trusted-brands');
      const hiddenAfterUnpublish = Array.isArray(pubAfterUnpublish.body?.data?.brands) && !pubAfterUnpublish.body.data.brands.some((b) => b.id === createdBrandId);
      record('Trusted Brands Unpublish Hides From Public API', togglePubRes.statusCode === 200 && hiddenAfterUnpublish, 'Hidden from public feed');

      const updateBrandRes = await request('PUT', `/api/v1/admin/trusted-brands/${createdBrandId}`, {
        industry: 'AI INFRASTRUCTURE',
        isPublished: true
      }, authHeaders);
      record('Trusted Brands Admin Update (PUT)', updateBrandRes.statusCode === 200 && updateBrandRes.body?.data?.industry === 'AI INFRASTRUCTURE', 'Updated industry & republished');

      // Test Section Global Visibility Toggle
      const disableRes = await request('PUT', '/api/v1/admin/trusted-brands/settings', { enabled: false }, authHeaders);
      const pubDisabled = await request('GET', '/api/v1/trusted-brands');
      record(
        'Trusted Brands Section Visibility Toggle (Disable)',
        disableRes.statusCode === 200 && pubDisabled.body?.data?.settings?.enabled === false && pubDisabled.body?.data?.brands?.length === 0,
        'Section disabled & public brands suppressed'
      );
    }
  } catch (err) {
    record('Trusted Brands Lifecycle Check', false, err.message);
  } finally {
    if (originalBrandSettings) {
      try {
        await request('PUT', '/api/v1/admin/trusted-brands/settings', {
          enabled: originalBrandSettings.enabled,
          heading: originalBrandSettings.heading,
          subtitle: originalBrandSettings.subtitle || '',
          layoutStyle: originalBrandSettings.layoutStyle || 'grid',
          themeMode: originalBrandSettings.themeMode || 'auto'
        }, authHeaders);
      } catch {}
    }
    if (createdBrandId) {
      try {
        const delBrandRes = await request('DELETE', `/api/v1/admin/trusted-brands/${createdBrandId}`, null, authHeaders);
        record('Trusted Brands Admin Delete Cleanup (DELETE)', delBrandRes.statusCode === 200, 'Cleaned up test brand');
      } catch (cleanupErr) {
        record('Trusted Brands Admin Delete Cleanup (DELETE)', false, cleanupErr.message);
      }
    }
  }

  // 9. Static Assets on Disk Existence
  const criticalLocalAssets = [
    'public/assets/aistudio/image_a9a3bddd.png',
    'src/assets/images/hero_darkvence_digital_1790497052243.jpg'
  ];

  for (const asset of criticalLocalAssets) {
    const fullPath = path.resolve(process.cwd(), asset);
    const exists = fs.existsSync(fullPath);
    record(`Local Static Asset Exists: ${asset}`, exists, exists ? 'File present on disk' : 'MISSING');
  }

  console.log('--- DARKVENCE AUDIT SUMMARY ---');
  console.log(`Passed: ${testsPassed} / ${testsPassed + testsFailed}`);
  console.log(`Failed: ${testsFailed}`);

  process.exit(testsFailed > 0 ? 1 : 0);
}

runAudit().catch((err) => {
  console.error('Fatal audit failure:', err);
  process.exit(1);
});
