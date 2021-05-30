const { whiteSpace, digits, str } = require('../AtomicParsers');
const { sequenceOf, choice, optional, many } = require('../Combinators');
const { transform } = require('../parserUtils');
const { immediate, address, register } = require('./AtomASMParser');

const instruction = data =>
	transform(
		sequenceOf([
			optional(many(str('\n'))),
			transform(str('MOV'), inst => ({ Instruction: inst.result })),
			whiteSpace,
			choice([immediate, address, register]),
			whiteSpace,
			choice([address, register]),
			str(';'),
			optional(many(str('\n'))),
		]),
		instruction => ({
			type: 'Instruction',
			value: 'MOVE',
			arguments: [instruction.result[3], instruction.result[5]],
		})
	);

const move = instruction({
	name: 'Move',
	Assembly: 'MOV',
	args: [choice([immediate, address, register]), choice([address, register])],
});
