const updateParserError = (previousState, errorMsg) => {
	return {
		...previousState,
		isError: true,
		error: errorMsg,
	};
};

const updateParserState = (previousState, newState) => {
	return {
		...previousState,
		...newState,
	};
};

const transform = (parser, transformerFunction, errCheckFn) => parserState => {
	const oldParserState = parser(parserState);
	const error = errCheckFn
		? errCheckFn(oldParserState)
		: {
				isError: false,
				error: null,
		  };
	return updateParserState(oldParserState, {
		...oldParserState,
		result: transformerFunction(oldParserState),
		isError: error.isError,
		error: error.error,
	});
};

const asType = (parser, identifier) => parserState => {
	const oldParserState = parser(parserState);
	return updateParserState(oldParserState, {
		...oldParserState,
		result: {
			type: identifier,
			value: oldParserState.result,
		},
	});
};

module.exports = {
	updateParserError,
	updateParserState,
	transform,
	asType,
};
