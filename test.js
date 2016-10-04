const EventEmitter = require('events');
const emit = require('./emit');

emit.myEmitter.on('query executed', () => {
  console.log('an event occurred from another file!');
});
