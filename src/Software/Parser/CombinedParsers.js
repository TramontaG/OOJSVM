const { str, regexMatch } = require('./AtomicParsers');
const { sequenceOf, many } = require('./Combinators');
const { transform, updateParserError } = require('./parserUtils');

const between = (between1, string, between2) =>
	transform(sequenceOf([between1, string, between2]), parsed => parsed.result[1]);

const code = transform(
	between(str('<'), regexMatch(/[^>]+/), str('>')),
	code => {
		const value = eval(code.result);
		if (typeof value === 'number') return value;
	},
	code => {
		return {
			isError: typeof eval(code.result) !== 'number',
			error: `Invalid expression on index ${code.index}, it does not evaluate to a number`,
		};
	}
);

module.exports = {
	between,
	code,
};
