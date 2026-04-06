fetch('http://localhost:5000/api/signup', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ fullName: 'test', email: 'test1@test.com', password: 'password' })
}).then(res => res.text()).then(t => console.log('Response:', t)).catch(console.error);
