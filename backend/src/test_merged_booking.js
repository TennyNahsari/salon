const API_URL = 'http://localhost:5000/api';

async function testMergedBooking() {
  console.log('--- STARTING MULTI-SERVICE MERGED PENDING BOOKING TEST ---');

  const randomDay = Math.floor(10 + Math.random() * 15);
  const futureDate = `2026-09-${randomDay}`;
  const uniqueName = `Customer Test ${Date.now()}`;
  const phone = `085${Math.floor(10000000 + Math.random() * 90000000)}`;

  // 1. Create first booking (Hair Spa - Service 1)
  console.log('1. Creating First Booking (Hair Spa)...');
  const res1 = await fetch(`${API_URL}/bookings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      customer_name: uniqueName,
      customer_phone: phone,
      customer_email: 'test@gmail.com',
      service_id: 1,
      booking_datetime: `${futureDate}T10:00:00`
    })
  }).then(r => r.json());

  if (!res1.success) {
    console.error('❌ First booking failed:', res1);
    process.exit(1);
  }

  const firstCode = res1.booking.booking_code;
  console.log(`✅ First Booking Created! Code: ${firstCode}, Total Price: Rp ${res1.booking.total_price}`);

  // 2. Create second booking with SAME Name & Phone while first is Pending (Facial - Service 3)
  console.log('2. Creating Second Booking with SAME Name & Phone (Organic Facial)...');
  const res2 = await fetch(`${API_URL}/bookings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      customer_name: uniqueName,
      customer_phone: phone,
      customer_email: 'test@gmail.com',
      service_id: 3,
      booking_datetime: `${futureDate}T11:30:00`
    })
  }).then(r => r.json());

  if (!res2.success) {
    console.error('❌ Second booking failed:', res2);
    process.exit(1);
  }

  const secondCode = res2.booking.booking_code;
  console.log(`✅ Second Booking Result: is_merged = ${res2.is_merged}`);
  console.log(`   Message: "${res2.message}"`);
  console.log(`   Merged Booking Code: ${secondCode} (Matches First: ${secondCode === firstCode})`);
  console.log(`   Merged Items Count: ${res2.booking.items?.length || 0}`);
  console.log(`   Combined Total Price: Rp ${res2.booking.total_price}`);

  if (secondCode === firstCode && res2.booking.items?.length === 2) {
    console.log('🎉 MULTI-SERVICE MERGED PENDING BOOKING TEST PASSED 100%!');
  } else {
    console.error('❌ Merging test failed!');
    process.exit(1);
  }
}

testMergedBooking();
