# Websocket API

Allows to handle calls and return values over bidirectional sockets (e.g. websockets).

Assuming you want to send fetch('/user') over a socket, you face the problem that you can't work with promises or callbacks here. WSApi solves this problem by either creating a special packet or adding a wsapi id to an existing object, which WSApi can then use to resolve/reject the returned promise or call the provided callback.

Code demonstration:

```js
// unidirectional request
let user = await fetch('/user').then(response => response.json());

// wsapi
let user = await wsapi.call('/user');
```

## Usage

**If you already send your own packets over the socket, check out the [invasive mode](#invasive-mode-showcase)**

WSApi requires a send function. If you call wsapi.call(), WSApi will call the send function.

```js
// In this example we use a arbitrary websocket connection, ws.
const ws = new WebSocket('...');
const api = new WSApi();

api.setSend(packet => ws.send(packet));

ws.onmessage = function (event) { 
  let packet = event.data;
  api.resolvePacket(packet);
}

let user = api.call('/user');
```

If you use WSApi in the (default) non-invasive mode, api.call(yourData) will call the send function with
```json5
{
  id: 12936, //random integer
  type: 'wsapi',
  data: {}, // yourData
}
```

so

```js
api.call('/user');

// results in wsapi calling (packet => ws.send(packet))
ws.send({
  id: 12936,
  type: 'wsapi',
  data: '/user',
});
```

and keep in mind that the server needs to respond with the following packet structure
```json5
{
  id: 12936,
  type: 'wsapi',
  status: 'RESOLVED', // or 'REJECTED'
  data: 'return value', // your data that api.call should return
}
```

### Distinguish your packets from WSApi packets

WSApi packets contain `type: 'wsapi'` so on the server side you can check if the received packet contains this type and act accordingly.

## Packet

### Non-invasive mode (default)

```json5
// Call packet
{
  id: 12936, //random integer
  type: 'wsapi',
  data: {}, // yourData
}
```

```json5
// Response packet
{
  id: 12936, //random integer
  type: 'wsapi',
  status: 'RESOLVED', // or 'REJECTED'
  data: {}, // yourData
}
```

### Invasive mode

Since invasive mode uses your packet, it only adds two field to your provided packet.

```json5
// Call packet
{
  /* ... your packet data */
  _wsapiId: 12936,
  _wsapiType: 'wsapi',
}
```

```json5
// Response packet
{
  /* ... your packet data */
  _wsapiId: 12936,
  _wsapiType: 'wsapi',
  _wsapiStatus: 'RESOLVED', // or 'REJECTED'
}
```

## Invasive mode showcase

For example if you already send custom packets over a socket connection, you can use invasive-mode. This allows you to use wsapi side by side your existing code.

```js
// For example we want to create a new user. For this, we send a 'user:create' packet over a socket. Now normally we don't get any return value from 'ws.send' so wen need to implement our custom logic in the ws.onmessage function. If we use WSApi, we don't need to do this.

let exampleUserPacket = {
  type: 'user:create',
  attributes: {/* ... */}
};
ws.send(exampleUserPacket);

// so lets use wsapi to create a user and get the created user in return

const wsapi = new WSApi(true);

wsapi.setSend(packet => ws.send(packet));

ws.onmessage = function (event) {
  // this checks if the received packet is a wsapi packet
  if (event.data._wsapiId) {
    api.resolvePacket(packet);
  }
  
  // ... your existing message handling
}

let newUser = await wsapi.call(exampleUserPacket);

// thats it. You now can use your created user
```