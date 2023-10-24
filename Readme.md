## XCMSend Json Api


## Supported chains: 
 -  Assethub  
 -  Polkadot  
 -  HydraDx  

 
### Build:  
```
npm run install
```

### Run:   
```
npm run api  
```


### Info:  


##### `/xcm-asset-transfer`:

###### Information:  
Transfer an on-chain asset from one polkadot connected parachain to another

###### Code example: 
```shell
$ curl -X POST http://127.0.0.1:8080/xcm-asset-transfer   -H "Content-Type: application/json"   -d '{
    "sourchain": "polkadot",
    "destchain": "hydradx",
    "assetid": "1984",
    "amount": 100,
    "destinationaddress": "7MinRZBqmh7SaJsNjsMuJHw3teB1Q834vvG1zSMPHQ2DQaAa"
  }'
{"txdata":"0xec04630803000100c91f0300010100b673e1853db0a7eb8a38e7a6309d0f5a39c29d929f586f7d5d1e588845e2895703040000000091010000000000"}
```


##### `/polkadot/openchannels`:

###### Information:  
Check what hrmp channels are avaliable for a parachain connected to polkadot.  

###### Code example:  
```shell
$ curl -X POST -H "Content-Type: application/json" -d '{"paraid": 1000}' http://localhost:8080/polkadot/openchannels              
{"open_hrmp_channels":[1001,1002,2000,2004,2006,2007,2011,2012,2013,2030,2031,2032,2034,2035,2040,2046,2048,2051,2094,2101,2104],"sourcechain":1000}
```


##### `/call/template`:

##### `/call/scenario`:


##### `//xcm-native-transfer`:


### Code example:  



