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