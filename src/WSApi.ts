export type IWSApiCall = {
    id: number,
    type: 'wsapi:call',
    data: any,
}

export type IWSApiResponse = {
    id: number,
    type: 'wsapi:response',
    status: WSApiStatus,
    data: any,
}

export enum WSApiStatus {
    'RESOLVED',
    'REJECTED',
}

export class WSApi {
    private handles = new Map<number, [(value) => {}, (error) => {}]>();
    private send: (packet) => {};
    
    constructor(send?) {
        this.send = send;
    }
    
    setSend(send) {
        this.send = send;
    }
    
    private setHandle(id, promise) {
        this.handles.set(id, promise);
    }
    
    async sendPacket(packet, callback?) {
        if (!this.send) {
            throw new Error('WSApi: No send function defined!');
        }
        
        if (callback) {
            return this.setHandle(packet.id, [
                value => callback(value),
                error => callback(undefined, error),
            ])
        }
        
        return new Promise(((...rest) => {
            this.setHandle(packet.id, rest);
            this.send(packet);
        }));
    }
    
    async call(data, callback?) {
        return this.sendPacket(this.create(data), callback);
    }
    
    resolvePacket(packet: IWSApiResponse) {
        let promise = this.handles.get(packet.id);
        
        if (packet.status === WSApiStatus.RESOLVED) {
            promise[0](packet.data);
        } else if (packet.status === WSApiStatus.REJECTED) {
            promise[1](packet.data);
        } else {
            throw new Error('WSApi: Unknown resolve packet status: ' + packet.status);
        }
    }
    
    create(object): IWSApiCall {
        return {
            id: this.getRandomId(),
            type: 'wsapi:call',
            data: object,
        };
    }
    
    static createResponse(forPacket, status, data): IWSApiResponse {
        return {
            id: forPacket.id,
            type: 'wsapi:response',
            status,
            data,
        }
    }
    
    private getRandomId() {
        let rid;
        
        // Duplicate id safe. Is there a better way?
        while (this.handles.has(rid = WSApi.generateRandomId())) {
            rid = WSApi.generateRandomId();
        }
        
        return rid;
    }
    
    private static generateRandomId() {
        return Math.floor(Math.random() * 999999999);
    }
}