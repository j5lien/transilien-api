# Transilien API 1.0.0

An asynchronous client library for the real time [Transilien API](https://ressources.data.sncf.com/explore/dataset/api-temps-reel-transilien/). 

```javascript
const TransilienApi = require('transilien-api');

const client = new TransilienApi({
  basic_authorization: ''
});

client.nextDepartures(trainStation)
  .then(console.log)
  .catch(console.error);
```

## Installation

`npm install transilien-api`

You can follow instructions [here](https://ressources.data.sncf.com/explore/dataset/api-temps-reel-transilien/) to get your access authorization. 

```javascript
const TransilienApi = require('transilien-api');

const client = new TransilienApi({
  basic_authorization: '<basic token>'
});
```

## Requests

### With endpoints

You now have the ability to make GET requests against the API via the convenience methods.

```javascript
client.get(path, params);
```

You simply need to pass the endpoint and parameters to one of convenience methods. Take a look at the [documentation site](https://ressources.data.sncf.com/explore/dataset/api-temps-reel-transilien/) to reference available endpoints.

```javascript
client.get(`/gare/87758011/depart/87384008/`);
```

### With client methods

You can use the defined client methods to call endpoints.

```javascript
client.nextDeparturesToDestination(87758011, 87384008);
```

## Promises

The request will return Promise.


```javascript
client.nextDeparturesToDestination(87758011, 87384008)
  .then(data => console.log(data))
  .catch(function (e) {
    throw e;
  });
```
