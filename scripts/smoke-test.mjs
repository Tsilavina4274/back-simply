/*
Simple smoke test script for core user routes.
Run from repository root with:
  node backend/scripts/smoke-test.mjs

It will:
 - register a user with unique email
 - login
 - call GET /users/me
 - update profile
 - update settings
 - update social

Adjust API_BASE if needed.
*/

const API_BASE = process.env.API_BASE || 'http://localhost:3000';

function log(section, obj) {
  console.log('\n===', section, '===');
  console.log(JSON.stringify(obj, null, 2));
}

function rnd() {
  return Math.random().toString(36).substring(2, 8);
}

async function req(path, opts = {}) {
  const url = API_BASE.replace(/\/$/, '') + path;
  const res = await fetch(url, opts);
  const text = await res.text();
  let body;
  try { body = JSON.parse(text); } catch { body = text; }
  return { status: res.status, body };
}

(async function main(){
  try {
    const unique = Date.now().toString().slice(-6) + rnd();
    const emailA = `smokeA_${unique}@example.com`;
    const emailB = `smokeB_${unique}@example.com`;
    const password = 'Test1234!';

    // Register two users
    log('Registering user A', { email: emailA });
    const regA = await req('/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: emailA, password, name: 'Smoke A' })
    });
    log('Register A response', regA);
    if (regA.status >= 400) throw new Error('Register A failed');

    log('Registering user B', { email: emailB });
    const regB = await req('/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: emailB, password, name: 'Smoke B' })
    });
    log('Register B response', regB);
    if (regB.status >= 400) throw new Error('Register B failed');

    const idA = regA.body?.data?.user?.id;
    const idB = regB.body?.data?.user?.id;
    if (!idA || !idB) throw new Error('Missing created user ids');

    // Login as A
    log('Logging in user A', { email: emailA });
    const login = await req('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: emailA, password })
    });
    log('Login response', login);
    if (login.status >= 400) throw new Error('Login failed');

    const token = login.body?.data?.token;
    if (!token) throw new Error('No token returned');
    const authHeader = { 'Authorization': `Bearer ${token}` };

    // GET profile
    const profile = await req('/users/me', { method: 'GET', headers: authHeader });
    log('GET /users/me', profile);

    // Update profile
    const upd = await req('/users/me', {
      method: 'PUT',
      headers: { ...authHeader, 'Content-Type': 'application/json' },
      body: JSON.stringify({ firstName: 'Smoke', lastName: 'Tester', bio: 'Run by smoke-test' })
    });
    log('PUT /users/me', upd);

    // Create an image
    const img = await req('/images', {
      method: 'POST',
      headers: { ...authHeader, 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: 'https://example.com/img.jpg', price: '9.99', versionTag: 'v1', versionColor: 'blue' })
    });
    log('POST /images', img);

    // Get images
    const imgs = await req('/images', { method: 'GET', headers: authHeader });
    log('GET /images', imgs);

    // Create contenu
    const contenu = await req('/contenu', {
      method: 'POST',
      headers: { ...authHeader, 'Content-Type': 'application/json' },
      body: JSON.stringify({ titre: 'Smoke Content', urlImage: 'https://example.com/content.jpg', prix: 4.5 })
    });
    log('POST /contenu', contenu);

    // Get contenu
    const contenus = await req('/contenu', { method: 'GET', headers: authHeader });
    log('GET /contenu', contenus);

    // Create fan
    const fan = await req('/fans', {
      method: 'POST',
      headers: { ...authHeader, 'Content-Type': 'application/json' },
      body: JSON.stringify({ nom: 'Fan Smoke', initiale: 'FS', urlAvatar: '', statut: 'active', derniereActivite: new Date().toISOString(), totalDepense: 12.34 })
    });
    log('POST /fans', fan);

    // Get fans
    const fans = await req('/fans', { method: 'GET', headers: authHeader });
    log('GET /fans', fans);

    // Create a message from A to B
    const msg = await req('/messages', {
      method: 'POST',
      headers: { ...authHeader, 'Content-Type': 'application/json' },
      body: JSON.stringify({ fromId: idA, toId: idB, content: 'Hello from smoke A to B' })
    });
    log('POST /messages', msg);

    // Get messages between A and B
    const msgs = await req(`/messages?from=${encodeURIComponent(idA)}&to=${encodeURIComponent(idB)}`, { method: 'GET', headers: authHeader });
    log('GET /messages', msgs);

    console.log('\nSMOKE TEST COMPLETED — inspect responses above for any failures.');
  } catch (err) {
    console.error('Smoke test error:', err);
    process.exit(2);
  }
})();
