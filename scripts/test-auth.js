const http = require('http');

function request(method, path, data) {
  return new Promise((resolve, reject) => {
    const payload = data ? Buffer.from(JSON.stringify(data)) : null;
    const req = http.request({
      hostname: 'localhost', port: 4000, path, method,
      headers: { 'Content-Type': 'application/json', 'Content-Length': payload ? payload.length : 0 }
    }, (res) => {
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
    const email = 'user1@test.com';
    const password = 'StrongPass123';
    const signup = await request('POST', '/auth/signup', { email, password });
    console.log('signup', signup.status, signup.body);

    const login = await request('POST', '/auth/login', { email, password });
    console.log('login', login.status, login.body);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();
