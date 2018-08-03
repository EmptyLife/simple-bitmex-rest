const BitMexApi = require('bit_mex_api');
const ApiClient = require('./lib/ApiClient');

class BitmexRest {
	constructor(options) {
		
		this._options = Object.assign({
			marginRateLimit: 20,
			
			singExpires: 60e3,
			apiKeyID: null,
			apiKeySecret: null,	
			
			testnet: false,
		}, options);
		
		this._apiClient = new ApiClient(Object.assign({}, this._options));
		
		this._marginRateLimitTime = 0;
		
		Object.assign(this, this._createApiGroupList(BitMexApi, this._apiClient));
	}
	_getComCtx() {
		return (this._apiClient._common_context_bitmex_rest_n9s8r7m67m6a3c3bvn4s798 = this._apiClient._common_context_bitmex_rest_n9s8r7m67m6a3c3bvn4s798 || {});
	}

	_createApiGroupList(BitMexApi, apiClient) {
		const dst = {};
		for(let apiGroupPropName in BitMexApi) {
			const m = apiGroupPropName.match(/(\w+)Api$/);
			if ( m ) {
				dst[m[1]] = this._createApiGroup(BitMexApi, apiClient, m[0], m[1]);
			}
		}
		return dst;
	}
	_createApiGroup(BitMexApi, apiClient, prop, name) {
		const dst = {};
		
		const name_l = name[0].toLowerCase() + name.substr(1);
		const apiGroup = new BitMexApi[prop](apiClient);

		for(let apiPropName in apiGroup) {
			if ( apiPropName.indexOf(name_l) === 0 ) {
				const fnOrig = apiGroup[apiPropName].bind(apiGroup);
				let newApiName = apiPropName.substr(name_l.length);
				newApiName = newApiName[0].toLowerCase() + newApiName.substr(1);

				dst[newApiName] = this._fnWrapper(fnOrig);
			}
		}
			
		return dst;
	}
	_fnWrapper(fnOrig) {
		return async (..._args) => {
			return new Promise((resolve, reject) => {
				if ( this._marginRateLimitTime >= Date.now() ) {
					setTimeout(() => {
						reject(new Error("Limit request"));
					}, 10);
					return;
				}
				
				const args = [];
				for(const arg of _args) {
					if ( typeof arg === "function" ) {
						reject(new Error("Arguments error"));
					}
					args.push(arg);
				}

				args.push((error, data, response) => {
					this._prepareResponseError(error);
					if ( error ) {
						reject(error);
					}
					
					
					const remaining = response && response.headers && +response.headers["x-ratelimit-remaining"];
					if ( typeof remaining === "number" && remaining <= this._options.marginRateLimit ) {
						this._marginRateLimitTime = Date.now() + (this._options.marginRateLimit - remaining) * 1e3;
					}
		
					resolve({data, response});
				});
							
				fnOrig(...args);
			});
		};
	}
	_prepareResponseError(error) {
		try {
			const {name, message} = error.response.body.error;
			error.message += `(${name}:${message})`;
		} catch(e) {}
	}

}

module.exports = BitmexRest;
