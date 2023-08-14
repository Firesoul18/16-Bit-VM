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

// cpu.viewMemoryAt(subroutineAddress,10)

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

writableBytes[i++]=instructions.PSH_LIT
writableBytes[i++]=0x00
writableBytes[i++]=0x00

writableBytes[i++] = instructions.MOV_LIT_REG
writableBytes[i++] = 0x10
writableBytes[i++] = 0x10
writableBytes[i++] = R3

writableBytes[i++] = instructions.MOV_LIT_REG
writableBytes[i++] = 0x12
writableBytes[i++] = 0x10
writableBytes[i++] = R4

writableBytes[i++] = instructions.MOV_LIT_REG
writableBytes[i++] = 0x33
writableBytes[i++] = 0x32
writableBytes[i++] = R5

writableBytes[i++] = instructions.MOV_LIT_REG
writableBytes[i++] = 0x38
writableBytes[i++] = 0x08
writableBytes[i++] = R6

writableBytes[i++] = instructions.MOV_LIT_REG
writableBytes[i++] = 0x35
writableBytes[i++] = 0x35
writableBytes[i++] = R7

writableBytes[i++] = instructions.MOV_LIT_REG
writableBytes[i++] = 0x30
writableBytes[i++] = 0x00
writableBytes[i++] = R8

writableBytes[i++] = instructions.CAL_REG
writableBytes[i++] = R8

writableBytes[i++] = instructions.PSH_LIT
writableBytes[i++] = 0x98
writableBytes[i++] = 0x99

i=subroutineAddress
writableBytes[i++] = instructions.PSH_LIT;
writableBytes[i++] = 0x01;
writableBytes[i++] = 0x02;

writableBytes[i++] = instructions.PSH_LIT;
writableBytes[i++] = 0x03;
writableBytes[i++] = 0x04;

writableBytes[i++] = instructions.PSH_LIT;
writableBytes[i++] = 0x05;
writableBytes[i++] = 0x06;

writableBytes[i++] = instructions.MOV_LIT_REG;
writableBytes[i++] = 0x07;
writableBytes[i++] = 0x08;
writableBytes[i++] = R1;

writableBytes[i++] = instructions.MOV_LIT_REG;
writableBytes[i++] = 0x09;
writableBytes[i++] = 0x0A;
writableBytes[i++] = R8;

writableBytes[i++] = instructions.RET;

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  
  rl.on('line', () => {
    cpu.step(0xffff-1-42,44);
  });