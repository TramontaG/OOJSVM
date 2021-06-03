const { instructionMap, registerMap } = require('./meta');
const { instruction, programParser } = require('../ASMParser/ASMParser');
const fs = require('fs');
const Log = require('../../../Util/Log');

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
	let variableMap = {};

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
				if (arg.id) {
					if (!variableMap[arg.id]) throw `variable ${arg.id} is not declared`;

					arg.value = variableMap[arg.id];
				}

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

	if (ast.isError) throw ast.errorStack + ast.left;

	ast.result.map(result => {
		if (result.type == 'Instruction') {
			const instruction = result;
			const bytes = encodeInstruction(instruction);
			byteArray.push(...bytes);
		}

		if (result.type === 'VariableDec') {
			variableMap[result.id] = result.value;
		}
	});

	return byteArray;
};

//Log.deepLog(ast);
const machineCode = assemble(ast);

console.log(machineCode);

//module.exports = machineCode;
