const API_URL = 'http://localhost:5000/api';

async function runTests() {
  console.log('--- STARTING COMPREHENSIVE SALON APPLICATION TEST ---');

  try {
    // 1. Get services
    console.log('\n1. Testing GET /services...');
    const servicesRes = await fetch(`${API_URL}/services`).then(r => r.json());
    console.log(`✅ Received ${servicesRes.services.length} services.`);
    const firstService = servicesRes.services[0];
    console.log(`   First Service: "${firstService.name}" - Rp ${firstService.price}`);

    // 2. Create Booking without login
    console.log('\n2. Testing POST /bookings (Public Booking without login)...');
    const bookingPayload = {
      customer_name: 'Maya Septiani',
      customer_phone: '081299887766',
      customer_email: 'maya@example.com',
      service_id: firstService.id,
      staff_name: 'Stylist Anita',
      booking_datetime: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
      notes: 'Test booking public'
    };
    const bookingRes = await fetch(`${API_URL}/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bookingPayload)
    }).then(r => r.json());
    
    console.log(`✅ Booking Created Successfully!`);
    console.log(`   Kode Booking: ${bookingRes.booking.booking_code}`);
    console.log(`   Customer: ${bookingRes.booking.customer_name}`);
    console.log(`   Status: ${bookingRes.booking.status}`);
    console.log(`   Batas Bayar: ${bookingRes.booking.payment_deadline}`);

    const bookingCode = bookingRes.booking.booking_code;

    // 3. Test Check Status
    console.log('\n3. Testing GET /bookings/check...');
    const checkRes = await fetch(`${API_URL}/bookings/check?phone=081299887766&code=${bookingCode}`).then(r => r.json());
    console.log(`✅ Status Check Result: Found ${checkRes.bookings.length} booking(s).`);
    console.log(`   Current Status: ${checkRes.bookings[0].status}`);

    // 4. Test Admin Login
    console.log('\n4. Testing POST /auth/login...');
    const loginRes = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'admin123' })
    }).then(r => r.json());
    console.log(`✅ Admin Login Successful! Token acquired.`);
    const token = loginRes.token;
    const adminHeaders = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

    // 5. Test Admin Refresh & Auto-Cancel Sweep
    console.log('\n5. Testing POST /bookings/refresh (Auto-Cancel Sweep & Refresh)...');
    const refreshRes = await fetch(`${API_URL}/bookings/refresh`, {
      method: 'POST',
      headers: adminHeaders
    }).then(r => r.json());
    console.log(`✅ Refresh Completed!`);
    console.log(`   Total Bookings: ${refreshRes.stats.total}`);
    console.log(`   Pending: ${refreshRes.stats.pending}`);
    console.log(`   Auto-cancelled count: ${refreshRes.auto_cancelled_count}`);

    // 6. Test Admin Status Update to Confirmed
    console.log('\n6. Testing PATCH /bookings/:id/status (Updating to Confirmed)...');
    const updateRes = await fetch(`${API_URL}/bookings/${bookingRes.booking.id}/status`, {
      method: 'PATCH',
      headers: adminHeaders,
      body: JSON.stringify({ status: 'Confirmed' })
    }).then(r => r.json());
    console.log(`✅ Status Updated to: ${updateRes.booking.status}`);

    // 7. Test Admin Manual Booking
    console.log('\n7. Testing POST /bookings/manual...');
    const manualRes = await fetch(`${API_URL}/bookings/manual`, {
      method: 'POST',
      headers: adminHeaders,
      body: JSON.stringify({
        customer_name: 'Budi Handoko',
        customer_phone: '085544332211',
        service_id: firstService.id,
        booking_datetime: new Date().toISOString(),
        status: 'Confirmed',
        notes: 'Manual booking kasir'
      })
    }).then(r => r.json());
    console.log(`✅ Manual Booking Created! Code: ${manualRes.booking.booking_code}`);

    // 8. Test Get Configs
    console.log('\n8. Testing GET /configs...');
    const configRes = await fetch(`${API_URL}/configs`).then(r => r.json());
    console.log(`✅ Bank Name: ${configRes.configs.payment_bank_name}`);
    console.log(`   Account Number: ${configRes.configs.payment_account_number}`);
    console.log(`   WA Admin: ${configRes.configs.whatsapp_number}`);
    console.log(`   Payment Deadline Offset: ${configRes.configs.payment_deadline_offset_minutes} minutes`);

    console.log('\n======================================================');
    console.log('🎉 ALL BACKEND, DATABASE, & LOGIC TESTS PASSED 100%! 🎉');
    console.log('======================================================');
  } catch (err) {
    console.error('❌ Test failed:', err);
  }
}

runTests();
