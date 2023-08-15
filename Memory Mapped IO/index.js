const CPU = require("./CPU");
const createMemory = require("./Memory");
const instruction = require('./Instructions')
const MemoryMapper = require("./MemoryMapper");

const IP = 0;
const ACC = 1;
const R1 = 2;
const R2 = 3;
const R3 = 4;
const R4 = 5;
const R5 = 6;
const R6 = 7;
const R7 = 8;
const R8 = 9;
const SP = 10;
const FP = 11;

const MM = new MemoryMapper()

const memory = createMemory(256*256);
MM.map(memory, 0, 0xffff);
MM.map(createNewDevice(),0x3000,0x30ff,true)

const writableBytes = new Uint8Array(memory.buffer)
let i=0;

const cpu = new CPU(MM)

writableBytes[i++] = instruction.MOV_LIT_REG
writableBytes[i++] = 0x22
writableBytes[i++] = 0x32
writableBytes[i++] = R1

writableBytes[i++] = instruction.MOV_REG_MEM
writableBytes[i++] = R1
writableBytes[i++] = 0x30
writableBytes[i++] = 0x10

writableBytes[i++] = instruction.HLT