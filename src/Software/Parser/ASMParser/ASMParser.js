const { whiteSpace, digits, str } = require('../ParserLib/AtomicParsers');
const { sequenceOf, choice, optional, many } = require('../ParserLib/Combinators');
const { code } = require('../ParserLib/CombinedParsers');
const { transform } = require('../ParserLib/parserUtils');
const { immediate, address, register } = require('./AtomASMParser');

const singleArgInstruction = instructionData =>
	transform(
		sequenceOf([
			optional(many(str('\n'), 'Breaklines')),
			str(instructionData.opCode),
			whiteSpace,
			choice(instructionData.args1),
			str(';'),
			optional(many(str('\n'), 'Breaklines')),
		]),
		instruction => ({
			type: 'Instruction',
			value: instructionData.opCode,
			args1: instruction.result[3],
			variant: instruction.result[3].type,
		})
	);

const doubleArgInstruction = instructionData =>
	transform(
		sequenceOf([
			optional(many(str('\n'), 'Breaklines')),
			str(instructionData.opCode),
			whiteSpace,
			choice(instructionData.args1),
			whiteSpace,
			choice(instructionData.args2),
			str(';'),
			optional(many(str('\n'), 'breakLines')),
		]),
		instruction => ({
			type: 'Instruction',
			value: instructionData.opCode,
			args1: instruction.result[3],
			args2: instruction.result[5],
			variant: instruction.result[3].type + instruction.result[5].type,
		})
	);

const noArgsInstruction = instructionData =>
	transform(
		sequenceOf([
			optional(many(str('\n'), 'Breaklines')),
			str(instructionData.opCode),
			str(';'),
			optional(many(str('\n'), 'breakLines')),
		]),
		instruction => ({
			type: 'Instruction',
			value: instructionData.opCode,
			variant: 'NoArgs',
		})
	);

//Instructions
const noOp = noArgsInstruction({
	opCode: 'NOP',
});

const move = doubleArgInstruction({
	opCode: 'MOV',
	args1: [immediate, register, address],
	args2: [register, address],
});

const jump = singleArgInstruction({
	opCode: 'JMP',
	args1: [immediate, register],
});

const jumpNotEqual = doubleArgInstruction({
	opCode: 'JNE',
	args1: [immediate, register],
	args2: [immediate, register, address],
});

const jumpEqual = singleArgInstruction({
	opCode: 'JPE',
	args1: [immediate, register],
});

const jumpSubRoutine = singleArgInstruction({
	opCode: 'JSR',
	args1: [immediate, register, address],
});

const returnFromSubRoutine = noArgsInstruction({
	opCode: 'RET',
});

const add = doubleArgInstruction({
	opCode: 'ADD',
	args1: [immediate, register, address],
	args2: [immediate, register, address],
});

const compare = doubleArgInstruction({
	opCode: 'CMP',
	args1: [immediate, register, address],
	args2: [immediate, register, address],
});

const push = singleArgInstruction({
	opCode: 'PSH',
	args1: [immediate, register],
});

const pop = singleArgInstruction({
	opCode: 'POP',
	args1: [register],
});

const halt = noArgsInstruction({
	opCode: 'HLT',
});

const instruction = choice(
	[
		noOp,
		jump,
		jumpNotEqual,
		jumpEqual,
		jumpSubRoutine,
		returnFromSubRoutine,
		add,
		compare,
		push,
		pop,
		halt,
		move,
	],
	'instruction'
);

module.exports = {
	move,
	jump,
	jumpNotEqual,
	jumpEqual,
	jumpSubRoutine,
	returnFromSubRoutine,
	add,
	compare,
	push,
	pop,
	halt,
	noOp,
	instruction,
};
