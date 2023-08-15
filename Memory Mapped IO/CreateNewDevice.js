function createNewDevice(){
    return {
        getUint8 : ()=>0,
        getUint16: ()=>0,
        setUint8:  (address,value)=>{
            process.stdout.write("0x"+value.toString(16))
        },
        setUint16: (address,value)=>{
            process.stdout.write("0x"+value.toString(16))
        }
    }
}

module.exports=createNewDevice