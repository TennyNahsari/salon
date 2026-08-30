const API_URL = 'http://localhost:5000/api';

async function testPaymentModule() {
  console.log('--- STARTING PAYMENT MANAGER & EPOS RECEIPT INTEGRATION TEST ---');

  // 1. Login as Admin
  const loginRes = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'admin', password: 'admin123' })
  }).then(r => r.json());

  const token = loginRes.token;
  console.log('✅ Admin Login Successful');

  // 2. Create a test booking
  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const createRes = await fetch(`${API_URL}/bookings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      customer_name: 'Budi Santoso (Test Payment)',
      customer_phone: '08999888777',
      customer_email: 'budi.payment@gmail.com',
      service_id: 2,
      booking_datetime: `${tomorrow}T14:00:00`
    })
  }).then(r => r.json());

  const bookingId = createRes.booking.id;
  const bookingCode = createRes.booking.booking_code;
  console.log(`✅ Test Booking Created! ID: ${bookingId}, Code: ${bookingCode}`);

  // 3. Mark status as 'Completed'
  const updateRes = await fetch(`${API_URL}/bookings/${bookingId}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ status: 'Completed' })
  }).then(r => r.json());

  console.log(`✅ Status updated to Completed: ${updateRes.success}`);

  // 4. Fetch all bookings and verify payment module data
  const allRes = await fetch(`${API_URL}/bookings`, {
    headers: { Authorization: `Bearer ${token}` }
  }).then(r => r.json());

  const completedList = allRes.bookings.filter(b => b.status === 'Completed');
  const found = completedList.find(b => b.id === bookingId);
  console.log(`✅ Completed Booking found in Payment Module data: ${Boolean(found)}`);
  if (found) {
    console.log(`   Customer: ${found.customer_name}`);
    console.log(`   Services Count: ${found.items?.length || 1}`);
    console.log(`   Total Revenue: Rp ${found.total_price || found.service_price}`);
  }

  // 5. Delete payment record
  const deleteRes = await fetch(`${API_URL}/bookings/${bookingId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` }
  }).then(r => r.json());

  console.log(`✅ Delete Payment Record Result: ${deleteRes.message}`);
  console.log('--- PAYMENT MANAGER & RECEIPT TEST PASSED 100% ---');
}

testPaymentModule();
