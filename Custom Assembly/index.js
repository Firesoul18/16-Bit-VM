const ParserGenerator = require('arcsecond')

const caseLess = (s) => ParserGenerator.choice(
    [
        ParserGenerator.str(s.toUpperCase()),
        ParserGenerator.str(s.toLowerCase())
    ]
)

const asType = type=>value=>({type,value})

const register = ParserGenerator.choice([
    caseLess('r1'),
    caseLess('r2'),
    caseLess('r3'),
    caseLess('r4'),
    caseLess('r5'),
    caseLess('r6'),
    caseLess('r7'),
    caseLess('r8'),
    caseLess('acc'),
    caseLess('ip'),
    caseLess('sp'),
    caseLess('fp'),
]).map(
    result => {
        "REGISTER",
            result
    }
)

const hexDigit = ParserGenerator.regex(/^[0-9A-Fa-f]/)
const hexLiteral = ParserGenerator.char('$')
    .chain(() => {
        ParserGenerator.many1(hexDigit).map(digits => digits.join(''))

    }).map(
        x => {
            "HEX_LITERAL",
                x
        }

    )

const movLitToReg = ParserGenerator.coroutine(
    function*(){
        yield caseLess("mov")
        yield ParserGenerator.whitespace

        const arg1 = yield hexLiteral

        yield ParserGenerator.optionalWhitespace
        yield ParserGenerator.char(',')
        yield ParserGenerator.optionalWhitespace

        const arg2 = yield register
        yield ParserGenerator.optionalWhitespace

        return {
            type:"INSTRUCTION",
            value:{
                name:"MOV_LIT_REG",
                args:[arg1,arg2]
            }
        }
})

console.log(JSON.stringify(movLitToReg.run("mov $0a123 , R1")))