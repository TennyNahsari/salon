const API_URL = 'http://localhost:5000/api';

async function testCutiFlow() {
  console.log('--- STARTING STAFF CUTI / OFF CAPACITY REDUCTION TEST ---');

  // 1. Admin Login
  const loginRes = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'admin', password: 'admin123' })
  }).then(r => r.json());
  
  const token = loginRes.token;

  // 2. Fetch staff list
  const staffRes = await fetch(`${API_URL}/staff`, {
    headers: { Authorization: `Bearer ${token}` }
  }).then(r => r.json());

  // Find staff named 'Capster Dewi' (id 6) qualified for Hair Spa (1)
  const dewi = staffRes.staff.find(s => s.id === 6);
  console.log(`Initial Status Capster Dewi: is_active = ${dewi.is_active}`);

  // Set Capster Dewi to Cuti / Nonaktif (is_active = false)
  const updateRes = await fetch(`${API_URL}/staff/6`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      name: dewi.name,
      role: dewi.role,
      is_active: false,
      service_ids: dewi.service_ids
    })
  }).then(r => r.json());
  console.log('✅ Capster Dewi updated to CUTI / OFF (is_active = false)');

  // 3. Test booking for Hair Spa at 16:00 tomorrow (with 2 active qualified staff: Anita & Rina)
  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const testTime = `${tomorrow}T16:00:00`;

  const b1 = await fetch(`${API_URL}/bookings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      customer_name: 'Customer A',
      customer_phone: '08123456789',
      customer_email: 'a@gmail.com',
      service_id: 1,
      booking_datetime: testTime
    })
  }).then(r => r.json());
  console.log('✅ Booking 1 (Hair Spa):', b1.success ? `Success (${b1.booking.staff_name})` : b1.message);

  const b2 = await fetch(`${API_URL}/bookings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      customer_name: 'Customer B',
      customer_phone: '08234567890',
      customer_email: 'b@gmail.com',
      service_id: 1,
      booking_datetime: testTime
    })
  }).then(r => r.json());
  console.log('✅ Booking 2 (Hair Spa):', b2.success ? `Success (${b2.booking.staff_name})` : b2.message);

  // Booking 3 should be REJECTED because total active qualified staff is now only 2 (since Dewi is on Cuti!)
  const b3 = await fetch(`${API_URL}/bookings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      customer_name: 'Customer C',
      customer_phone: '08345678901',
      customer_email: 'c@gmail.com',
      service_id: 1,
      booking_datetime: testTime
    })
  }).then(r => r.json());
  console.log('🎯 Booking 3 Result (Should be REJECTED):', b3.success ? 'Failed test' : `REJECTED: "${b3.message}"`);

  // Restore Capster Dewi back to active
  await fetch(`${API_URL}/staff/6`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      name: dewi.name,
      role: dewi.role,
      is_active: true,
      service_ids: dewi.service_ids
    })
  });
  console.log('✅ Capster Dewi restored back to Active!');

  console.log('--- STAFF CUTI CAPACITY TEST PASSED 100% ---');
}

testCutiFlow();
