const { move, program } = require('./ASMParser/ASMParser');
const { many } = require('./Combinators');
const { str, digits } = require('./AtomicParsers');
const util = require('util');
const { between, code } = require('./CombinedParsers');

const sampleProgram = `MOV #5416 R3;`;

const initialParserState = {
	index: 0,
	result: null,
	isError: false,
	error: null,
	stringToBeParsed: sampleProgram,
};

const testParser = move;

console.log(util.inspect(testParser(initialParserState), false, null, true));
