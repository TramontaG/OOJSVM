const { whiteSpace, digits, str } = require('../AtomicParsers');
const { sequenceOf, choice, optional, many } = require('../Combinators');
const { transform } = require('../parserUtils');
const { immediate, address, register } = require('./AtomASMParser');

const move = transform(
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
		arguments: [instruction.result[3], instruction.result[6]],
	})
);

const program = many(move);

module.exports = {
	move,
	program,
};
