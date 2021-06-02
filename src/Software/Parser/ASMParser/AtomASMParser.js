const { whiteSpace, digits, str, regexMatch } = require('../ParserLib/AtomicParsers');
const { sequenceOf, choice } = require('../ParserLib/Combinators');
const { transform } = require('../ParserLib/parserUtils');
const { code } = require('../ParserLib/CombinedParsers');

const hexValue = regexMatch(/^[0-9A-F]+/);

const immediateHex = transform(sequenceOf([str('#'), hexValue]), immed => ({
	type: 'Immediate',
	value: Number('0x' + immed.result[1]),
}));

const immediateDec = transform(digits, immed => ({
	type: 'Immediate',
	value: Number(immed.result),
}));

const immediateCode = transform(code, immed => ({
	type: 'Immediate',
	value: immed.result,
}));

const immediate = choice([immediateDec, immediateHex, immediateCode]);

const address = transform(
	sequenceOf([str('$'), choice([immediateHex, immediateCode, immediateDec])]),
	add => ({
		type: 'Address',
		value: add.result[1].value,
	})
);

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
	immediateHex,
	immediateCode,
};
