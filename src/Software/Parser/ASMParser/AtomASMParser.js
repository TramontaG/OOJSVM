const { whiteSpace, digits, str, regexMatch, letters } = require('../ParserLib/AtomicParsers');
const { sequenceOf, choice, many, optional } = require('../ParserLib/Combinators');
const { transform } = require('../ParserLib/parserUtils');
const { code } = require('../ParserLib/CombinedParsers');

const hexValue = regexMatch(/^[0-9A-F]+/);

const immediateHex = transform(sequenceOf([str('#'), hexValue]), immed => ({
	type: 'Immediate',
	value: Number('0x' + immed.result[1]),
	id: null,
}));

const immediateDec = transform(digits, immed => ({
	type: 'Immediate',
	value: Number(immed.result),
	id: null,
}));

const immediateCode = transform(code, immed => ({
	type: 'Immediate',
	value: immed.result,
	id: null,
}));

const variableName = transform(letters, variableName => ({
	type: 'VariableName',
	value: variableName.result,
}));

const variableRead = transform(sequenceOf([str('!'), variableName]), variableRead => ({
	type: 'Immediate',
	value: null,
	id: variableRead.result[1].value,
}));

const immediate = choice([immediateDec, immediateHex, immediateCode, variableRead]);

const address = transform(sequenceOf([str('$'), immediate]), add => ({
	type: 'Address',
	value: add.result[1].value,
	id: add.result[1].id,
}));
const variableDeclaration = transform(
	sequenceOf([
		str('v'),
		whiteSpace,
		variableName,
		optional(whiteSpace),
		str('='),
		optional(whiteSpace),
		immediate,
		str(';'),
	]),
	variableDec => ({
		type: 'VariableDec',
		value: variableDec.result[6].value,
		id: variableDec.result[2].value,
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
		id: null,
	})
);

module.exports = {
	immediate,
	address,
	register,
	hexValue,
	immediateHex,
	immediateCode,
	variableDeclaration,
	variableRead,
	variableName,
};
