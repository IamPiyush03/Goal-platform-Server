const http = require('http');

function request(method, path, data, token) {
  return new Promise((resolve, reject) => {
    const payload = data ? Buffer.from(JSON.stringify(data)) : null;
    const headers = { 'Content-Type': 'application/json' };
    if (payload) headers['Content-Length'] = payload.length;
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const req = http.request({ hostname: 'localhost', port: 4000, path, method, headers }, (res) => {
      let body = '';
      res.on('data', (c) => body += c);
      res.on('end', () => resolve({ status: res.statusCode, body }));
    });
    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

(async () => {
  try {
    const email = 'user2@test.com';
    const password = 'StrongPass123';

    const signup = await request('POST', '/auth/signup', { email, password });
    console.log('signup', signup.status);

    const login = await request('POST', '/auth/login', { email, password });
    const token = JSON.parse(login.body).token;
    console.log('login', login.status, token ? 'token ok' : 'no token');

    const created = await request('POST', '/goals', { title: 'Learn ML', description: 'From basics', timeline: '8 weeks' }, token);
    console.log('create', created.status);
    const goal = JSON.parse(created.body);

    const list = await request('GET', '/goals', null, token);
    console.log('list', list.status, list.body);

    const fetched = await request('GET', `/goals/${goal._id}`, null, token);
    console.log('get', fetched.status);

    const updated = await request('PUT', `/goals/${goal._id}`, { progress: 25 }, token);
    console.log('update', updated.status);

    const removed = await request('DELETE', `/goals/${goal._id}`, null, token);
    console.log('delete', removed.status);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();
