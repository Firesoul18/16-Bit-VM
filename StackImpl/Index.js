const readline = require('readline');
const createMemory = require('./Memory');
const CPU = require('./CPU');
const instructions = require('./Instructions');

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

const memory = createMemory(256*256);
const writableBytes = new Uint8Array(memory.buffer);

const cpu = new CPU(memory);

const subroutineAddress = 0x3000;
let i = 0;

writableBytes[i++]=instructions.PSH_LIT
writableBytes[i++]=0x12
writableBytes[i++]=0x34

writableBytes[i++]=instructions.MOV_LIT_REG
writableBytes[i++]=0x11
writableBytes[i++]=0x22
writableBytes[i++]=R1

writableBytes[i++]=instructions.PSH_REG
writableBytes[i++]=R1

writableBytes[i++]=instructions.POP
writableBytes[i++]=R2

writableBytes[i++]=instructions.POP
writableBytes[i++]=R1

cpu.step();
cpu.step();
cpu.step();
cpu.step();
cpu.step();

