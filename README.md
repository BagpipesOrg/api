# Bagpipes Json API  


![Discord](https://img.shields.io/discord/1155878499240914944?logo=discord&link=https%3A%2F%2Fdiscord.gg%2FfJYcgrB2F)
[![Book - mdbook](https://img.shields.io/badge/Book-mdbook-orange?logo=gitbook&logoColor=white&style=flat-square)](https://xcmsend.github.io)   
 [![General badge](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)](https://shields.io/)

[xcmsend.github.io/api](https://xcmsend.github.io/api/index.html)

## Supported chains: 
 -  Assethub(Polkadot)
 -  Polkadot  
 -  HydraDx(Polkadot)  
 -  Interlay(Polkadot)   
 -  Turing(Kusama)  
 -  Moonriver(Kusama)


## DB:    
Right now the API just use a simple key value inspired json file to store the diagram data, the file can be found at *dist/src/api/urls2.json*.   
The format is `{storage_key, compressed_diagramdata}`  
    
 Reset db:   
 ```shell
 echo "{urls:[]}" > dist/src/api/urls2.json
 ```

## Run Development Server

```shell
$ npm run start  
```


### Build:  
```shell
$ npm run build
```

### Run the Build:   
```shell
$ npm run api  
```
**Note:**
If you want to enable webhooks, you need to set the enviromental variable:
```shell
$ export WEBHOOK_SITE_API_KEY =
```









### Info:  

##### Path: `/api/scenario/info`;   
Get information about a scenario.  

### Code:
```shell
$ curl -X POST -H "Content-Type: application/json" -d '{"id": "Uvervffcw"}' http://localhost:8080/api/scenario/info
$ {"result":"assetHub > xTransfer > polkadot"}
```


##### Path: `/api/template/stats/<chain>`:  

### Code:
```shell
curl http://127.0.0.1:8080/api/template/stats/assetHub
{"Amount":2} 
curl http://127.0.0.1:8080/api/template/stats/polkadot
{"Amount":1}
```

##### Path: `/api/actions/query`:

### Code:
```shell
curl -X POST -H "Content-Type: application/json" -d '{"chain": "polkadot", "pallet_name": "timestamp", "method_name": "now", "params": []}' http://localhost:8080/api/actions/query
{"result":"1,716,394,878,001"}
```


##### Path: `/api/actions/generic-tx-gen`:

Description:


### Code:
```shell
curl -X POST -H "Content-Type: application/json" -d '{"chain": "polkadot", "pallet_name": "System", "method_name": "remark", "params": ["0xDEADBEEF"]}' http://localhost:8080/api/actions/generic-tx-gen
{"result":"0x2004000010deadbeef"}
```




##### Path: `/api/scenario/info/full`;   
Get full information about a scenario.  

### Code:

```shell
$ curl -X POST -H "Content-Type: application/json" -d '{"id": "Ts5hx-ng7"}' http://localhost:8080/api/scenario/info/full
{"result": "tx":"0xe804630903000100a10f0300010100f621771ddf37d482210b8c59617952eb1c2b40cfec55df47215231365186a057030400000000500000000000","summary":"polkadot > xTransfer > assetHub","asset":"0","amount":"20","source_chain":"polkadot","dest_chain":"assetHub","txtype":"xTransfer"}}
```
**Note:** replace `Ts5hx-ng7` with your scenario id key.   

##### Output format:
```json 
{
  "result": {
    "tx": "0xe804630903000100a10f0300010100f621771ddf37d482210b8c59617952eb1c2b40cfec55df47215231365186a057030400000000500000000000",
    "summary": "polkadot > xTransfer > assetHub",
    "asset": "0",
    "amount": "20",
    "source_chain": "polkadot",
    "dest_chain": "assetHub",
    "txtype": "xTransfer"
  }
}
```


TODO

##### Path: `/api/scenario/create`;   
Create a new scenario.  
### Code:
```shell
$ curl -X POST -H "Content-Type: application/json" -d '{"source_chain": "turing", "dest_chain": "moonriver", "destination_address": "my dest address goes here", "amount": 100, "assetid": 0}' http://localhost:8080/api/scenario/create 
```
    
After your scenario id is generated, you can import it in the ui:   
`http://localhost:5173/#/create/?diagramData=MY_SCENARIO_ID`
    
TODO



##### Path: `/api/xcm/asset-transfer`:
Generate a raw xcm transaction.   


######  Code example: 
```shell
curl -X POST http://127.0.0.1:8080/api/xcm/asset-transfer   -H "Content-Type: application/json"   -d '{
    "sourchain": "polkadot",
    "destchain": "assetHub",
    "assetid": "0",
    "amount": 1000000000,
    "destinationaddress": "5GYdCV9F3gg9gnmWU8nrt8tXCxMXDbcGpsdX1gJStCx9yZKK"
  }'
```

###### Result:
```json
{"txdata":"0xf404630903000100a10f0300010100c63c1fb2c2d4a97b9aa07b951159b273e0d6a740914f71c074a93499d10e3e4503040000000002286bee0000000000"}
```

*input:*   
- sourchain = assethub/hydradx/polkadot   
- deschain = hydradx/polkadot/assethub   
- assetid = id of asset to send   
- amount = raw amount to send   
- destination address = address of reciever on the destination chain  

The developer can then create their own frontend so that their user can sign the transaction. Thereafter, the transaction can be broadcast. 


##### Path: `/api/hrmp/polkadot/openchannels`:

###### Information:  
Check what hrmp channels are avaliable for a parachain connected to polkadot.  

###### Code example:  
```shell
curl -X POST -H "Content-Type: application/json" -d '{"paraid": 1000}' http://localhost:8080/api/hrmp/polkadot/openchannels
```

*Input:*
```json       
{"open_hrmp_channels":[1001,1002,2000,2004,2006,2007,2011,2012,2013,2030,2031,2032,2034,2035,2040,2046,2048,2051,2094,2101,2104],"sourcechain":1000}
```

*input:*   
paraid = the paraid(as number) of the chain  


###### Path: /api/chain/Broadcast

Broadcast a transaction using author submit extrinsics.

##### Example code:  
```shell
curl -X POST -H "Content-Type: application/json" -d '{
  "chain": "polkadot",
  "tx": "0x91028400f2529946850f8dd66c794a795a6b01a911f25df007e4cf5f97f38a037380f2500114903d6caaa301dfc22a6d19df61ba38b547a70a492eb57bcdcb9298161b18562e13421b314c22a9e007c9e49583f77bb0faf7047f6456c78c5487225e1a8f84b500a50200630903000100a10f0300010100f2529946850f8dd66c794a795a6b01a911f25df007e4cf5f97f38a037380f25003040000000002286bee0000000000"
}' http://127.0.0.1:8080/api/chain/Broadcast
```

```
{"status":"broadcasted","hash":"0xf9b86cd2121c25685b5bbf9efffc5f6c81e7d3b568811860de36dccb09837d2b"}
```

*input:*   
- chain = assethub/hydradx/polkadot    
- tx = signed transaction   


##### Testing broadcast:
In order to test the broadcast feature a user must: 
-  1: git clone https://github.com/XcmSend/api/
-  2: edit src/api/tests.ts
-  3: change the seedphrase to an account that has enough tokens to pay tx fee's in the `get_test_acccount` function:
```typescript
export function get_test_account() {

	const e0 = new Keyring({ type: 'sr25519' });
	const account = e0.addFromUri('SET SEEDPHRASE HERE');

	return account;
}
```
-  4:  last but no least, the person needs to uncomment the following lines in the broadcast_transaction function
```
  //  const bhash = await broadcastToChain('polkadot', testo);
 //   console.log(`blockhash published: `, bhash.toString());
```
-  5: Configure the right key in get_test_account and run: npm run test 

```ts
tx_si start
generating tx..
route_tx start
polkadot:hydradx
handleTransfer for Polkadot to HydraDx...
cant connect
connect
drafting dot to hydradx
Creating tx
4
rawtx: 0xf404630803000100c91f0300010100f43376315face751ae6014e8a94301b2c27c0bc4a234e9997ed2c856d13d3d2f030400000000823801000000000000
Signature:  0x8d0284005400e2f7f5669b26998d8e4d3c1a2c8a2d0a9af827ca54a1cc3509105035c32e01286f7090ae34a1e3b8827ef9c035ede86a2b3e5c16bb6df072541327c7797d07e5934e245ae7c9ce199b2212fe559ff2df0a9ad1d66421aa3828223d8b2e9c8b45020400630803000100c91f0300010100f43376315face751ae6014e8a94301b2c27c0bc4a234e9997ed2c856d13d3d2f030400000000823801000000000000
Verfied tx: 0x8d0284005400e2f7f5669b26998d8e4d3c1a2c8a2d0a9af827ca54a1cc3509105035c32e01286f7090ae34a1e3b8827ef9c035ede86a2b3e5c16bb6df072541327c7797d07e5934e245ae7c9ce199b2212fe559ff2df0a9ad1d66421aa3828223d8b2e9c8b45020400630803000100c91f0300010100f43376315face751ae6014e8a94301b2c27c0bc4a234e9997ed2c856d13d3d2f030400000000823801000000000000
```

Copy the `verified tx` and curl it to the broadcast api:

```shell
curl -X POST -H "Content-Type: application/json" -d '{
  "chain": "polkadot",
  "tx": "0x8d0284005400e2f7f5669b26998d8e4d3c1a2c8a2d0a9af827ca54a1cc3509105035c32e01286f7090ae34a1e3b8827ef9c035ede86a2b3e5c16bb6df072541327c7797d07e5934e245ae7c9ce199b2212fe559ff2df0a9ad1d66421aa3828223d8b2e9c8b45020400630803000100c91f0300010100f43376315face751ae6014e8a94301b2c27c0bc4a234e9997ed2c856d13d3d2f030400000000823801000000000000"
}' http://127.0.0.1:8080/broadcast
```

Result:  
`{"status":"broadcasted","hash":"0xf9b86cd2121c25685b5bbf9efffc5f6c81e7d3b568811860de36dccb09837d2b"}`

### Public instance:
```shell
$ curl https://api.xcmsend.com
{"success":true,"documentation":"https://xcmsend.github.io/api/index.html"}
```
