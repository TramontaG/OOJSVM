const { whiteSpace, digits, str } = require('../ParserLib/AtomicParsers');
const { sequenceOf, choice, optional, many, all } = require('../ParserLib/Combinators');
const { code } = require('../ParserLib/CombinedParsers');
const { transform } = require('../ParserLib/parserUtils');
const {
	immediate,
	address,
	register,
	variableDeclaration,
	labelDeclaration,
	immediate8,
	multilineComment,
	singleLineComment,
	afterInstructionComment,
} = require('./AtomASMParser');

const singleArgInstruction = instructionData =>
	transform(
		sequenceOf([
			optional(many(whiteSpace)),
			str(instructionData.opCode),
			whiteSpace,
			choice(instructionData.args1),
			str(';'),
			optional(many(whiteSpace)),
			optional(afterInstructionComment),
			optional(str('\n')),
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
			optional(many(whiteSpace)),
			str(instructionData.opCode),
			whiteSpace,
			choice(instructionData.args1),
			whiteSpace,
			choice(instructionData.args2),
			str(';'),
			optional(many(whiteSpace)),
			optional(afterInstructionComment),
			optional(str('\n')),
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
			optional(many(whiteSpace)),
			str(instructionData.opCode),
			str(';'),
			optional(many(whiteSpace)),
			optional(afterInstructionComment),
			optional(str('\n')),
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
	args1: [immediate8, immediate, register, address],
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
	args1: [register, address],
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

const skipLine = transform(str('\n'), result => ({
	type: 'SkipLine',
}));

const comment = transform(choice([singleLineComment, multilineComment]), comment => ({
	type: 'Comment',
	value: comment.result,
}));

const expression = choice(
	[instruction, variableDeclaration, labelDeclaration, comment, skipLine],
	'expression'
);

const programParser = all(expression, 'expression');

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
	programParser,
};
