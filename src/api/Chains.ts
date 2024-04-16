import endpoints from './WsEndpoints'

interface ChainInfo {
  name: string
  display: string
  ws_endpoint: string
  paraid: number
  prefix: number
  token_decimals: number
  logo?: string
}

interface AssetInfo {
  deposit: string
  name: string
  symbol: string
  decimals: string
  isFrozen: boolean
}

export function isValidChain(chain: string): boolean {
  const validChains = ['polkadot', 'hydraDx', 'assetHub', 'interlay', 'moonriver', 'turing' , 'mangatax']

  return typeof chain === 'string' && validChains.includes(chain)
}

export function listChains() {
  // dict[paraid] = ChainInfo
  const chainList: Record<number, ChainInfo> = {}

  const Polkadot: ChainInfo = {
    name: 'polkadot',
    display: 'Polkadot',
    ws_endpoint: endpoints.polkadot.default,
    paraid: 0,
    prefix: 0,
    token_decimals: 10,
    logo: '/chains/polkadot.svg',
  }
  chainList[0] = Polkadot

  const HydraDX: ChainInfo = {
    name: 'hydraDx',
    display: 'Hydra DX',
    ws_endpoint: endpoints.polkadot.hydraDx,
    paraid: 2034,
    prefix: 0,
    token_decimals: 12,
    logo: '/chains/hydradx.svg',
  }
  chainList[2034] = HydraDX

  const assethub: ChainInfo = {
    name: 'assetHub',
    display: 'Asset Hub (Polkadot)',
    ws_endpoint: endpoints.polkadot.assetHub,
    paraid: 2034,
    prefix: 63,
    token_decimals: 10,
    logo: '/chains/assethub.svg',
  }
  chainList[1000] = assethub

  const interlay: ChainInfo = {
    name: 'interlay',
    display: 'Interlay Polkadot',
    ws_endpoint: endpoints.polkadot.interlay,
    paraid: 2032,
    prefix: 2032,
    token_decimals: 10, //INTR
    logo: '/chains/interlay.svg',
  }
  chainList[2032] = interlay


  const Moonriver: ChainInfo = {
    name: 'moonriver',
    display: 'Moonriver (Kusama)',
    paraid: 2023,
    ws_endpoint: endpoints.kusama.moonriver,
    prefix: 42, 
    token_decimals: 18, 
    logo: '/chains/moonriver.svg',
  //  parachain: true, 
  //  relayParent: "kusama",
 //   relay: false
  };
  chainList[2023] = Moonriver;

  const MangataX: ChainInfo = {
    name: "mangatax",
    display: "MangataX (Kusama)",
    paraid: 2110,
    prefix: 42,
    token_decimals: 12,
    logo: '/chains/mangata.png',
    ws_endpoint: endpoints.kusama.mangata,

  };

  chainList[2110] = MangataX;

  const Turing: ChainInfo = {
    name: 'turing',
    display: 'Turing (Kusama)',
    paraid: 2114,
    prefix: 51,
    token_decimals: 10,
    logo: '/chains/turing.png',
    ws_endpoint: endpoints.kusama.turing,

  };
  chainList[2114] = Turing;


  const rococo: ChainInfo = {
    name: 'rococo',
    display: 'Rococo',
    ws_endpoint: endpoints.polkadot.assetHub,
    paraid: 0,
    prefix: 0,
    token_decimals: 12,
    logo: '/chains/rococo.jpeg',
  }
  chainList[10000] = rococo

  return chainList
}

// handle matching chains easier
export enum supported_Polkadot_Chains {
  polkadot,
  hydradx,
  assethub,
  interlay,
  moonriver,
  turing,
  mangatax
}

/// send the 90% of the dot to be converted to USDT, the rest will be sent
/// directly to assethub
// in order to cover tx fee's

export const CHAIN_METADATA = {
  polkadot: {
    chain: 'Polkadot',
    endpoints: [
      'wss://polkadot-rpc.dwellir.com',
      'wss://rpc.polkadot.io',
      'wss://polkadot.api.onfinality.io/public-ws',
    ],
    queryBalancePaths: ['system.account'],
    transferFunction: 'xcmPallet.limitedReserveTransferAssets',
    nativeAccount: true,
  },
  hydraDx: {
    chain: 'HydraDX',
    endpoints: [
      'wss://hydradx-rpc.dwellir.com',
      'wss://hydradx.api.onfinality.io/public-ws',
      'wss://rpc.hydradx.cloud',
    ],
    queryAssetPaths: ['assetRegistry.assets'],
    queryBalancePaths: ['system.account', 'tokens.accounts'],
    transferFunction: 'xTokens.transferMultiasset',
    nativeAccount: true,
  },
  interlay: {
    chain: 'interlay',
    endpoints: ['wss://rpc-interlay.luckyfriday.io', 'wss://interlay-rpc.dwellir.com'],
    queryAssetPaths: ['assetRegistry.metadata'],
    queryBalancePaths: ['system.account'],
    nativeAccount: true,
  },
  assetHub: {
    chain: 'AssetHub',
    endpoints: ['wss://statemine-rpc.dwellir.com', 'wss://polkadot-asset-hub-rpc.polkadot.io', 'wss://statemint.api.onfinality.io/public-ws'],
    queryAssetPaths: ['assets.metadata'],
    queryBalancePaths: ['system.account', 'assets.account'],
    nativeAccount: true,
  },

  mangatax: {
    chain: "mangatax",
    endpoints: [
        "wss://kusama-archive.mangata.online",
        "wss://kusama-rpc.mangata.online",
    ],
    queryAssetPaths: ["assetRegistry.metadata"],  
    queryBalancePaths: ["system.account"],
    nativeAccount: true,
},
moonriver: {
    chain: "moonriver",
    endpoints: [
        "wss://moonriver-rpc.dwellir.com",
        "wss://wss.api.moonriver.moonbeam.network"
    ],
    queryAssetPaths: ["assetRegistry.metadata"],  
    queryBalancePaths: ["system.account" ,"assets.accounts"],
    nativeAccount: true
},

turing: {
    chain: "turing",
    endpoints: [
        "wss://rpc.turing.oak.tech"
    ],
    queryAssetPaths: ["assetRegistry.metadata"],  
    queryBalancePaths: ["system.account" ,"tokens.accounts"],
    nativeAccount: true
},


}

export { AssetInfo, ChainInfo }
