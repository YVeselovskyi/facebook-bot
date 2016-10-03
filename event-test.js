const EventEmitter = require('events');

class MyEmitter extends EventEmitter {}

const myEmitter = new MyEmitter();

function anotherEvent() {
    console.log('timeout event');
    myEmitter.emit('timeout-event');
};

setTimeout(anotherEvent , 1000);

module.exports = {
    myEmitter: myEmitter
}
