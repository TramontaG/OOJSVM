const { move, program, instruction } = require('./ASMParser/ASMParser');
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
MOV <5 * 5> $10;
ADD R3 R1;
JMP <5 * 3>;
JNE #42;
CMP ACC R7;
ADD ACC R7;
RET;
HLT;
`;

const initialParserState = {
	index: 0,
	result: null,
	isError: false,
	error: null,
	stringToBeParsed: sampleProgram,
};

//const testParser = move;

const testParser = all(instruction, 'instruction');
const result = testParser(initialParserState);

console.log(util.inspect(result, false, null, true));
