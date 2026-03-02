// import fetch from 'node-fetch'; // Not needed in Node 18+

async function testLogin() {
  const url = 'http://localhost:3000/api/auth/login';
  const body = {
    username: 'aracelit',
    code: 'A955118'
  };

  console.log('Testing login endpoint:', url);
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Login failed:', error);
  }
}

testLogin();
