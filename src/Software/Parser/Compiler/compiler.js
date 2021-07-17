const { instructionMap, registerMap } = require('./meta');
const { instruction, programParser } = require('../ASMParser/ASMParser');
const fs = require('fs');
const Log = require('../../../Util/Log');
const { isNullOrUndefined } = require('util');

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
	errorStack: [],
});

const assemble = ast => {
	let byteArray = [];
	let variableMap = {};
	let labelMap = {};

	const encodeInstruction = instruction => {
		const encodeOpCode = variant => {
			return variant.opCode;
		};

		const encodeArgs = instruction => {
			let bytes = [];

			const push8 = byte => {
				bytes.push(byte);
			};

			const push16 = doubleByte => {
				const highByte = (doubleByte & 0xff00) >> 8;
				const lowByte = doubleByte & 0x00ff;

				push8(highByte);
				push8(lowByte);
			};

			const encodeRegister = register => {
				return registerMap[register];
			};

			const encodeArg = arg => {
				if (arg.id) {
					if (isNullOrUndefined(variableMap[arg.id])) throw `variable ${arg.id} is not declared`;
					arg.value = variableMap[arg.id];
				}

				if (arg.type == 'Register') {
					push8(encodeRegister(arg.value));
				} else if (arg.type == 'Immediate8') {
					push8(arg.value);
				} else {
					push16(arg.value);
				}
			};

			if (instruction.args1) encodeArg(instruction.args1);
			if (instruction.args2) encodeArg(instruction.args2);

			return bytes;
		};

		const variant = instructionMap[instruction.value][instruction.variant];

		const opCode = encodeOpCode(variant);
		const args = encodeArgs(instruction);
		return [opCode, ...args];
	};

	if (ast.isError) throw ast.errorStack + ast.left;

	//first scan, so it can properly hoist the labels
	let address = 0;
	ast.result.forEach(result => {
		if (['SkipLine', 'Comment'].includes(result.type)) return;

		if (result.type === 'LabelDeclaration') {
			variableMap[result.id] = address;
			return;
		}
		if (result.type !== 'VariableDec') {
			const sizeInBytes = instructionMap[result.value][result.variant].sizeInBytes;
			address += sizeInBytes;
		}
	});

	//second scan
	ast.result.forEach(result => {
		if (result.type === 'Instruction') {
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
//const machineCode = assemble(ast);
Log.deepLog(ast);
//console.log(machineCode.map(byte => byte.toString(16)));
//module.exports = machineCode;
