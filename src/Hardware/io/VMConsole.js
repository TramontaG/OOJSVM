class VMConsole {
	constructor() {
		this.buffer = [];
	}

	setWordValue = (address, value) => {
		const actions = [
			this.clearConsole,
			this.addCharToBuffer,
			this.backspace,
			this.log,
			this.clearBuffer,
		];
		actions[address](value);
	};

	clearConsole = () => {
		console.clear();
	};

	addCharToBuffer = value => {
		this.buffer.push(value);
	};

	backspace = () => {
		this.buffer.pop();
	};

	log = () => {
		console.log(
			this.buffer.reduce((acc, current) => {
				return (acc += String.fromCharCode(current));
			}, '')
		);
		this.clearBuffer();
	};

	clearBuffer = () => {
		this.buffer = [];
	};

	getWordValue = () => null;
}

module.exports = VMConsole;
