const { instructionMap, registerMap } = require('./meta');
const { instruction } = require('../ASMParser/ASMParser');
const { all } = require('../ParserLib/Combinators');
const fs = require('fs');
const Log = require('../../../Util/Log');
const programParser = all(instruction, 'instruction');

const readProgram = () => {
	const file = fs.readFileSync('./software.OOJSVM', {
		encoding: 'utf-8',
	});
	return file.replace(/(\r)/g, '');
};

const program = readProgram();

const ast = programParser({
	index: 0,
	result: null,
	isError: false,
	error: null,
	stringToBeParsed: program,
});

const assemble = ast => {
	let byteArray = [];

	const push8 = byte => {
		byteArray.push(byte);
	};

	const push16 = doubleByte => {
		const highByte = (doubleByte & 0xff00) > 8;
		const lowByte = doubleByte & 0x00ff;

		push8(highByte);
		push16(lowByte);
	};

	const encodeInstruction = instruction => {
		const encodeOpCode = variant => {
			return variant.opCode;
		};

		const encodeArgs = instruction => {
			let bytes = [];

			const encodeRegister = register => {
				return registerMap[register];
			};

			const encodeArg = arg => {
				if (arg.type == 'Register') {
					return encodeRegister(arg.value);
				} else {
					return arg.value;
				}
			};

			if (instruction.args1) bytes.push(encodeArg(instruction.args1));
			if (instruction.args2) bytes.push(encodeArg(instruction.args2));
			return bytes;
		};

		const variant = instructionMap[instruction.value][instruction.variant];

		const opCode = encodeOpCode(variant);
		const args = encodeArgs(instruction);

		return [opCode, ...args];
	};

	if (ast.isError) return [];

	ast.result.map(incOrLabel => {
		if (incOrLabel.type == 'Instruction') {
			const instruction = incOrLabel;
			const bytes = encodeInstruction(instruction);
			byteArray.push(...bytes);
		}
	});

	return byteArray;
};

const machineCode = assemble(ast);
Log.deepLog(ast);

console.log(machineCode.map(byte => byte.toString(16)));
