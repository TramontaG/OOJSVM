const { whiteSpace, digits, str, regexMatch } = require('../AtomicParsers');
const { sequenceOf, choice } = require('../Combinators');
const { transform } = require('../parserUtils');
const { code } = require('../CombinedParsers');

const hexValue = regexMatch(/^[0-9A-F]+/);

const immediateHex = transform(sequenceOf([str('#'), hexValue]), immed => ({
	type: 'ImmediateHex',
	value: Number('0x' + immed.result[1]),
}));

const immediateDec = transform(digits, immed => ({
	type: 'ImmediateDec',
	value: immed.result,
}));

const immediate = choice([immediateDec, immediateHex, code]);

const address = transform(sequenceOf([str('$'), hexValue]), add => ({
	type: 'Address',
	value: Number('0x' + add.result[1]),
}));

const register = transform(
	choice([
		str('R1'),
		str('R2'),
		str('R3'),
		str('R4'),
		str('R5'),
		str('R6'),
		str('R7'),
		str('R8'),
		str('ACC'),
		str('PC'),
	]),
	reg => ({
		type: 'Register',
		value: reg.result,
	})
);

module.exports = {
	immediate,
	address,
	register,
	hexValue,
};
