// Comprehensive automated test script for NetSentinel AI
const BASE = 'http://localhost:5000/api';

async function req(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    }
  });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, ok: res.ok, data };
}

let passed = 0;
let failed = 0;

function assert(condition, testName, extraInfo = '') {
  if (condition) {
    console.log(`[PASS] ${testName}`);
    passed++;
  } else {
    console.error(`[FAIL] ${testName} - ${extraInfo}`);
    failed++;
  }
}

async function runTests() {
  console.log('=== NetSentinel AI Verification Test Suite ===\n');

  // 1. Health check
  const health = await req('/health');
  assert(health.ok && health.data.database === 'connected', '1. GET /api/health reports database connected', JSON.stringify(health.data));

  // 2. Administrator login with seeded credentials
  const adminLogin = await req('/auth/admin-login', {
    method: 'POST',
    body: JSON.stringify({ email: 'prasannashreeyash@gmail.com', password: 'Admin@NetSentinel2026!' })
  });
  assert(adminLogin.ok && adminLogin.data.user?.role === 'admin', '2. POST /api/auth/admin-login succeeds for admin', JSON.stringify(adminLogin.data));
  const adminToken = adminLogin.data.token;

  // 3. Normal user registration
  const testUserEmail = `testuser_${Date.now()}@example.com`;
  const userRegister = await req('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name: 'Alice Sentinel', email: testUserEmail, password: 'SecureUserPass123!' })
  });
  assert(userRegister.status === 201 && userRegister.data.user?.role === 'user', '3. POST /api/auth/register creates account with role="user"', JSON.stringify(userRegister.data));
  const userToken = userRegister.data.token;
  const userId = userRegister.data.user?._id;

  // 4. Attempt Admin Login with regular user account (MUST FAIL)
  const userAttemptAdmin = await req('/auth/admin-login', {
    method: 'POST',
    body: JSON.stringify({ email: testUserEmail, password: 'SecureUserPass123!' })
  });
  assert(userAttemptAdmin.status === 403, '4. POST /api/auth/admin-login correctly rejects non-admin user (403 Forbidden)', JSON.stringify(userAttemptAdmin.data));

  // 5. User Login at standard login endpoint
  const userLogin = await req('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: testUserEmail, password: 'SecureUserPass123!' })
  });
  assert(userLogin.ok && userLogin.data.user?.role === 'user', '5. POST /api/auth/login succeeds for normal user', JSON.stringify(userLogin.data));

  // 6. Password Reset Flow
  const forgot = await req('/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email: testUserEmail })
  });
  assert(forgot.ok && Boolean(forgot.data.resetToken), '6a. POST /api/auth/forgot-password issues reset token', JSON.stringify(forgot.data));

  const reset = await req('/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({ token: forgot.data.resetToken, newPassword: 'UpdatedPassword2026!' })
  });
  assert(reset.ok, '6b. POST /api/auth/reset-password resets password successfully', JSON.stringify(reset.data));

  const loginAfterReset = await req('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: testUserEmail, password: 'UpdatedPassword2026!' })
  });
  assert(loginAfterReset.ok, '6c. POST /api/auth/login works with newly updated password');
  const freshUserToken = loginAfterReset.data.token;

  // 7. Automated Problem Guidance
  const guidanceReq = await req('/reports/guidance', {
    method: 'POST',
    headers: { Authorization: `Bearer ${freshUserToken}` },
    body: JSON.stringify({
      title: 'TypeError: Cannot read property map of undefined in dashboard component',
      description: 'The React application crashes when user data is loading because the response is null.',
      category: 'Source-code errors or bugs',
      errorMessage: 'Uncaught TypeError: Cannot read properties of undefined (reading "map") at Dashboard.jsx:42',
      codeSnippet: 'const renderItems = (items) => items.map(i => <div key={i.id}>{i.name}</div>);'
    })
  });
  assert(guidanceReq.ok && guidanceReq.data.category === 'Source-code errors or bugs' && guidanceReq.data.troubleshootingSteps?.length > 0, '7. POST /api/reports/guidance returns rule-based diagnosis and safe troubleshooting steps', JSON.stringify(guidanceReq.data));

  // 8. Submit Security Problem with Code Snippet & Attachment
  const sampleAttachment = {
    name: 'crash_screenshot.png',
    mimeType: 'image/png',
    size: 2048,
    dataUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
  };

  const submitComplaint = await req('/reports', {
    method: 'POST',
    headers: { Authorization: `Bearer ${freshUserToken}` },
    body: JSON.stringify({
      title: 'Memory leak and unhandled promise rejection in API client',
      description: 'Observed severe memory consumption and socket hangs when polling event feeds.',
      category: 'Source-code errors or bugs',
      affectedSystem: 'Event Telemetry Collector',
      errorMessage: 'UnhandledPromiseRejectionWarning: Unhandled promise rejection Error: socket hang up',
      codeSnippet: 'async function poll() { while(true) { await fetch(url); } }',
      attachment: sampleAttachment
    })
  });
  assert(submitComplaint.status === 201 && submitComplaint.data.incidentId?.startsWith('NS-COMP-'), '8. POST /api/reports creates complaint with unique Complaint ID (NS-COMP-*) and automated guidance', JSON.stringify(submitComplaint.data.incidentId));
  const complaintId = submitComplaint.data._id;
  const complaintIncidentId = submitComplaint.data.incidentId;

  // 9. User fetches own complaints
  const userComplaints = await req('/reports', {
    headers: { Authorization: `Bearer ${freshUserToken}` }
  });
  assert(userComplaints.ok && userComplaints.data.some(c => c.incidentId === complaintIncidentId), '9. GET /api/reports lists user-submitted complaints for the author');

  // 10. Administrator views all complaints
  const adminComplaints = await req('/reports', {
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  assert(adminComplaints.ok && adminComplaints.data.some(c => c.incidentId === complaintIncidentId), '10. GET /api/reports gives administrator access to all user complaints');

  // 11. Administrator performs Investigation & Code Correction
  const adminInvestigate = await req(`/reports/${complaintId}`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({
      status: 'Under Investigation',
      severity: 'High',
      assignee: 'Prasanna (SOC Lead)',
      investigationFindings: 'Identified unbounded loop without delay or connection reuse causing socket pool exhaustion.',
      suspectedCause: 'Infinite async loop lacking cancellation token and backoff interval.',
      remediation: 'Implement exponential backoff, abort controller, and reuse HTTP Keep-Alive agent.',
      resolutionNotes: 'Patched collector polling logic with interval timer and signal handler.',
      codeCorrection: {
        originalCode: 'async function poll() { while(true) { await fetch(url); } }',
        reportedError: 'UnhandledPromiseRejectionWarning: Unhandled promise rejection Error: socket hang up',
        suspectedCause: 'Unbounded while(true) loop overwhelms Node.js socket pool without sleep.',
        correctedCode: 'async function poll(signal) {\n  const intervalMs = 5000;\n  while (!signal?.aborted) {\n    try {\n      const res = await fetch(url, { signal });\n      await handleResponse(res);\n    } catch (err) {\n      console.error("Poll error:", err.message);\n    }\n    await new Promise(r => setTimeout(r, intervalMs));\n  }\n}',
        explanation: 'Added an interval delay between iterations and support for AbortSignal cancellation to safely manage connection lifecycle.',
        verificationStatus: 'Verified & Tested'
      },
      note: 'Investigated memory consumption. Code correction and backoff tested in sandbox.'
    })
  });
  assert(adminInvestigate.ok && adminInvestigate.data.status === 'Under Investigation' && adminInvestigate.data.codeCorrection?.correctedCode?.length > 0, '11. PATCH /api/reports/:id updates investigation, code correction, and resolution status', JSON.stringify(adminInvestigate.data.status));

  // 12. User opens complaint details and reads admin investigation updates
  const userComplaintDetails = await req(`/reports/${complaintId}`, {
    headers: { Authorization: `Bearer ${freshUserToken}` }
  });
  assert(
    userComplaintDetails.ok &&
    userComplaintDetails.data.status === 'Under Investigation' &&
    userComplaintDetails.data.codeCorrection?.correctedCode?.includes('intervalMs') &&
    userComplaintDetails.data.updates?.length >= 2,
    '12. User GET /api/reports/:id verifies updated status, admin notes, and corrected code'
  );

  // 13. Regular user attempting to update complaint status (MUST FAIL - unauthorized)
  const userUnauthorizedUpdate = await req(`/reports/${complaintId}`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${freshUserToken}` },
    body: JSON.stringify({ status: 'Resolved', severity: 'Low' })
  });
  assert(userUnauthorizedUpdate.status === 403, '13. Regular user cannot update complaint status/severity (403 Admin required)');

  // 14. Admin marks complaint as Resolved
  const resolveComplaint = await req(`/reports/${complaintId}`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({
      status: 'Resolved',
      resolutionNotes: 'Fix verified by QA and deployed to staging telemetry cluster.',
      note: 'Incident marked as Resolved.'
    })
  });
  assert(resolveComplaint.ok && resolveComplaint.data.status === 'Resolved', '14. Administrator successfully marks complaint as Resolved');

  // 15. Admin Overview Metrics
  const adminOverview = await req('/admin/overview', {
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  assert(
    adminOverview.ok &&
    adminOverview.data.totalUsers >= 2 &&
    adminOverview.data.totalComplaints >= 1,
    '15. GET /api/admin/overview returns aggregated statistics for dashboard cards',
    JSON.stringify(adminOverview.data)
  );

  // 16. Existing NetSentinel telemetry & dashboard metrics
  const dashboard = await req('/dashboard', {
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  assert(dashboard.ok && dashboard.data.timeline?.length > 0 && dashboard.data.endpoints === 128, '16. GET /api/dashboard returns security timeline, risk score, and endpoint metrics');

  // 17. Telemetry simulation controls
  const simTick = await req('/demo/tick', {
    method: 'POST',
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  assert(simTick.status === 201, '17. POST /api/demo/tick generates simulated telemetry event');

  console.log(`\n========================================`);
  console.log(`Test Results: ${passed} PASSED, ${failed} FAILED`);
  console.log(`========================================\n`);

  if (failed > 0) process.exit(1);
}

runTests().catch(e => {
  console.error('Fatal test error:', e);
  process.exit(1);
});
