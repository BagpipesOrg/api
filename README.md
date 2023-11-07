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
    "sourchain": "assethub",
    "destchain": "hydradx",
    "assetid": "1984",
    "amount": 1000000,
    "destinationaddress": "7MinRZBqmh7SaJsNjsMuJHw3teB1Q834vvG1zSMPHQ2DQaAa"
  }'
```

###### 2. Sign Extrinsic: 

Here is a manual way to sign the transaction. 
![Screenshot 2023-11-07 at 13 30 19](https://github.com/XcmSend/api/assets/45230082/6e94ab93-96db-4bc2-af81-c6871971a632)

If you go to [polkadot-js apps sign and verify area](https://polkaodt.js.org/apps/#/signing) then paste in the transaction data and sign. then you will receive the signed transaction data as shared below. 

![Screenshot 2023-11-07 at 13 31 00](https://github.com/XcmSend/api/assets/45230082/3b37c373-88f7-47ea-b9bd-119eab4902f2)


Then you can use that signed transaction data to broadcast:

```json
{"signed_transaction_data": "0x28be425591af35b9195d252f5b07f3a998ac1a8577181e387c6966c92eec4300ab8bfe8f7fffdac7c87cabd0358eac87368e770c45b9f54df5e2370979498e85" }
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

###### Broadcast:

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





