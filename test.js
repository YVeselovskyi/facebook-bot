const EventEmitter = require('events');
const test = require('./event-test');

test.myEmitter.on('timeout-event', () => {
  console.log('an event occurred!');
});
