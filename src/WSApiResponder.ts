import {WSApi, WSApiStatus} from "./WSApi";

export class WSApiResponder {
    private sendFunc;
    
    setSend(sendFunc) {
        this.sendFunc = sendFunc;
    }
    
    reply(forPacket, status, ...rest) {
        if (!this.sendFunc) {
            throw new Error('WSApi: No send function defined!');
        }
        
        rest[rest.length - 1] = this.createResponse(forPacket, status, rest[rest.length - 1]);
        
        return this.sendFunc(...rest);
    }
    
    createResponse(forPacket, status, data) {
        if (this.checkIsInvasive(forPacket)) {
            return WSApi.createInvasiveResponse(forPacket, status, data);
        }
        
        return WSApi.createResponse(forPacket, status, data);
    }
    
    checkIsInvasive(packet) {
        return typeof packet === 'object' && packet._wsapiId !== undefined;
    }
    
    wrap(packet) {
        return [
            (...rest) => this.resolve(packet, ...rest),
            (...rest) => this.reject(packet, ...rest),
            this.checkIsInvasive(packet) ? packet : packet.data,
        ];
    }
    
    resolve(packet, ...rest) {
        return this.reply(packet, WSApiStatus.RESOLVED, ...rest);
    }
    
    reject(packet, ...rest) {
        return this.reply(packet, WSApiStatus.REJECTED, ...rest);
    }
}