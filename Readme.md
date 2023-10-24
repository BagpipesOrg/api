## XCMSend Json Api


### Build:  
```
npm run install
```

### Run:   
```
npm run api  
```


### Info:  

##### `/polkadot/xcm-asset-transfer`:


##### `/xcm-native-transfer`:
```shell
$ curl -X POST http://127.0.0.1:8080/xcm-asset-transfer   -H "Content-Type: application/json"   -d '{
    "sourchain": "polkadot",
    "destchain": "hydradx",
    "assetid": "1984",
    "amount": 100,
    "scenarioid": "7MinRZBqmh7SaJsNjsMuJHw3teB1Q834vvG1zSMPHQ2DQaAa"
  }'
{"txdata":"0xec04630803000100c91f0300010100b673e1853db0a7eb8a38e7a6309d0f5a39c29d929f586f7d5d1e588845e2895703040000000091010000000000"}
```


##### `/polkadot/openchannels`:

##### `/call/template`:

##### `/call/scenario`:


##### `//xcm-native-transfer`:


### Code example:  



