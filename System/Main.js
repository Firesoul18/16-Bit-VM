const createMemory = require("./Memory");
const CPU = require("./CPU");
const instructions = require("./Instructions");

//creating a memory of 256 bytes
const m = createMemory(256*256);
const writableBytes = new Uint8Array(m.buffer);

const cpu = new CPU(m);

writableBytes[0] = instructions.MOV_LIT_REG;
writableBytes[1] = 0x12;
writableBytes[2] = 0x34;
writableBytes[3] = 2 //index of r1

writableBytes[4] = instructions.MOV_LIT_REG
writableBytes[5] = 0xAB;
writableBytes[6] = 0xCD;
writableBytes[7] = 3 //index of r2

writableBytes[8] = instructions.ADD_REG_REG
writableBytes[9] = 2 //index of r1
writableBytes[10] = 3 //index of r2

writableBytes[11] = instructions.MOV_REG_MEM
writableBytes[12] = 1 //index of accumlator
writableBytes[13] = 0x01
writableBytes[14] = 0x00

cpu.step(0x0100);
cpu.step(0x0100);
cpu.step(0x0100);
cpu.step(0x0100);