class VMConsole {
	constructor() {
		this.buffer = [];
	}

	setWordValue = (address, value) => {
		const actions = [this.clearConsole, this.addCharToBuffer, this.backspace, this.log];

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
	};

	getWordValue = () => null;
}

const vmConsole = new VMConsole();

vmConsole.setWordValue(1, 65);
vmConsole.setWordValue(1, 66);
vmConsole.setWordValue(1, 67);
vmConsole.setWordValue(1, 68);
vmConsole.setWordValue(1, 69);
vmConsole.setWordValue(2, 10);
vmConsole.setWordValue(1, 70);
vmConsole.setWordValue(3, 10);
