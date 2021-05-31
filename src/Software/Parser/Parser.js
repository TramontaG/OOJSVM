const { move, program } = require('./ASMParser/ASMParser');
const { many, choice, sequenceOf, all } = require('./Combinators');
const { str, digits } = require('./AtomicParsers');
const util = require('util');
const { between, code } = require('./CombinedParsers');
const { transform } = require('./parserUtils');
const {
	immediate,
	address,
	register,
	immediateHex,
	immediateCode,
} = require('./ASMParser/AtomASMParser');

const sampleProgram = `
MOV <5 * 5> R8;
MOV $#0004 R3;
`;

const initialParserState = {
	index: 0,
	result: null,
	isError: false,
	error: null,
	stringToBeParsed: sampleProgram,
};

//const testParser = move;

const testParser = all(move);

console.log(util.inspect(testParser(initialParserState), false, null, true));
