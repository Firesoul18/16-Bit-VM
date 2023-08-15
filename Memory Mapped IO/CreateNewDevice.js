const eraseScreen = () => {
    process.stdout.write('\x1b[2J');
  }
  
  const moveTo = (x, y) => {
    process.stdout.write(`\x1b[${y};${x}H`);
  }

function createOutputDevice(){
    
    return {
        getUint8 : ()=>0,
        getUint16: ()=>0,
        setUint8:  (address,data)=>{
            const command = (data & 0xff00) >> 8;
            const characterValue = data & 0x00ff;

            if(command==0xff){
                eraseScreen()
            }

            const x = address%16 + 1
            const y = Math.floor(address/16) + 1

            moveTo(x*2,y)
            process.stdout.write(String.fromCharCode(characterValue))
        },
        setUint16: (address,data)=>{
            const command = (data & 0xff00) >> 8;
            const characterValue = data & 0x00ff;

            if(command==0xff){
                eraseScreen()
            }

            const x = address%16 + 1
            const y = Math.floor(address/16) + 1

            moveTo(x*2,y)
            process.stdout.write(String.fromCharCode(characterValue))   
        }
    }
}

module.exports=createOutputDevice