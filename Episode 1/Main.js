const createMemory = require("./Memory");
const CPU = require("./CPU");
const instructions = require("./Instructions");

//creating a memory of 256 bytes
const m = createMemory(256);
const writableBytes = new Uint8Array(m.buffer);

const cpu = new CPU(m);

writableBytes[0] = instructions.MOV_LIT_R1;
writableBytes[1] = 0x12;
writableBytes[2] = 0x34;

writableBytes[3] = instructions.MOV_LIT_R2
writableBytes[4] = 0xAB;
writableBytes[5] = 0xCD;

writableBytes[6] = instructions.ADD_REG_REG
writableBytes[7] = 2 //index of r1
writableBytes[8] = 3 //index of r2

cpu.step();
cpu.step();
cpu.step();