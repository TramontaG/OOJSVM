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

const choice = parsers => parserState => {
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

	if (result.length == 0) {
		return updateParserError(
			parserState,
			`Tried to capture many ${identifier || 'NONAME'} but got none`
		);
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

module.exports = {
	sequenceOf,
	choice,
	many,
	optional,
};
