const bytes = `
0x10 0x64 0x45 0x02;
0x10 0x12 0x34 0x05;
0x10 0x43 0x21 0x06;
0x10 0xAB 0xBA 0x07;
0x55 0x00 0x16;
0xFF;
0x00;
0x00;
0xA0 0x06 0x05;
0xA0 0xA1 0x07;
0xC1 0xA1; 
0x56;
`;
const assembly = `
    MOV #6445 R2;  (MOVE O VALOR #6445 PARA O R1)
    MOV #1234 R5;  (MOVE O VALOR #1234 PARA O R5)
    MOV #4321 R6;  (MOVE O VALOR #4321 PARA O R6)
    MOV #ABBA R7;  (MOVE O VALOR #ABBA PARA O R7)
    JSR #0016;     (PULA PARA A ROTINA DE SOMAR 3)
HLT;
NOP; 
NOP;
    ADD R6 R5;
    ADD ACC R7;
    PSH ACC;
    RET;
`;

const loadToMemory = (memory) => {
    const separateInstructions = () => {
        return bytes.replace(/(\n)/g, "").split(";");
    };

    const createByteArray = (instructions) => {
        return (intermiediateArray = instructions.map((instruction) => {
            return instruction.split(" ");
        }));
    };

    const loadOnMemory = (instructionMap) => {
        address = 0x00;
        instructionMap.forEach((instruction) => {
            instruction.forEach((byte) => {
                memory.setWordValue(address, byte);
                address++;
            });
        });
    };

    const instructionList = separateInstructions(bytes);
    const byteArray = createByteArray(instructionList);
    loadOnMemory(byteArray);
};

module.exports = loadToMemory;
