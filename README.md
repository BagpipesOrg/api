## XCMSend Json API


## Supported chains: 
 -  Assethub  
 -  Polkadot  
 -  HydraDx  

 
### Build:  
```
npm run buildme
```

### Run:   
```
npm run api  
```


### Info:  


##### `/xcm-asset-transfer`:

###### Description:  
In order to send a transaction from one chain to another in the polkadot network, we split it into 3 things:


1. First we need to draft a transaction;
2. Then we need to sign it. 
3. Then boradcast.

Here we deal with 1) drafting a transaction. 


###### 1. Draft transaction: code example: 
```shell
curl -X POST http://127.0.0.1:8080/xcm-asset-transfer   -H "Content-Type: application/json"   -d '{
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


###### 2. Sign Extrinsic: 

Here is a manual way to sign the transaction. 
![Screenshot 2023-11-07 at 13 30 19](https://github.com/XcmSend/api/assets/45230082/6e94ab93-96db-4bc2-af81-c6871971a632)

If you go to [polkadot-js apps sign and verify area](https://polkaodt.js.org/apps/#/signing) then paste in the transaction data and sign. then you will receive the signed transaction data as shared below. 

![Screenshot 2023-11-07 at 13 31 00](https://github.com/XcmSend/api/assets/45230082/3b37c373-88f7-47ea-b9bd-119eab4902f2)


Then you can use that signed transaction data to broadcast:

```json
{"signed_transaction_data": "EXAMPLE_0x28be425591af35b9195d252f5b07f3a998ac1a8577181e387c6966c92eec4300ab8bfe8f7fffdac7c87cabd0358eac87368e770c45b9f54df5e2370979498e85" }
```


###### 3.  Broadcast:

Then use the signed transaction data and pass it it into the 

```shell
curl -X POST -H "Content-Type: application/json" -d '{
  "chain": "polkadot",
  "tx": "0x91028400f2529946850f8dd66c794a795a6b01a911f25df007e4cf5f97f38a037380f2500114903d6caaa301dfc22a6d19df61ba38b547a70a492eb57bcdcb9298161b18562e13421b314c22a9e007c9e49583f77bb0faf7047f6456c78c5487225e1a8f84b500a50200630903000100a10f0300010100f2529946850f8dd66c794a795a6b01a911f25df007e4cf5f97f38a037380f25003040000000002286bee0000000000"
}' http://127.0.0.1:8080/broadcast
```

```
{"status":"broadcasted"}
```

##### `/polkadot/openchannels`:

###### Information:  
Check what hrmp channels are avaliable for a parachain connected to polkadot.  

###### Code example:  
```shell
curl -X POST -H "Content-Type: application/json" -d '{"paraid": 1000}' http://localhost:8080/polkadot/openchannels 
```

*Input:*
```json       
{"open_hrmp_channels":[1001,1002,2000,2004,2006,2007,2011,2012,2013,2030,2031,2032,2034,2035,2040,2046,2048,2051,2094,2101,2104],"sourcechain":1000}
```

*input:*   
paraid = the paraid(as number) of the chain  

##### `/broadcast`:

###### Information:  
Broadcast a transaction using author submitextrinsics 

*input:*   
- chain = assethub/hydradx/polkadot    
- tx = signed transaction   

##### Testing broadcast:
In order to test the broadcast feature a user must: 
-  1: git clone https://github.com/XcmSend/api/
-  2: edit src/api/tests.ts
-  3: change the seedphrase to an account that has enough tokens to pay tx fee's in the `get_test_acccount` function:
```
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
-  5: run: npm run test 

Broadcast:

```typescript
async function broadcast_transaction() {
    await cryptoWaitReady();
    console.log(`broadcast_transaction start`);
    console.log(`generating tx..`);
/// set your account keys in the get_test_account to sign and broadcast it in the src/api/tests.ts file
    const alice = get_test_account();
    const pa_tx = (await route_tx('polkadot', 'hydradx', 0, 20000, '16XByL4WpQ4mXzT2D8Fb3vmTLWfHu7QYh5wXX34GvahwPotJ'));
    console.log(`rawtx:`, pa_tx.toHex());
    const api = await connectToWsEndpoint('polkadot');
    const signhere = await pa_tx.signAsync(alice);
    console.log(`Signature: `, signhere.toHex());
    const testo = api.tx(signhere); // this will break if the tx is invalid
    console.log(`Verfied tx:`, testo.toHex());
    const bhash = await broadcastToChain('polkadot', testo);
    console.log(`blockhash published: `, bhash.toString());
    console.log(`broadcast_transaction done`);
}
```

Configure the right key in get_test_account and run the tx signing:
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

Copy the verified tx and curl it to the broadcast api:

```shell
curl -X POST -H "Content-Type: application/json" -d '{
  "chain": "polkadot",
  "tx": "0x8d0284005400e2f7f5669b26998d8e4d3c1a2c8a2d0a9af827ca54a1cc3509105035c32e01286f7090ae34a1e3b8827ef9c035ede86a2b3e5c16bb6df072541327c7797d07e5934e245ae7c9ce199b2212fe559ff2df0a9ad1d66421aa3828223d8b2e9c8b45020400630803000100c91f0300010100f43376315face751ae6014e8a94301b2c27c0bc4a234e9997ed2c856d13d3d2f030400000000823801000000000000"
}' http://127.0.0.1:8080/broadcast
```

Result:  
`{"status":"broadcasted","hash":"0xf9b86cd2121c25685b5bbf9efffc5f6c81e7d3b568811860de36dccb09837d2b"}`


