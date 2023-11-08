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


###### Code example: 
```shell
curl -X POST http://127.0.0.1:8080/xcm-asset-transfer   -H "Content-Type: application/json"   -d '{
    "sourchain": "assethub",
    "destchain": "hydradx",
    "assetid": "1984",
    "amount": 100,
    "destinationaddress": "7MinRZBqmh7SaJsNjsMuJHw3teB1Q834vvG1zSMPHQ2DQaAa"
  }'
```

###### Result:
```json
{"txdata":"0xec04630803000100c91f0300010100b673e1853db0a7eb8a38e7a6309d0f5a39c29d929f586f7d5d1e588845e2895703040000000091010000000000"}
```

*input:*   
- sourchain = assethub/hydradx/polkadot    
- deschain = hydradx/polkadot/assethub   
- assetid = id of asset to send   
- amount = raw amount to send   
- destination address = address of reciever on the destination chain  

The developer can then create their own frontend so that their user can sign the transaction. Thereafter, the transaction can be broadcast. 




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
Broadcast:

```typescript
async function broadcast_transaction() {
    await cryptoWaitReady();
    console.log(`broadcast_transaction start`);
    console.log(`generating tx..`);
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

