import {WSApi, WSApiStatus} from "../src/WSApi";

let ef = () => {
};

describe('WSApi', function () {
    it('should resolve the promise with a resolve value', function () {
        return new Promise(((resolve, reject) => {
            let wsapi = new WSApi(ef);
            let packet = wsapi.create('bla');
            let value = 1234;
            wsapi.sendPacket(packet).then(rv => rv === value ? resolve() : reject()).catch(err => reject(err));
            wsapi.resolvePacket(WSApi.createResponse(packet, WSApiStatus.RESOLVED, value));
        }));
    });
    
    it('should reject promise on failure', function () {
        return new Promise(((resolve, reject) => {
            let wsapi = new WSApi(ef);
            let packet = wsapi.create('bla');
            let value = 1234;
            wsapi.sendPacket(packet).then(_ => reject()).catch(_ => resolve());
            wsapi.resolvePacket(WSApi.createResponse(packet, WSApiStatus.REJECTED, value));
        }));
    });
});