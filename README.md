# simple-bitmex-rest

##Install
```
npm i EmptyLife/simple-bitmex-rest
```

##Example
```javascript
const BitmexRest = require('./simple-bitmex-rest');
const bitmexRest = new BitmexRest({
	apiKeyID: "*****",
	apiKeySecret: "*****",
});
(async () => {
	try {
		let {data, response} = await bitmexRest.Chat.get({count: 1});
		
		console.log(data);
		
	} catch(error) {
		console.log(error.message)
	}
	
})();
```
