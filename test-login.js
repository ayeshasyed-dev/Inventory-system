async function testLogin() {
  try {
    const res = await fetch('https://inventory-system-l9fy.onrender.com/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'syedayesha@gmail.com',
        password: 'ayesha@2005'
      })
    });
    const data = await res.json();
    console.log('Status:', res.status);
    console.log('Data:', data);
  } catch (error) {
    console.log('Error:', error);
  }
}

testLogin();
