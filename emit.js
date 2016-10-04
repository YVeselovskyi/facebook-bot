const EventEmitter = require('events');

class MyEmitter extends EventEmitter {}

const myEmitter = new MyEmitter();

function emit(argument) {
	myEmitter.emit('query executed');
}

setTimeout(emit, 2000);

module.exports = {
	myEmitter: myEmitter
};
