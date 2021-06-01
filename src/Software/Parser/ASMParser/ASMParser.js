const { whiteSpace, digits, str } = require('../AtomicParsers');
const { sequenceOf, choice, optional, many } = require('../Combinators');
const { code } = require('../CombinedParsers');
const { transform } = require('../parserUtils');
const { immediate, address, register } = require('./AtomASMParser');

const move = transform(
	sequenceOf([
		optional(many(str('\n'), 'breakLines')),
		transform(str('MOV'), inst => ({ Instruction: inst.result })),
		whiteSpace,
		choice([immediate, address, register], 'arg1'),
		whiteSpace,
		choice([address, register], 'arg2'),
		str(';'),
		optional(many(str('\n'), 'breakLines')),
	]),
	instruction => ({
		type: 'Instruction',
		value: 'MOVE',
		arguments: [instruction.result[3], instruction.result[5]],
	})
);

module.exports = {
	move,
};
