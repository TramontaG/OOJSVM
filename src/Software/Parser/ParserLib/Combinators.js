const { updateParserError, updateParserState } = require('./parserUtils');

const sequenceOf = parsers => parserState => {
	if (parserState.isError) return parserState;

	let results = [];
	let nextState = parserState;

	parsers.forEach(parser => {
		nextState = parser(nextState);
		if (!nextState.isError) {
			results.push(nextState.result);
		}
	});

	return updateParserState(nextState, {
		result: results,
	});
};

const choice = (parsers, identifier) => parserState => {
	if (parserState.isError) return parserState;
	let nextState = parserState;
	let result;
	let done = false;

	parsers.forEach(parser => {
		if (!done) {
			const tempState = parser(nextState);
			if (!tempState.isError) {
				result = tempState.result;
				done = true;
				nextState = tempState;
			}
		}
	});

	if (!result) {
		return updateParserError(
			nextState,
			`No valid ${identifier} found on index ${parserState.index}`
		);
	}

	return updateParserState(nextState, {
		result: result,
	});
};

const many = (parser, identifier) => parserState => {
	if (parserState.isError) return parserState;
	let nextState = parserState;
	let result = [];
	let error = false;

	while (!error) {
		const tempState = parser(nextState);
		error = tempState.isError;

		if (!error) {
			result.push(tempState.result);
			nextState = tempState;
		}
	}

	if (nextState.isError) return nextState;

	if (result.length == 0) {
		return updateParserError(parserState, `Tried to capture many ${identifier} but got none`);
	}

	return updateParserState(nextState, {
		result: result,
	});
};

const optional = parser => parserState => {
	const tempState = parser(parserState);
	return updateParserState(parserState, {
		index: tempState.index,
	});
};

const all = (parser, identifier) => parserState => {
	const allParser = many(parser, identifier);
	const nextParserState = allParser(parserState);

	if (nextParserState.index < parserState.stringToBeParsed.length) {
		return updateParserError(
			nextParserState,
			`There is a invalid ${identifier} on index ${nextParserState.index}`
		);
	} else
		return updateParserState(nextParserState, {
			index: nextParserState.index,
			result: nextParserState.result,
		});
};

module.exports = {
	sequenceOf,
	choice,
	many,
	optional,
	all,
};
