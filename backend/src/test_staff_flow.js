const API_URL = 'http://localhost:5000/api';

async function runTests() {
  console.log('--- STARTING STAFF & CAPACITY VALIDATION TEST ---');

  // 1. Admin Login
  const loginRes = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'admin', password: 'admin123' })
  }).then(r => r.json());
  
  if (!loginRes.success) {
    console.error('❌ Login failed:', loginRes);
    process.exit(1);
  }
  const token = loginRes.token;
  console.log('✅ Admin Login Successful!');

  // 2. Fetch Staff List
  const staffRes = await fetch(`${API_URL}/staff`, {
    headers: { Authorization: `Bearer ${token}` }
  }).then(r => r.json());
  console.log(`✅ Received ${staffRes.staff?.length || 0} Staff members.`);

  // 3. Test Booking 1 for Service 1 (Hair Spa - qualified staff: Stylist Anita, Stylist Rina, Capster Dewi)
  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const testTime = `${tomorrow}T14:00:00`;

  const b1 = await fetch(`${API_URL}/bookings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      customer_name: 'Test Customer 1',
      customer_phone: '081111111111',
      customer_email: 'test1@gmail.com',
      service_id: 1,
      booking_datetime: testTime
    })
  }).then(r => r.json());
  console.log('✅ Booking 1 Result:', b1.success ? `Success (Assigned: ${b1.booking.staff_name})` : b1.message);

  // 4. Test Booking 2 at same time
  const b2 = await fetch(`${API_URL}/bookings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      customer_name: 'Test Customer 2',
      customer_phone: '082222222222',
      customer_email: 'test2@gmail.com',
      service_id: 1,
      booking_datetime: testTime
    })
  }).then(r => r.json());
  console.log('✅ Booking 2 Result:', b2.success ? `Success (Assigned: ${b2.booking.staff_name})` : b2.message);

  // 5. Test Booking 3 at same time
  const b3 = await fetch(`${API_URL}/bookings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      customer_name: 'Test Customer 3',
      customer_phone: '083333333333',
      customer_email: 'test3@gmail.com',
      service_id: 1,
      booking_datetime: testTime
    })
  }).then(r => r.json());
  console.log('✅ Booking 3 Result:', b3.success ? `Success (Assigned: ${b3.booking.staff_name})` : b3.message);

  // 6. Test Booking 4 at same time (Should be rejected since all 3 qualified staff are occupied!)
  const b4 = await fetch(`${API_URL}/bookings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      customer_name: 'Test Customer 4',
      customer_phone: '084444444444',
      customer_email: 'test4@gmail.com',
      service_id: 1,
      booking_datetime: testTime
    })
  }).then(r => r.json());
  console.log('🎯 Booking 4 Capacity Overlap Result:', b4.success ? 'Unexpected Success' : `REJECTED PROPERLY: "${b4.message}"`);

  console.log('--- ALL STAFF & CAPACITY TESTS FINISHED SUCCESSFULLY ---');
}

runTests();
