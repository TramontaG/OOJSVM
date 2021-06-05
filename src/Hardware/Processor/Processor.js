const ProgramCounter = require('./ProgramCounter');
const Memory = require('./../Memory/Memory');
const Register = require('./Register');
const Clock = require('../Clock/Clock');
const Log = require('../../Util/Log');
const loadToMemory = require('../../Software/Loader');
const machineCode = require('../../Software/Parser/Compiler/compiler');
const { getInstruction } = require('./InstructionMap');

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

	decodeInstruction(instructionByte) {
		const instructionName = getInstruction(instructionByte);

		if (this.debugInstructions) {
			console.log(`${instructionName} - ${Log.getStringFrom16Bits(instructionByte)}`);
		}

		const instruction = this[instructionName]();
		this.programCounter.increment();
		return instruction;
	}

	pushSingleRegister = register => {
		this.push16(register.getValue());
		return `Register ${register._debugName()} pushed to the stack`;
	};

	popSingleRegister = register => {
		const value = this.pop16();
		register.setValue(value);
		return `Register ${register._debugName()} has now value ${Log.getStringFrom16Bits(value)}`;
	};

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

	separate16 = value => {
		const highByte = (value & 0xff00) >> 8;
		const lowByte = value & 0x00ff;
		return [highByte, lowByte];
	};

	glue16 = (highByte, lowByte) => {
		return ((highByte << 8) & 0xff00) + (lowByte & 0x00ff);
	};

	/**
	 * Does absolutely nothing
	 * @opCode `0x00`
	 * @Assembly `NOP`
	 */
	*_NOP_NoArgs() {}

	/**
	 * Halts the CPU
	 * @opCode `0xFF`
	 * @assembly `HLT`
	 */
	*_HLT_NoArgs() {
		this.halt = true;
		yield 'HLT';
	}

	*_MOV_ImmediateRegister() {
		const value = this.fetch16Bits();
		yield 'MOV1' + ` - Found Value = ${Log.getStringFrom16Bits(value)}`;

		const register = this.getRegister(this.fetchNextByte());
		yield 'MOV2' + ` - Found Register = ${register._debugName()}`;

		register.setValue(value);
	}

	*_MOV_RegisterRegister() {
		const registerA = this.getRegister(this.fetchNextByte());
		yield 'MOV1' + ` - Found RegisterA = ${registerA._debugName()}`;

		const registerB = this.getRegister(this.fetchNextByte());
		yield 'MOV2' + ` - Found RegisterB = ${registerB._debugName()}`;

		registerB.setValue(registerA.getValue());
	}

	*_MOV_ImmediateAddress() {
		const value = this.fetch16Bits();
		const [hbValue, lbValue] = this.separate16(value);
		yield 'MOV1' + ` - Found immediate value ${Log.getStringFrom16Bits(value)}`;

		const address = this.fetch16Bits();
		yield 'MOV2' + ` - Found Address ${Log.getStringFrom16Bits(address)}`;

		this.memory.setWordValue(address, hbValue);
		this.memory.setWordValue(address + 1, lbValue);
		yield 'MOV3' +
			` - Inserted value ${Log.getStringFrom16Bits(this.memory.getWordValue(address))}`;
	}

	*_MOV_RegisterAddress() {
		const register = this.getRegister(this.fetchNextByte());
		yield 'MOV1' +
			` - Found RegisterA = ${register._debugName()} with value ${Log.getStringFrom16Bits(
				register.getValue()
			)}`;

		const address = this.fetch16Bits();
		yield 'MOV2' + ` - Found Address ${Log.getStringFrom16Bits(address)}`;

		const [hbValue, lbValue] = this.separate16(register.getValue());
		this.memory.setWordValue(address, hbValue);
		this.memory.setWordValue(address + 1, lbValue);
	}

	*_MOV_AddressRegister() {
		const address = this.fetch16Bits();
		yield 'MOV1' + ` - got address ${Log.getStringFrom16Bits(address)}`;

		const highByte = this.memory.getWordValue(address);
		const lowByte = this.memory.getWordValue(address + 1);
		const value = this.glue16(highByte, lowByte);
		yield 'MOV1' + ` - got value ${Log.getStringFrom16Bits(value)}`;

		const register = this.getRegister(this.fetchNextByte());
		yield 'MOV2' + ` - got register ${register._debugName()}`;

		register.setValue(value);
	}

	*_JMP_Immediate() {
		const address = this.fetch16Bits();
		yield 'JMP1' + ` - Jumping to address ${Log.getStringFrom16Bits(address)}`;

		this.programCounter.setValue(address);
	}

	*_JMP_Register() {
		const register = this.getRegister(this.fetchNextByte());
		yield 'MOV1' +
			` - Found RegisterA = ${register._debugName()} with value ${Log.getStringFrom16Bits(
				register.getValue()
			)}`;

		this.programCounter.setValue(register.getValue());
	}

	*_JNE_ImmediateImmediate() {
		const value = this.fetch16Bits();
		yield `JNE1 - checking ACC against ${Log.getStringFrom16Bits(value)}`;

		const address = this.fetch16Bits();
		if (this.accumulator.getValue() !== value) {
			this.programCounter.setValue(address);
			yield `JNE2 - Jumping execution to address ${Log.getStringFrom16Bits(address)}`;
		}
	}

	*_JSR_Immediate() {
		const newAddress = this.fetch16Bits();

		this.push16(this.programCounter.getValue());
		yield `Pushed return address ${Log.getStringFrom16Bits(this.programCounter.getValue())}`;

		yield this.pushSingleRegister(this.R1);
		yield this.pushSingleRegister(this.R2);
		yield this.pushSingleRegister(this.R3);
		yield this.pushSingleRegister(this.R4);

		this.programCounter.setValue(newAddress);
		yield `Jumped to address ${Log.getStringFrom16Bits(newAddress)}`;
	}

	*_JSR_Register() {
		const newAddress = this.getRegister(this.fetchNextByte()).getValue();
		this.push16(this.programCounter.getValue());
		yield `Pushed return address ${Log.getStringFrom16Bits(this.programCounter.getValue())}`;

		yield this.pushSingleRegister(this.R1);
		yield this.pushSingleRegister(this.R2);
		yield this.pushSingleRegister(this.R3);
		yield this.pushSingleRegister(this.R4);

		this.programCounter.setValue(newAddress);
		yield `Jumped to address ${Log.getStringFrom16Bits(newAddress)}`;
	}

	*_JSR_Address() {
		const pointer = this.fetch16Bits();
		const [hbNewAddress, lbNewAddress] = this.memory.getWordValue(pointer);
		const newAddress = this.glue16(hbNewAddress, lbNewAddress);

		this.push16(this.programCounter.getValue());
		yield `Pushed return address ${Log.getStringFrom16Bits(this.programCounter.getValue())}`;

		yield this.pushSingleRegister(this.R1);
		yield this.pushSingleRegister(this.R2);
		yield this.pushSingleRegister(this.R3);
		yield this.pushSingleRegister(this.R4);

		this.programCounter.setValue(newAddress);
		yield `Jumped to address ${Log.getStringFrom16Bits(newAddress)}`;
	}

	*_RET_NoArgs() {
		//Popping return value to the accumulator;
		const returnValue = this.pop16();
		this.accumulator.setValue(returnValue);
		yield `Function returned ${Log.getStringFrom16Bits(returnValue)}`;

		//Popping values back to registers
		yield this.popSingleRegister(this.R4);
		yield this.popSingleRegister(this.R3);
		yield this.popSingleRegister(this.R2);
		yield this.popSingleRegister(this.R1);

		//Popping return address;
		const returnAddress = this.pop16();
		this.programCounter.setValue(returnAddress);
		yield `Returned to address ${Log.getStringFrom16Bits(returnAddress)}`;
	}

	*_ADD_RegisterRegister() {
		const registerA = this.getRegister(this.fetchNextByte());
		yield 'ADD1' + ` - Found RegisterA = ${registerA._debugName()}`;

		const registerB = this.getRegister(this.fetchNextByte());
		yield 'ADD2' + ` - Found RegisterB = ${registerB._debugName()}`;

		const result = registerA.getValue() + registerB.getValue();
		const carry = result > 2 ** this.wordSize - 1;
		this.accumulator.setValue(result & (2 ** this.wordSize - 1));
		this.flags.carry = carry;
		this.flags.zero = result === 0;

		yield 'ADD3' +
			` - ACC has now value = ${Log.getStringFrom16Bits(
				this.accumulator.getValue()
			)} - Flags =  ${carry}`;
	}

	*_ADD_ImmediateRegister() {
		const value = this.fetch16Bits();
		yield `ADD2 - Got value ${value}`;

		const register = this.getRegister(this.fetchNextByte());
		yield `ADD1 - Got register ${register._debugName()}`;

		const result = register.getValue() + value;
		const carry = result > 2 ** this.wordSize - 1;
		this.accumulator.setValue(result & (2 ** this.wordSize - 1));
		this.flags.carry = carry;
		this.flags.zero = result === 0;
		yield `ADD3 - Accumulator has now value ${register.getValue()}`;
	}

	*_CMP_RegisterRegister() {
		const registerA = this.getRegister(this.fetchNextByte());
		yield 'CMP1' + ` - Comparing Register ${registerA._debugName()}`;

		const registerB = this.getRegister(this.fetchNextByte());
		yield 'CMP2' + ` - to Register ${registerB._debugName()}`;

		this.accumulator.setValue(registerA.getValue() - registerB.getValue());
	}

	*_CMP_ImmediateRegister() {
		const value = this.fetch16Bits();
		yield 'CMP1' + ` - Comparing value ${Log.getStringFrom16Bits(value)}`;

		const register = this.getRegister(this.fetchNextByte());
		yield 'CMP2' + ` - to Register ${register._debugName()}`;

		this.accumulator.setValue(value - register.getValue());
	}

	*_CMP_RegisterImmediate() {
		const register = this.getRegister(this.fetchNextByte());
		yield 'CMP1' + ` - Comparing Register ${register._debugName()}`;

		const value = this.fetch16Bits();
		yield 'CMP1' + ` - to value ${Log.getStringFrom16Bits(value)}`;

		this.accumulator.setValue(register.getValue() - value);
	}

	*_CMP_MemoryRegister() {
		const address = this.fetch16Bits();
		const hbValue = this.memory.getWordValue(address);
		const lbValue = this.memory.getWordValue(address + 1);
		const value = this.glue16(hbValue, lbValue);
		yield 'CMP1' +
			` - Comparing value ${Log.getStringFrom16Bits(value)} on adress ${Log.getStringFrom16Bits(
				address
			)}`;

		const register = this.getRegister(this.fetchNextByte());
		yield 'CMP2' + ` - to Register ${register._debugName()}`;

		this.accumulator.setValue(value - register.getValue());
	}

	*_CMP_RegisterMemory() {
		const register = this.getRegister(this.fetchNextByte());
		yield 'CMP1' + ` - Comparing Register ${register._debugName()}`;

		const address = this.fetch16Bits();
		const hbValue = this.memory.getWordValue(address);
		const lbValue = this.memory.getWordValue(address + 1);
		const value = this.glue16(hbValue, lbValue);
		yield 'CMP1' +
			` - to value ${Log.getStringFrom16Bits(value)} on adress ${Log.getStringFrom16Bits(address)}`;

		this.accumulator.setValue(register.getValue() - value);
	}

	*_PSH_Immediate() {
		const value = this.fetch16Bits();
		this.push16(value);
		yield `Pushed value ${Log.getStringFrom16Bits(value)}`;
	}

	*_PSH_Register() {
		const register = this.getRegister(this.fetchNextByte());
		const registerValue = register.getValue();
		this.push16(registerValue);
		yield `Pushed value from Register ${register._debugName()} - ${Log.getStringFrom16Bits(
			registerValue
		)}`;
	}

	*_PSH_Address() {
		const address = this.fetch16Bits();
		const hbValue = this.memory.getWordValue(address);
		const lbValue = this.memory.getWordValue(address + 1);
		const value = this.glue16(hbValue, lbValue);
		this.push16(value);

		yield `Pushed value ${Log.getStringFrom16Bits(value)} from address ${Log.getStringFrom16Bits(
			address
		)}`;
	}

	*_POP_Register() {
		const value = this.pop16();
		yield `POP1 - Popped value ${Log.getStringFrom16Bits(value)} from stack`;

		const register = this.getRegister(this.fetchNextByte());
		register.setValue(value);
		yield `POP3 - Register ${register._debugName()} has now value ${Log.getStringFrom16Bits(
			register.getValue()
		)}`;
	}

	*_POP_Address() {
		const [hbValue, lbValue] = this.separate16(this.pop16());
		const address = this.fetch16Bits();
		yield `POP1` + ` - Got address ${Log.getStringFrom16Bits(address)}`;

		this.memory.setWordValue(address, hbValue);
		this.memory.setWordValue(address + 1, lbValue);
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
		Log.debugMemory('0x00', sampleProcessor.memory, 0x00);
		Log.debugMemory('0x10', sampleProcessor.memory, 0x10);
		Log.debugMemory('Stack', sampleProcessor.memory, 0xff00);
		Log.debugRegisters(sampleProcessor);
		clearInterval(execution);
	}
}, 1);
