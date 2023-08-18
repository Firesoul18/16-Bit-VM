const instructionsSet = require("./Instructions");
const createMemory = require("./Memory");

class CPU {
    constructor(memory) {
        this.memory = memory;
        // this.instructionsSet = appData.instruction;
        this.registerNames = [
            "ip",
            "acc",
            "r1",
            "r2",
            "r3",
            "r4",
            "r5",
            "r6",
            "r7",
            "r8",
            "sp",
            "fp"
        ];

        this.registerMemory = createMemory(this.registerNames.length * 2)
        this.registerMap = this.registerNames.reduce((map, name, i) => {
            map[name] = i * 2;
            return map;
        }, {});

        this.setRegister('sp', memory.byteLength - 1 - 1)
        this.setRegister('fp', memory.byteLength - 1 - 1)

        this.stackFrameSize = 0;
    }

    getRegister(name) {
        if (!(name in this.registerMap)) {
            throw new Error(`Get Register: Register '${name}' not found`);
        }
        return this.registerMemory.getUint16(this.registerMap[name]);
    }

    setRegister(name, value) {
        if (!(name in this.registerMap)) {
            throw new Error(`Set Register: Register '${name}' not found`);
        }
        return this.registerMemory.setUint16(this.registerMap[name], value);
    }

    fetch() {
        const nextInstructionAddress = this.getRegister("ip");
        const _8BitInstructionValue = this.memory.getUint8(nextInstructionAddress);
        this.setRegister("ip", nextInstructionAddress + 1);
        return _8BitInstructionValue;
    }

    fetch16() {
        const nextInstructionAddress = this.getRegister("ip");
        const _16BitInstructionValue = this.memory.getUint16(
            nextInstructionAddress
        );
        this.setRegister("ip", nextInstructionAddress + 2);
        return _16BitInstructionValue;
    }

    fetchRegisterIndex() {
        return (this.fetch() % this.registerNames.length) * 2;
    }

    push(value) {
        const spAddress = this.getRegister('sp')
        this.memory.setUint16(spAddress, value)
        this.setRegister('sp', spAddress - 2)
        this.stackFrameSize += 2
    }

    pop() {
        const nextAddress = this.getRegister('sp') + 2;
        console.log(nextAddress.toString(16))
        const value = this.memory.getUint16(nextAddress)
        this.stackFrameSize -= 2;
        this.setRegister('sp', nextAddress);
        return value;
    }

    execute(instruction) {
        // console.log(instruction);
        switch (instruction) {
            //Move Next 16 bits to a register
            case instructionsSet.MOV_LIT_REG: {
                const value = this.fetch16();
                const register = this.fetchRegisterIndex()
                // console.log(value,register)
                this.registerMemory.setUint16(register, value)
                return;
            }

            //Move Literal from Memory to Register
            case instructionsSet.MOV_MEM_REG: {
                const address = this.fetch16();
                const registerTo = this.fetchRegisterIndex()
                const value = this.memory.getUint16(address);
                this.registerMemory.setUint16(registerTo, value);
                return;
            }

            //Move Literal from Register to Memory
            case instructionsSet.MOV_REG_MEM: {
                const register = this.fetchRegisterIndex()
                const address = this.fetch16();
                const value = this.registerMemory.getUint16(register);
                this.memory.setUint16(address, value)
                return;
            }

            //Move Literal to Memory
            case instructionsSet.MOV_LIT_MEM: {
                const value = this.fetch16();
                const address = this.fetch16();
                this.memory.setUint16(address, value)
                return
            }

            //Move Register Pointer To Register
            case instructionsSet.MOV_REG_PTR_REG: {
                const reg1 = this.fetchRegisterIndex()
                const reg2 = this.fetchRegisterIndex()
                const regPtr = this.registerMemory.getUint16(reg1)
                const value = this.memory.getUint16(regPtr)
                this.registerMemory.setUint16(reg2, value)
                return;
            }

            //Move value at [literal + Reg] to Register
            //used when accessing array elements. Each element after a definite offset
            case instructionsSet.MOV_LIT_OFF_REG: {
                const baseAddress = this.fetch16();
                const reg1 = this.fetchRegisterIndex()
                const reg2 = this.fetchRegisterIndex()
                const offset = this.registerMemory.getUint16(reg1)
                const value = this.memory.getUint16(baseAddress + offset)
                this.registerMemory.setUint16(reg2, value)
                return
            }


            //Move Literal from one register to another
            case instructionsSet.MOV_REG_REG: {
                const registerFrom = this.fetchRegisterIndex()
                const registerTo = this.fetchRegisterIndex()
                const value = this.registers.getUint16(registerFrom);
                this.registers.setUint16(registerTo, value);
                return;
            }

            //Add values of two Registers
            case instructionsSet.ADD_REG_REG: {
                const r1 = this.fetch();
                const r2 = this.fetch();
                const registerValue1 = this.registerMemory.getUint16(r1 * 2);
                const registerValue2 = this.registerMemory.getUint16(r2 * 2);
                this.setRegister("acc", registerValue1 + registerValue2);
                return;
            }


            //subtract value from register
            case instructionsSet.SUB_LIT_REG: {
                const value = this.fetch16();
                const reg = this.fetchRegisterIndex()
                const regValue = this.registerMemory.getUint16(reg);
                this.setRegister("acc", regValue - value);
                return
            }

            //subtract register from literal
            case instructionsSet.SUB_REG_LIT: {
                const reg = this.fetchRegisterIndex()
                const value = this.fetch16();
                const regValue = this.registerMemory.getUint16(reg);
                this.setRegister('acc', value - regValue);
                return;
            }

            //subtract registerX from registerY
            case instructionsSet.SUB_REG_REG: {
                const r1 = this.fetch();
                const r2 = this.fetch();
                const registerValue1 = this.registerMemory.getUint16(r1 * 2);
                const registerValue2 = this.registerMemory.getUint16(r2 * 2);
                this.setRegister("acc", registerValue2 - registerValue1);
                return;
            }

            case instructionsSet.INC_REG: {
                const reg = this.fetchRegisterIndex()
                const value = this.registerMemory.getUint16(reg) + 1;
                this.registerMemory.setUint16(reg, value);
                return;
            }

            case instructionsSet.DEC_REG: {
                const reg = this.fetchRegisterIndex()
                const value = this.registerMemory.getUint16(reg) - 1;
                this.registerMemory.setUint16(reg, value);
                return;
            }

            case instructionsSet.MUL_LIT_REG: {
                const value = this.fetch16();
                const reg = this.fetchRegisterIndex()
                const regValue = this.registerMemory.getUint16(reg);
                this.setRegister('acc', value * regValue);
                return
            }

            case instructionsSet.MUL_REG_REG: {
                const r1 = this.fetch();
                const r2 = this.fetch();
                const registerValue1 = this.registerMemory.getUint16(r1 * 2);
                const registerValue2 = this.registerMemory.getUint16(r2 * 2);
                this.setRegister("acc", registerValue1 * registerValue2);
                return;
            }

            case instructionsSet.LSF_REG_LIT: {
                const regi = this.fetchRegisterIndex();
                const shiftBy = this.fetch16();
                const value = this.registerMemory.getUint16(regi);
                this.registerMemory.setUint16(regi, (value << shiftBy));
                return
            }

            case instructionsSet.LSF_REG_REG: {
                const regi = this.fetchRegisterIndex();
                const regi2 = this.fetchRegisterIndex();
                const value = this.registerMemory.getUint16(regi);
                const shiftBy = this.registerMemory.getUint16(regi2);
                this.registerMemory.setUint16(regi, (value << shiftBy));
                return
            }

            case instructionsSet.RSF_REG_LIT: {
                const regi = this.fetchRegisterIndex();
                const shiftBy = this.fetch16();
                const value = this.registerMemory.getUint16(regi);
                this.registerMemory.setUint16(regi, (value >> shiftBy));
                return
            }

            case instructionsSet.RSF_REG_REG: {
                const regi = this.fetchRegisterIndex();
                const regi2 = this.fetchRegisterIndex();
                const value = this.registerMemory.getUint16(regi);
                const shiftBy = this.registerMemory.getUint16(regi2);
                this.registerMemory.setUint16(regi, (value >> shiftBy));
                return
            }

            case instructionsSet.AND_REG_LIT: {
                const regi = this.fetchRegisterIndex();
                const andBy = this.fetch16();
                const value = this.registerMemory.getUint16(regi);
                this.setRegister('acc', (value & andBy));
                return
            }

            case instructionsSet.AND_REG_REG: {
                const regi = this.fetchRegisterIndex();
                const regi2 = this.fetchRegisterIndex();
                const value = this.registerMemory.getUint16(regi);
                const andBy = this.registerMemory.getUint16(regi2);
                this.setRegister('acc', (value & andBy));
                return
            }

            case instructionsSet.OR_REG_LIT: {
                const regi = this.fetchRegisterIndex();
                const orBy = this.fetch16();
                const value = this.registerMemory.getUint16(regi);
                this.setRegister('acc', (value | orBy));
                return
            }

            case instructionsSet.OR_REG_REG: {
                const regi = this.fetchRegisterIndex();
                const regi2 = this.fetchRegisterIndex();
                const value = this.registerMemory.getUint16(regi);
                const orBy = this.registerMemory.getUint16(regi2);
                this.setRegister('acc', (value | orBy));
                return
            }

            case instructionsSet.XOR_REG_LIT: {
                const regi = this.fetchRegisterIndex();
                const xorBy = this.fetch16();
                const value = this.registerMemory.getUint16(regi);
                this.setRegister('acc', (value ^ xorBy));
                return
            }

            case instructionsSet.XOR_REG_REG: {
                const regi = this.fetchRegisterIndex();
                const regi2 = this.fetchRegisterIndex();
                const value = this.registerMemory.getUint16(regi);
                const xorBy = this.registerMemory.getUint16(regi2);
                this.setRegister('acc', (value ^ xorBy));
                return
            }

            case instructionsSet.NOT: {
                const reg = this.fetchRegisterIndex();
                const value = this.registerMemory.getUint16(reg)

                this.setRegister('acc', ((~value) & 0xffff))

                return
            }

            //jump if not equal to
            case instructionsSet.JMP_NOT_EQ: {
                const value = this.fetch16();
                const address = this.fetch16()
                if (value != this.getRegister('acc')) {
                    this.setRegister('ip', address);
                }
                return;
            }

            // Jump if register not equal
            case instructionsSet.JNE_REG: {
                const r1 = this.fetchRegisterIndex();
                const value = this.registers.getUint16(r1);
                const address = this.fetch16();

                if (value !== this.getRegister('acc')) {
                    this.setRegister('ip', address);
                }

                return;
            }

            // Jump if literal equal
            case instructionsSet.JEQ_LIT: {
                const value = this.fetch16();
                const address = this.fetch16();

                if (value === this.getRegister('acc')) {
                    this.setRegister('ip', address);
                }

                return;
            }

            // Jump if register equal
            case instructionsSet.JEQ_REG: {
                const r1 = this.fetchRegisterIndex();
                const value = this.registers.getUint16(r1);
                const address = this.fetch16();

                if (value === this.getRegister('acc')) {
                    this.setRegister('ip', address);
                }

                return;
            }

            // Jump if literal less than
            case instructionsSet.JLT_LIT: {
                const value = this.fetch16();
                const address = this.fetch16();

                if (value < this.getRegister('acc')) {
                    this.setRegister('ip', address);
                }

                return;
            }

            // Jump if register less than
            case instructionsSet.JLT_REG: {
                const r1 = this.fetchRegisterIndex();
                const value = this.registers.getUint16(r1);
                const address = this.fetch16();

                if (value < this.getRegister('acc')) {
                    this.setRegister('ip', address);
                }

                return;
            }

            // Jump if literal greater than
            case instructionsSet.JGT_LIT: {
                const value = this.fetch16();
                const address = this.fetch16();

                if (value > this.getRegister('acc')) {
                    this.setRegister('ip', address);
                }

                return;
            }

            // Jump if register greater than
            case instructionsSet.JGT_REG: {
                const r1 = this.fetchRegisterIndex();
                const value = this.registers.getUint16(r1);
                const address = this.fetch16();

                if (value > this.getRegister('acc')) {
                    this.setRegister('ip', address);
                }

                return;
            }

            // Jump if literal less than or equal to
            case instructionsSet.JLE_LIT: {
                const value = this.fetch16();
                const address = this.fetch16();

                if (value <= this.getRegister('acc')) {
                    this.setRegister('ip', address);
                }

                return;
            }

            // Jump if register less than or equal to
            case instructionsSet.JLE_REG: {
                const r1 = this.fetchRegisterIndex();
                const value = this.registers.getUint16(r1);
                const address = this.fetch16();

                if (value <= this.getRegister('acc')) {
                    this.setRegister('ip', address);
                }

                return;
            }

            // Jump if literal greater than or equal to
            case instructionsSet.JGE_LIT: {
                const value = this.fetch16();
                const address = this.fetch16();

                if (value >= this.getRegister('acc')) {
                    this.setRegister('ip', address);
                }

                return;
            }

            // Jump if register greater than or equal to
            case instructionsSet.JGE_REG: {
                const r1 = this.fetchRegisterIndex();
                const value = this.registers.getUint16(r1);
                const address = this.fetch16();

                if (value >= this.getRegister('acc')) {
                    this.setRegister('ip', address);
                }

                return;
            }


            case instructionsSet.PSH_LIT: {
                const value = this.fetch16()
                this.push(value)
                return;
            }

            case instructionsSet.PSH_REG: {
                const registerLocation = this.fetch();
                const registerIndex = (registerLocation % this.registerNames.length) * 2
                const value = this.registerMemory.getUint16(registerIndex)
                this.push(value)
                return;
            }

            case instructionsSet.POP: {
                const registerIndex = (this.fetch() % this.registerNames.length) * 2
                const value = this.pop();
                this.registerMemory.setUint16(registerIndex, value)
                return;
            }

            case instructionsSet.CAL_LIT: {
                const address = this.fetch16();
                this.push(this.getRegister('r1'));
                this.push(this.getRegister('r2'));
                this.push(this.getRegister('r3'));
                this.push(this.getRegister('r4'));
                this.push(this.getRegister('r5'));
                this.push(this.getRegister('r6'));
                this.push(this.getRegister('r7'));
                this.push(this.getRegister('r8'));
                this.push(this.getRegister('ip'));
                this.push(this.stackFrameSize + 2)
                this.setRegister('fp', this.getRegister('sp'));
                this.setRegister('ip', address);
                this.stackFrameSize = 0;

                return
            }

            case instructionsSet.CAL_REG: {
                const registerIndex = (this.fetch() % this.registerNames.length) * 2
                const address = this.registerMemory.getUint16(registerIndex);
                this.push(this.getRegister('r1'));
                this.push(this.getRegister('r2'));
                this.push(this.getRegister('r3'));
                this.push(this.getRegister('r4'));
                this.push(this.getRegister('r5'));
                this.push(this.getRegister('r6'));
                this.push(this.getRegister('r7'));
                this.push(this.getRegister('r8'));
                this.push(this.getRegister('ip'));
                this.setRegister('ip', address)
                this.push(this.stackFrameSize + 2)
                this.setRegister('fp', this.getRegister('sp'));
                this.stackFrameSize = 0;
                return
            }

            case instructionsSet.RET: {
                const framePointerAddress = this.getRegister('fp')
                //Safely start from where we need to start
                this.setRegister('sp', framePointerAddress);

                this.stackFrameSize = this.pop();
                const currentFrameSize = this.stackFrameSize;

                this.setRegister('ip', this.pop());
                this.setRegister('r8', this.pop());
                this.setRegister('r7', this.pop());
                this.setRegister('r6', this.pop());
                this.setRegister('r5', this.pop());
                this.setRegister('r4', this.pop());
                this.setRegister('r3', this.pop());
                this.setRegister('r2', this.pop());
                this.setRegister('r1', this.pop());
                this.setRegister('fp', framePointerAddress + currentFrameSize)

                this.registerNames.forEach((t) => {
                    console.log(
                        t + ": 0x" + this.getRegister(t).toString(16).padStart(4, "0")
                    );
                });
                console.log();

                let n = this.pop();
                while (n-- > 0) {
                    this.pop();
                }

                return;
            }

            case instructionsSet.HLT: {
                return true;
            }
        }
    }

    step(address = null, size = 1) {

        if (address != null) {
            this.viewMemoryAt(address, size)
        }

        const fetchedInstruction = this.fetch();
        return this.execute(fetchedInstruction);
    }

    viewMemoryAt(address, n = 8) {
        // 0x0f01: 0x04 0x05 0xA3 0xFE 0x13 0x0D 0x44 0x0F ...
        const nextNBytes = Array.from({ length: n }, (_, i) =>
            this.memory.getUint8(address + i)
        ).map(v => `0x${v.toString(16).padStart(2, '0')}`);

        console.log(`0x${address.toString(16).padStart(4, '0')}: ${nextNBytes.join(' ')}`);
    }

    run() {
        const st = this.step()
        if (!st) {
            setImmediate(() => this.run())
        }
    }
}

module.exports = CPU;
