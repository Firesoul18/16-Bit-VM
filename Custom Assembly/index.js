const Parser = require('arcsecond')
const {inspect} = require('util')

const deepLog = (x)=>{
    console.log(inspect(x,{
        depth:Infinity,
        colors:true
    }))
}

const asType = type => value => ({type,value})

const mapJoin = (parser)=> parser.map(i=>i.join(''));

const UpperOrLower = (s)=>{
    Parser.choice[
        Parser.str(s.toUpperCase()),
        Parser.str(s.toLowerCase())
    ]
}

const register = Parser.choice([
    UpperOrLower("r1"),
    UpperOrLower("r2"),
    UpperOrLower("r3"),
    UpperOrLower("r4"),
    UpperOrLower("r5"),
    UpperOrLower("r6"),
    UpperOrLower("r7"),
    UpperOrLower("r8"),
    UpperOrLower("sp"),
    UpperOrLower("fp"),
    UpperOrLower("ip"),
    UpperOrLower("acc"),
]).map(asType("Register"))

const hexDigit = Parser.regex(/^[0-9A-Fa-f]/)
const hexLiteral = Parser.char('$')
.chain(()=>{mapJoin(Parser.many1(hexDigit))})
.map(asType('HEX_LITERAL'))

const movLitToReg = Parser.coroutine(function *(){
    yield UpperOrLower('mov')
    yield Parser.whitespace

    const arg1 = yield hexLiteral;

    yield Parser.optionalWhitespace
    yield Parser.char(',')
    yield Parser.optionalWhitespace

    const arg2 = yield register;
    yield Parser.optionalWhitespace

    return asType('INSTRUCTION')(
        {
            instruction: 'MOV_LIT_REG',
            args: [arg1,arg2]
        }
    )
})


const t = movLitToReg.run("mov $42, r4")
deepLog(t)