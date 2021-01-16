export type IWSApiCall = {
    id: number,
    data: any,
}

export type IWSApiCallInvasive = {
    [key: string]: any,
    _wsapiId: number,
}

export type IWSApiResponse = {
    id: number,
    status: WSApiStatus,
    data: any,
}

export type IWSApiResponseInvasive = {
    [key: string]: any,
    _wsapiId: number,
    _wsapiStatus: WSApiStatus,
}

export enum WSApiStatus {
    'RESOLVED',
    'REJECTED',
}

export class WSApi {
    private handles = new Map<number, [(value) => {}, (error) => {}]>();
    private readonly invasive: boolean = false;
    private send: (packet) => {};
    
    constructor(invasive?, send?) {
        this.invasive = invasive;
        this.send = send;
    }
    
    setSend(send) {
        this.send = send;
        return this;
    }
    
    private setHandle(packet, promise) {
        let id = this.invasive ? (<IWSApiResponseInvasive>packet)._wsapiId : packet.id;
        this.handles.set(id, promise);
    }
    
    async sendPacket(packet, callback?) {
        if (!this.send) {
            throw new Error('WSApi: No send function defined!');
        }
        
        if (callback) {
            return this.setHandle(packet, [
                value => callback(value),
                error => callback(undefined, error),
            ])
        }
        
        return new Promise(((...rest) => {
            this.setHandle(packet, rest);
            this.send(packet);
        }));
    }
    
    async call(data, callback?) {
        return this.sendPacket(this.create(data), callback);
    }
    
    resolvePacket(packet: IWSApiResponse | IWSApiResponseInvasive) {
        let id = this.invasive ? (<IWSApiResponseInvasive>packet)._wsapiId : packet.id;
        let promise = this.handles.get(id);
    
        let status = this.invasive ? (<IWSApiResponseInvasive>packet)._wsapiStatus : packet.status;
        if (status === WSApiStatus.RESOLVED) {
            promise[0](this.invasive ? packet : packet.data);
        } else if (status === WSApiStatus.REJECTED) {
            promise[1](this.invasive ? packet : packet.data);
        } else {
            throw new Error('WSApi: Unknown resolve packet status: ' + status);
        }
    }
    
    create(object): IWSApiCall | IWSApiCallInvasive {
        if (this.invasive) {
            return {
                ...object,
                _wsapiId: this.getRandomId(),
                _wsapiType: 'wsapi:call',
            }
        }
        
        return {
            id: this.getRandomId(),
            data: object,
        };
    }
    
    static createResponse(forPacket, status, data): IWSApiResponse {
        return {
            id: forPacket.id,
            status,
            data,
        }
    }
    
    static createInvasiveResponse(forPacket, status, data): IWSApiResponseInvasive {
        return {
            ...data,
            _wsapiId: forPacket._wsapiId,
            _wsapiStatus: status,
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