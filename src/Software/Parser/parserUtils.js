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
				status: false,
		  };
	if (error.status) {
		return updateParserError(oldParserState, error.msg);
	}

	return updateParserState(oldParserState, {
		...oldParserState,
		result: transformerFunction(oldParserState),
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
