const ProgramCounter = require('./ProgramCounter');
const Memory = require('./../Memory/Memory');
const Register = require('./Register');
const Clock = require('../Clock/Clock');
const Log = require('../../Util/Log');
const loadToMemory = require('../../Software/Loader');
const machineCode = require('../../Software/Parser/Compiler/compiler');

class Processor {
	constructor(options) {
		this.wordSize = options.wordSize;
		this.addressSpace = options.addressSpace;
		this.programCounter = new ProgramCounter(this.wordSize);
		this.memory = new Memory(this.addressSpace, 8);

		this.R1 = new Register(this.wordSize, 'R1');
		this.R2 = new Register(this.wordSize, 'R2');
		this.R3 = new Register(this.wordSize, 'R3');
		this.R4 = new Register(this.wordSize, 'R4');
		this.R5 = new Register(this.wordSize, 'R5');
		this.R6 = new Register(this.wordSize, 'R6');
		this.R7 = new Register(this.wordSize, 'R7');
		this.R8 = new Register(this.wordSize, 'R8');

		this.accumulator = new Register(this.wordSize, 'ACC');
		this.stackPointer = new Register(8, 'STP');
		this.stackPointer.setValue(0xff00);
		this.framePointer = new Register(8, 'FRP');

		this.state = {
			stackSize: 0,
		};

		this.flags = {
			carry: false,
			equal: false,
		};

		this.debugSteps = options.debugSteps;
		this.debugInstructions = options.debugInstructions;

		this._doneInstruction = true;
		this._activeInstruction;
		this.halt = false;
	}

	fetchNextByte() {
		const byte = this.memory.getWordValue(this.programCounter.getValue());
		this.programCounter.increment();
		return byte;
	}

	fetch16Bits() {
		const upperByte = this.fetchNextByte();
		const lowerByte = this.fetchNextByte();
		return (upperByte << 8) + lowerByte;
	}

	getRegister(byte) {
		const registerMap = {
			'0x01': this.R1,
			'0x02': this.R2,
			'0x03': this.R3,
			'0x04': this.R4,
			'0x05': this.R5,
			'0x06': this.R6,
			'0x07': this.R7,
			'0x08': this.R8,
			'0xA0': this.programCounter,
			'0xA1': this.accumulator,
		};
		return registerMap[Log.getStringFromByte(byte)];
	}

	presetValues() {
		if (this._doneInstruction) {
			const instructionByte = this.memory.getWordValue(this.programCounter.getValue());
			this._activeInstruction = this.decodeInstruction(instructionByte);
		}
	}

	onClock() {
		if (this.halt) return;

		const instructionStep = this._activeInstruction.next();
		this._doneInstruction = instructionStep.done;
		if (this.debugSteps) {
			console.log('INSTRUCTION STEP', instructionStep.value);
		}
	}

	_debugMemory(address) {
		let header = `|`;
		let debugString = '| ';
		for (let i = address; i < address + 16; i++) {
			header += `${Log.getStringFromByte(i)}|`;
			debugString += `${Log.getStringFromByte(this.memory.getWordValue(i))} | `;
		}
		console.log('\nDEBUGGING MEMORY AROUND', Log.getStringFrom16Bits(address));
		console.log(header);
		console.log(debugString, '\n');
	}

	_debugRegisters() {
		const header = () => `|  R1  |  R2  |  R3  |  R4  |  R5  |  R6  |  R7  |  R8  |`;
		let registerLog = '|';
		const logRegister = register => `${Log.getStringFrom16Bits(register.getValue())}|`;
		header()
			.split('|')
			.map(register => register.trim())
			.map(register => {
				if (this[register]) registerLog += logRegister(this[register]);
			});

		registerLog += logRegister(this.accumulator);
		registerLog += logRegister(this.programCounter);
		console.log(header() + '  ACC |  PC  |');
		console.log(registerLog);
	}

	decodeInstruction(instructionByte) {
		const instructionMap = {
			'0x00': this._noOp,
			'0x10': this._moveImmediateToRegister,
			'0x11': this._moveRegisterToRegister,
			'0x50': this._jumpImmediate,
			'0x51': this._jumpNotEqual,
			'0x52': this._jumpEqual,
			'0x55': this._jumpSubRoutine,
			'0x56': this._returnFromSubRoutine,
			'0xA0': this._addRegisterToRegister,
			'0xA1': this._addImmediateToRegister,
			'0xB0': this._compareRegisterToRegister,
			'0xC0': this._pushImmediate,
			'0xC1': this._pushRegister,
			'0xC2': this._popToRegister,
			'0xFF': this._halt,
		};

		const instructionString = Log.getStringFromByte(instructionByte);

		if (this.debugInstructions) {
			console.log(
				'FOUND INSTRUCTION:',
				instructionString,
				Log.getInstructionFromByte(instructionByte)
			);
		}

		this.programCounter.increment();
		return instructionMap[instructionString].bind(this)();
	}

	pushByte = byte => {
		const address = this.stackPointer.getValue() | 0xff00;
		this.memory.setWordValue(address, byte);
		this.stackPointer.increment();
		this.state.stackSize++;
	};

	push16 = value => {
		const highByte = (value & 0xff00) >> 8;
		const lowByte = value & 0x00ff;
		this.pushByte(highByte);
		this.pushByte(lowByte);
	};

	popByte = () => {
		this.stackPointer.decrement();
		const address = this.stackPointer.getValue() | 0xff00;
		const byte = this.memory.getWordValue(address);
		this.state.stackSize--;
		return byte;
	};

	pop16 = () => {
		const lowByte = this.popByte();
		const highByte = this.popByte();
		return (highByte << 8) + lowByte;
	};

	//Instructions!
	//Internal CPU workings
	/**
	 * Does absolutely nothing
	 * @opCode `0x00`
	 * @Assembly `NOP`
	 */
	*_noOp() {
		console.log('NO OP');
		yield 'NOP';
	}
	/**
	 * Halts the CPU
	 * @opCode `0xFF`
	 * @assembly `HLT`
	 */
	*_halt() {
		console.log('END OF PROGRAM');
		this.halt = true;
		yield 'HLT';
	}

	//Moving Data
	/**
	 * Moves an immediate value to a register
	 * @opCode `0x10`
	 * @Assembly `MOV`
	 * @param {Register} Value
	 * @param {Immediate} Register
	 * @example `0x10 0xAB 0xCD 0x01` => `MOV #ABCD R1`
	 */
	*_moveImmediateToRegister() {
		const value = this.fetch16Bits();
		yield 'MOV1' + ` - Found Value = ${Log.getStringFrom16Bits(value)}`;

		const register = this.getRegister(this.fetchNextByte());
		yield 'MOV2' + ` - Found Register = ${register._debugName()}`;

		register.setValue(value);
		yield 'MOV3' +
			` - Register ${register._debugName()} has value = ${Log.getStringFromByte(
				register.getValue()
			)}`;
	}

	/**
	 * Moves the value from RegisterA to RegisterB
	 * @opCode `0x11`
	 * @Assembly `MOV`
	 * @param {Register} RegisterA
	 * @param {Register} RegisterB
	 * @example `0x11 0x01 0x02`
	 */
	*_moveRegisterToRegister() {
		const registerA = this.getRegister(this.fetchNextByte());
		yield 'MOV1' + ` - Found RegisterA = ${registerA._debugName()}`;

		const registerB = this.getRegister(this.fetchNextByte());
		yield 'MOV2' + ` - Found RegisterB = ${registerB._debugName()}`;

		registerB.setValue(registerA.getValue());
		yield 'MOV3' +
			` - Set ${registerB._debugName()} to value ${Log.getStringFrom16Bits(registerB.getValue())}`;
	}

	//Branching
	/**
	 * Sets the program counter to point to an immediate value
	 * @opCode `0x50`
	 * @Assembly `JMP`
	 * @param {Address} Address
	 * @example `0x50 0xAB 0xCD` => `JMP #ABCD`
	 */
	*_jumpImmediate() {
		const address = this.fetch16Bits();
		yield 'JMP1' + ` - Jumping to address ${Log.getStringFrom16Bits(address)}`;

		this.programCounter.setValue(address);
	}

	/**
	 * Sets the program counter to point to an immediate value
	 * if the `equal` flag is `false`
	 * @opCode `0x51`
	 * @Assembly `JNE`
	 * @param {Address} Address
	 * @example `0x51 0xAB 0xCD` => `JNE #ABCD`
	 */
	*_jumpNotEqual() {
		const address = this.fetch16Bits();
		yield 'JMP1' + ` - Trying to jumping to address ${Log.getStringFrom16Bits(address)}`;

		if (!this.flags.equal) {
			this.programCounter.setValue(address);
			yield 'JMP2' + ` - Jumped because the flag Equal is false`;
		}
	}

	/**
	 * Sets the program counter to point to an immediate value
	 * if the `equal` flag is `true`
	 * @opCode `0x52`
	 * @Assembly `JPE`
	 * @param {Address} Address
	 * @example `0x51 0xAB 0xCD` => `JNE #ABCD`
	 */
	*_jumpEqual() {
		const address = this.fetch16Bits();
		yield 'JMP1' + ` - Trying to jumping to address ${Log.getStringFrom16Bits(address)}`;

		if (!this.flags.equal) {
			this.programCounter.setValue(address);
			yield 'JMP2' + ` - Jumped because the flag Equal is false`;
		}
	}

	/**
	 * Pushes R1-R4 registers to the stack, stack and
	 * jumps execution to an address in memory
	 * @opCode `0x55`
	 * @Assembly `JSR`
	 * @param {Address} Address
	 * @example `0x55 0x05 0x50` => `JSR #0550`
	 */
	*_jumpSubRoutine() {
		//Push Register function
		const pushSingleRegister = register => {
			const registerValue = register.getValue();
			this.push16(registerValue);
			return `Register ${register._debugName()} pushed to the stack`;
		};

		//pushing current address to the stack, so that we can return
		const newAddress = this.fetch16Bits();
		this.push16(this.programCounter.getValue());
		yield `Pushed return address ${Log.getStringFrom16Bits(this.programCounter.getValue())}`;

		//Pushing registers to the stack
		yield pushSingleRegister(this.R1);
		yield pushSingleRegister(this.R2);
		yield pushSingleRegister(this.R3);
		yield pushSingleRegister(this.R4);

		this.programCounter.setValue(newAddress);
		yield `Jumped to address ${Log.getStringFrom16Bits(newAddress)}`;
	}

	/**
	 * Returns from a subRoutine, restoring R1-R4 and with
	 * the return from the instruction on the accumulator.
	 * @opCode `0x56`
	 * @Assembly `RET`
	 * @example `0x56` => `RET`
	 */
	*_returnFromSubRoutine() {
		const popSingleRegister = register => {
			const value = this.pop16();
			register.setValue(value);
			return `Register ${register._debugName()} has now value ${Log.getStringFrom16Bits(value)}`;
		};

		//Popping return value to the accumulator;
		const returnValue = this.pop16();
		this.accumulator.setValue(returnValue);
		yield `Function returned ${Log.getStringFrom16Bits(returnValue)}`;

		//Popping values back to registers
		yield popSingleRegister(this.R4);
		yield popSingleRegister(this.R3);
		yield popSingleRegister(this.R2);
		yield popSingleRegister(this.R1);

		//Popping return address;
		const returnAddress = this.pop16();
		this.programCounter.setValue(returnAddress);
		yield `Returned to address ${Log.getStringFrom16Bits(returnAddress)}`;
	}

	//ALU related
	/**
	 * Adds two registers and outputs the accumulator
	 * @opCode `0xA0`
	 * @Assembly `ADD`
	 * @param {Register} registerA
	 * @param {Register} registerB
	 * @example `0xA0 0x01 0x02` => `ADD R1 R2`
	 */
	*_addRegisterToRegister() {
		const registerA = this.getRegister(this.fetchNextByte());
		yield 'ADD1' + ` - Found RegisterA = ${registerA._debugName()}`;

		const registerB = this.getRegister(this.fetchNextByte());
		yield 'ADD2' + ` - Found RegisterB = ${registerB._debugName()}`;

		const result = registerA.getValue() + registerB.getValue();
		const carry = result > 2 ** this.wordSize - 1;
		this.accumulator.setValue(result & (2 ** this.wordSize - 1));
		this.flags.carry = carry;
		yield 'ADD3' +
			` - Accumulator has now value = ${Log.getStringFrom16Bits(
				this.accumulator.getValue()
			)} / Carry flag is ${carry}`;
	}

	/**
	 * Adds the value of a register and a immediate and
	 * outputs the result into the accumulator
	 * @opCode `0xA1`
	 * @Assembly `ADD`
	 * @param {Register} register
	 * @param {dByte} value
	 * @example `0xA1 0x12 0x34 0x01` => `ADD #1234 R1`
	 */
	*_addImmediateToRegister() {
		const value = this.fetch16Bits();
		yield `ADD2 - Got value ${value}`;

		const register = this.getRegister(this.fetchNextByte());
		yield `ADD1 - Got register ${register._debugName()}`;

		this.accumulator.setValue(value + register.getValue());
		yield `ADD3 - Accumulator has now value ${register.getValue()}`;
	}

	/**
	 * Compares two Registers and set the flags accordingly, does not
	 * put the result in the accumulator.
	 * @Opcode `0XB0`
	 * @Assebly `CMP`
	 * @param {Register} `RegisterA`
	 * @param {Register} `RegisterB`
	 * @example `0xB0 0x01 0x02` => `CMP R1 R2`
	 */
	*_compareRegisterToRegister() {
		const registerA = this.getRegister(this.fetchNextByte());
		const registerB = this.getRegister(this.fetchNextByte());
		yield 'CMP1' +
			` - Comparing Register ${registerA._debugName()} to Register ${registerB._debugName()}`;

		const result = registerA.getValue() - registerB.getValue();
		this.flags.equal = result === 0;
		yield 'CMP2' + ` - The flag EQUAL is now ${this.flags.equal}`;
	}

	/**
	 * Pushes an immediate value to the stack;
	 * @opCode `0xC0`
	 * @Assembly `PSH`
	 * @param {Value} Value
	 * @example `0xC0 0x12 0x34` => `PSH #1234`
	 */
	*_pushImmediate() {
		const value = this.fetch16Bits();
		this.push16(value);
		yield `Pushed value ${Log.getStringFrom16Bits(value)}`;
	}

	/**
	 * Pushes the value from a register to the stack;
	 * @opCode `0xC1`
	 * @Assembly `PSH`
	 * @param {Register} Register
	 * @param {Value} Value
	 * @example `0xC1 0x01` => `PSH R1`
	 */
	*_pushRegister() {
		const register = this.getRegister(this.fetchNextByte());
		const registerValue = register.getValue();
		this.push16(registerValue);
		yield `Pushed value from Register ${register._debugName()} - ${Log.getStringFrom16Bits(
			registerValue
		)}`;
	}

	/**
	 * Pops a value from the stack to a register
	 * @opCode `0xC2`
	 * @Assembly `POP`
	 * @param {Register} register
	 * @example `0xC2 0x01` => `POP R1`
	 */
	*_popToRegister() {
		const value = this.pop16();
		yield `POP1 - Popped value ${Log.getStringFrom16Bits(value)} from stack`;

		const register = this.getRegister(this.fetchNextByte());
		register.setValue(value);
		yield `POP3 - Register ${register._debugName()} has now value ${Log.getStringFrom16Bits(
			register.getValue()
		)}`;
	}
}

const sampleProcessor = new Processor({
	wordSize: 16,
	addressSpace: 0xffff,
	debugSteps: false,
	debugInstructions: false,
});

loadToMemory(sampleProcessor.memory, machineCode);

const sampleClock = new Clock([sampleProcessor]);

const execution = setInterval(() => {
	sampleClock.pulse();
	if (sampleProcessor.halt) {
		Log.debugMemory(sampleProcessor.memory, 0x00);
		Log.debugRegisters(sampleProcessor);
		clearInterval(execution);
	}
}, 1);
