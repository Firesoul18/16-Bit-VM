const createMemory=(size)=>{
    let ab = new ArrayBuffer(size)
    return new DataView(ab)
}

module.exports=createMemory