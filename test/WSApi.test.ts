import {WSApi, WSApiStatus} from "../src/WSApi";

let ef = () => {
};

describe('WSApi', function () {
    it('should resolve with value', function () {
        return new Promise(((resolve, reject) => {
            let wsapi = new WSApi().setSend(ef);
            let packet = wsapi.create('bla');
            let value = 1234;
            wsapi.sendPacket(packet).then(rv => rv === value ? resolve() : reject()).catch(err => reject(err));
            wsapi.resolvePacket(WSApi.createResponse(packet, WSApiStatus.RESOLVED, value));
        }));
    });
    
    it('should reject on failure', function () {
        return new Promise(((resolve, reject) => {
            let wsapi = new WSApi().setSend(ef);
            let packet = wsapi.create('bla');
            let value = 1234;
            wsapi.sendPacket(packet).then(_ => reject()).catch(_ => resolve());
            wsapi.resolvePacket(WSApi.createResponse(packet, WSApiStatus.REJECTED, value));
        }));
    });
});

describe('WSApi invasive', function () {
    it('should resolve with value', function () {
        return new Promise(((resolve, reject) => {
            let wsapi = new WSApi(true).setSend(ef);
            let packet = wsapi.create({test: 'invasive'});
            let value = {test: 1234};
            wsapi.sendPacket(packet).then(rv => rv.test === 1234 ? resolve() : reject()).catch(err => reject(err));
            wsapi.resolvePacket(WSApi.createInvasiveResponse(packet, WSApiStatus.RESOLVED, value));
        }));
    });
    
    it('should reject on failure', function () {
        return new Promise(((resolve, reject) => {
            let wsapi = new WSApi(true).setSend(ef);
            let packet = wsapi.create({test: 'invasive'});
            let value = 'Error message';
            wsapi.sendPacket(packet).then(_ => reject()).catch(_ => resolve());
            wsapi.resolvePacket(WSApi.createInvasiveResponse(packet, WSApiStatus.REJECTED, value));
        }));
    });
});