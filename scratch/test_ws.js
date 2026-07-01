const WebSocket = require('ws');
const ws = new WebSocket('ws://localhost:3001/ws?token=ares_auth_secret&role=controller');

ws.on('open', () => {
  console.log('Connected to ARES Backend WebSocket. Waiting for live telemetry packet...');
});

ws.on('message', (data) => {
  try {
    const msg = JSON.parse(data.toString());
    console.log('Incoming Message Type:', msg.type);
    if (msg.type === 'fleet_update' || msg.type === 'rover_telemetry' || msg.type === 'rover_log') {
      console.log('Live Payload Data:', JSON.stringify(msg, null, 2));
      process.exit(0);
    }
  } catch (e) {
    console.error(e);
  }
});

// Auto-timeout after 6 seconds
setTimeout(() => {
  console.log('Timeout waiting for telemetry. Closing...');
  process.exit(1);
}, 6000);


