const { move, program } = require('./ASMParser/ASMParser');
const { many, choice, sequenceOf } = require('./Combinators');
const { str, digits } = require('./AtomicParsers');
const util = require('util');
const { between, code } = require('./CombinedParsers');
const { transform } = require('./parserUtils');

const sampleProgram = `
MOV <10 + 5> $<15 + 50>;
`;

const initialParserState = {
	index: 0,
	result: null,
	isError: false,
	error: null,
	stringToBeParsed: sampleProgram,
};

//const testParser = move;

const testParser = many(move);

console.log(util.inspect(testParser(initialParserState), false, null, true));
