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

![Screenshot 2023-11-07 at 13 23 29](https://github.com/XcmSend/api/assets/45230082/37eaee50-f46f-47de-82da-e5f5f8e7ea7f)

If you go to [polkadot-js apps sign and verify area](https://polkaodt.js.org/apps/#/signing) then paste in the transaction data and sign. then you will receive the signed transaction data as shared below. 

![Screenshot 2023-11-07 at 13 25 16](https://github.com/XcmSend/api/assets/45230082/1f2d0c61-cea9-407a-a2db-72c41ed4b2df)

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
curl -X POST -H "Content-Type: application/json" -d


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





