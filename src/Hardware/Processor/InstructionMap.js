const instructionMap = {
    "0x00": "noOp",
    "0x10": "moveImmediateToRegister",
    "0x11": "moveRegisterToRegister",
    "0x50": "jumpImmediate",
    "0x51": "jumpNotEqual",
    "0x52": "jumpEqual",
    "0x55": "jumpToSubRoutine",
    "0x56": "returnFromSubRoutine",
    "0xA0": "addRegisterToRegister",
    "0xA1": "addImmediateToRegister",
    "0xB0": "compareRegisterToRegister",
    "0xC0": "pushImmediate",
    "0xC1": "pushRegister",
    "0xC2": "popToRegister",
    "0XFF": "halt",
};

module.exports = instructionMap;
