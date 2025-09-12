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
    const email = 'user3@test.com';
    const password = 'StrongPass123';

    await request('POST', '/auth/signup', { email, password });
    const login = await request('POST', '/auth/login', { email, password });
    const token = JSON.parse(login.body).token;

    const created = await request('POST', '/goals', { title: 'Learn ML', description: 'Basics', timeline: '4 weeks' }, token);
    const goal = JSON.parse(created.body);

    const chat = await request('POST', '/chat', { goalId: goal._id, message: 'Give me a 1-week plan to start.' }, token);
    console.log('chat', chat.status, chat.body);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();
