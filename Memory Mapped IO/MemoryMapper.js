class MemoryMapper {
    constructor() {
        this.regions = [];

        this.map = (device, start, end, remap) => {
            const region = {
                device,
                start,
                end,
                remap
            };

            this.regions.unshift(region)

            return () => {
                this.regions = this.regions.filter(x => x !== region)
            }

        }
    }

    findRegion(address) {
        let region = this.regions.find(region => address >= region.start && address <= region.end)
        if (!region) {
            throw new Error(`Region Not Found On Address: ${address}`)
        }
        return region
    }

    getUint16(address) {
        let region = this.findRegion(address)
        let finalAddress = region.remap ? address - region.start : address
        return region.device.getUint16(finalAddress)
    }

    setUint16(address,value){
        let region = this.findRegion(address)
        let finalAddress = region.remap ? address - region.start : address
        return this.region.setUint16(address,value)
    }

    getUint8(address) {
        let region = this.findRegion(address)
        let finalAddress = region.remap ? address - region.start : address
        return region.device.getUint8(finalAddress)
    }

    setUint8(address,value){
        let region = this.findRegion(address)
        let finalAddress = region.remap ? address - region.start : address
        return this.region.setUint8(address,value)
    }
}

module.exports=MemoryMapper