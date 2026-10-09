import { createServer } from 'http';
import app from '../src/app';
import { assert } from 'console';
import { initSocket } from '../src/socket';

const PORT = 5005;
const BASE_URL = `http://localhost:${PORT}/api`;
const server = createServer(app);
initSocket(server);


const runTests = async () => {
  console.log('--- Starting API Tests ---\n');

  try {
    // ======================================
    // 1. CUSTOMER ENDPOINTS
    // ======================================
    console.log('[TEST] POST /customers (Valid)');
    const c1 = await fetch(`${BASE_URL}/customers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'John Doe', email: 'john@example.com' })
    });
    const c1Data = await c1.json();
    assert(c1.status === 201 || c1.status === 200, 'Failed to create customer');
    assert(c1Data.success === true, 'Response should be successful');
    const customerId = c1Data.data.id;
    console.log('✔ Passed\n');

    console.log('[TEST] POST /customers (Invalid - missing email)');
    const c2 = await fetch(`${BASE_URL}/customers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Jane Doe' })
    });
    const c2Data = await c2.json();
    assert(c2.status === 400, 'Expected 400 for missing email');
    assert(c2Data.success === false, 'Expected success=false');
    console.log('✔ Passed\n');

    // ======================================
    // 2. TICKET ENDPOINTS
    // ======================================
    console.log('[TEST] POST /tickets (Valid with initial messages)');
    const t1 = await fetch(`${BASE_URL}/tickets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerId,
        title: 'Need help with billing',
        description: 'My invoice is incorrect.',
        priority: 'HIGH',
        initialMessages: ['Hello', 'I need help!']
      })
    });
    const t1Data = await t1.json();
    assert(t1.status === 201, 'Failed to create ticket');
    const ticketId = t1Data.data.id;
    console.log('✔ Passed\n');

    console.log('[TEST] POST /tickets (Invalid - missing title)');
    const t2 = await fetch(`${BASE_URL}/tickets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerId,
        description: 'Desc',
        priority: 'LOW'
      })
    });
    assert(t2.status === 400, 'Expected 400 for missing title');
    console.log('✔ Passed\n');

    console.log('[TEST] GET /tickets (List)');
    const t3 = await fetch(`${BASE_URL}/tickets`);
    const t3Data = await t3.json();
    assert(t3.status === 200, 'Failed to list tickets');
    assert(Array.isArray(t3Data.data), 'Expected array of tickets');
    console.log('✔ Passed\n');

    console.log('[TEST] GET /tickets/:id (Valid)');
    const t4 = await fetch(`${BASE_URL}/tickets/${ticketId}`);
    assert(t4.status === 200, 'Failed to get ticket by ID');
    console.log('✔ Passed\n');

    console.log('[TEST] GET /tickets/:id (Invalid - non-existent ID)');
    // assuming uuid format
    const fakeId = '11111111-1111-1111-1111-111111111111';
    const t5 = await fetch(`${BASE_URL}/tickets/${fakeId}`);
    assert(t5.status === 404, 'Expected 404 for non-existent ticket');
    console.log('✔ Passed\n');

    console.log('[TEST] PATCH /tickets/:id/status (Invalid status)');
    const t6 = await fetch(`${BASE_URL}/tickets/${ticketId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'INVALID_STATUS' })
    });
    assert(t6.status === 400, 'Expected 400 for invalid status');
    console.log('✔ Passed\n');

    console.log('[TEST] PATCH /tickets/:id/status (Valid)');
    const t7 = await fetch(`${BASE_URL}/tickets/${ticketId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'IN_PROGRESS' })
    });
    assert(t7.status === 200, 'Failed to update ticket status');
    console.log('✔ Passed\n');

    // ======================================
    // 3. MESSAGE ENDPOINTS
    // ======================================
    console.log('[TEST] GET /tickets/:id/messages (Valid)');
    const m1 = await fetch(`${BASE_URL}/tickets/${ticketId}/messages`);
    const m1Data = await m1.json();
    assert(m1.status === 200, 'Failed to get messages');
    assert(m1Data.data.length >= 2, 'Expected at least 2 initial messages');
    console.log('✔ Passed\n');

    console.log('[TEST] POST /tickets/:id/messages (Invalid - empty message)');
    const m2 = await fetch(`${BASE_URL}/tickets/${ticketId}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ senderType: 'AGENT', message: '   ' })
    });
    assert(m2.status === 400, 'Expected 400 for empty message');
    console.log('✔ Passed\n');

    console.log('[TEST] POST /tickets/:id/messages (Valid)');
    const m3 = await fetch(`${BASE_URL}/tickets/${ticketId}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ senderType: 'AGENT', message: 'We are looking into this.' })
    });
    assert(m3.status === 201, 'Failed to add message');
    console.log('✔ Passed\n');

    console.log('All tests passed successfully! 🎉');
  } catch (err) {
    console.error('Test execution failed:', err);
  } finally {
    server.close();
    process.exit(0);
  }
};

server.listen(PORT, () => {
  runTests();
});
