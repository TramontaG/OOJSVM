const { updateParserError, updateParserState } = require('./parserUtils');

const str = target => parserState => {
	const { index, isError } = parserState;
	const supplied = parserState.stringToBeParsed;

	if (isError) return parserState;

	const slicedTarget = supplied.slice(index);

	if (slicedTarget.length === 0)
		return updateParserError(
			parserState,
			`Tried to parse ${target} but got unexpected end of input`
		);

	if (slicedTarget.startsWith(target)) {
		return updateParserState(parserState, {
			index: parserState.index + target.length,
			result: target,
		});
	} else {
		return updateParserError(
			parserState,
			`Tried to parse ${target} but got ${supplied.slice(index, index + 15)} instead`
		);
	}
};

const whiteSpace = parserState => {
	const { index, isError } = parserState;
	const supplied = parserState.stringToBeParsed;

	if (isError) return parserState;

	const slicedTarget = supplied.slice(index);

	if (slicedTarget.length === 0)
		return updateParserError(
			parserState,
			`Tried to parse whitespace but got unexpected end of input`
		);

	if (slicedTarget.startsWith(' ')) {
		return updateParserState(parserState, {
			index: parserState.index + 1,
			result: { separator: 'whitespace' },
		});
	} else {
		return updateParserError(
			parserState,
			`Tried to parse whitespace but got ${supplied.slice(index, index + 15)} instead`
		);
	}
};

const regexMatch = regex => parserState => {
	const supplied = parserState.stringToBeParsed;

	if (parserState.isError) return parserState;

	const slicedTarget = supplied.slice(parserState.index);

	if (slicedTarget.length === 0)
		return updateParserError(
			parserState,
			`Tried to match regex ${regex} but got unexpected end of input`
		);

	const matchedString = slicedTarget.match(regex);

	if (matchedString) {
		return updateParserState(parserState, {
			index: parserState.index + matchedString[0].length,
			result: matchedString[0],
		});
	} else {
		return updateParserError(
			parserState,
			`Tried to match regex ${regex} but got ${supplied.slice(
				parserState.index,
				parserState.index + 15
			)} instead`
		);
	}
};

const letters = parserState => {
	const supplied = parserState.stringToBeParsed;

	if (parserState.isError) return parserState;

	const slicedTarget = supplied.slice(parserState.index);

	if (slicedTarget.length === 0)
		return updateParserError(parserState, `Tried to parse letters but got unexpected end of input`);

	const regexMatch = /^[A-Za-z]+/;
	const matchedString = slicedTarget.match(regexMatch);

	if (matchedString) {
		return updateParserState(parserState, {
			index: parserState.index + matchedString[0].length,
			result: matchedString[0],
		});
	} else {
		return updateParserError(
			parserState,
			`Tried to parse letters but got ${supplied.slice(
				parserState.index,
				parserState.index + 15
			)} instead`
		);
	}
};

const digits = parserState => {
	const supplied = parserState.stringToBeParsed;

	if (parserState.isError) return parserState;

	const slicedTarget = supplied.slice(parserState.index);

	if (slicedTarget.length === 0)
		return updateParserError(parserState, `Tried to parse letters but got unexpected end of input`);

	const regexMatch = /^[0-9]+/;
	const matchedString = slicedTarget.match(regexMatch);

	if (matchedString) {
		return updateParserState(parserState, {
			index: parserState.index + matchedString[0].length,
			result: matchedString[0],
		});
	} else {
		return updateParserError(
			parserState,
			`Tried to parse letters but got ${supplied.slice(
				parserState.index,
				parserState.index + 15
			)} instead`
		);
	}
};

module.exports = {
	str,
	whiteSpace,
	letters,
	digits,
	regexMatch,
};
