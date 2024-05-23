import { TradeRouter, CachingPoolService, PoolType } from '@galacticcouncil/sdk'
import connectToWsEndpoint from './connect'

let tradeRouter: any

async function initializeTradeRouter() {
  const api = await connectToWsEndpoint('hydraDx')

  console.log(`getHydraDx Initializing PoolService...`)
  const poolService = new CachingPoolService(api)

  console.log(`getHydraDx Initializing TradeRouter...`)
  tradeRouter = await new TradeRouter(poolService)
  console.log(`getHydraDx TradeRouter:`, tradeRouter)
  console.log(`getting results..`)
  const result = await tradeRouter.getAllAssets()
  console.log(`getHydraDx All assets:`, result)
}

export async function getHydraDxSpotPrice(assetIn: string, assetOut: string) {
  if (!tradeRouter) {
    await initializeTradeRouter()
  }
  console.log(`got trade router`)
  console.log(`calling getBestSpotPrice`)
  const spotPrice = await tradeRouter.getBestSpotPrice(assetIn, assetOut)
  console.log(`getHydraDx Spot price for ${assetIn} to ${assetOut}: ${JSON.stringify(spotPrice, null, 2)}`)
  console.log(`got spot price`)
  return spotPrice.toString()
}
export async function getHydraDxSellPrice(assetIn: string, assetOut: string, amount: number) {
  console.log(`getHydraDx Getting selling details...`)
  if (!tradeRouter) {
    console.log(`getHydraDx Initializing TradeRouter in teh getHydraDxSell function...`)
    await initializeTradeRouter()
  }

  console.log(`getHydraDx Getting selling details...`)
  console.log(`assetIn, assetOut, amount:`, assetIn, assetOut, amount)
  const tradeDetails = await tradeRouter.getBestSell(assetIn, assetOut, amount)
  console.log(`i got trade details!`)
  console.log(`getHydraDx trade details:`, tradeDetails.toHuman())

  return tradeDetails.toHuman()
}

// simplified route interface for hydradx
interface MyRoute {
  pool: PoolType | { Stableswap: number }
  assetIn: string
  assetOut: string
}

/// get the swap routes for hdx
export async function hdx_get_routes(assetin: string, assetout: string, amountin: number): Promise<MyRoute[]> {
  const routes: MyRoute[] = []
  if (!tradeRouter) {
    await initializeTradeRouter()
  }
  console.log(`got trade router`)
  console.log(`calling getBestBuy`)
  const bestBuy = await tradeRouter.getBestBuy(assetin, assetout, amountin)

  for (const swap of bestBuy.swaps) {
    const routeObject: MyRoute = {
      pool: swap.pool === PoolType.Stable ? { Stableswap: swap.assetIn } : swap.pool,
      assetIn: swap.assetIn,
      assetOut: swap.assetOut,
    }
    routes.push(routeObject)
  }
  return routes
}

interface HydradxAssetSymbolDecimalsResponse {
  name: string
  assetType: string
  existentialDeposit: string
  symbol: string
  decimals: number
  xcmRateLimit: null | any // You can specify a more precise type if known
  isSufficient: boolean
}

export async function getHydradxAssetSymbolDecimals(assetid: number): Promise<HydradxAssetSymbolDecimalsResponse> {
  console.log(`getHydradxAssetSymbolDecimals assetid`, assetid)
  const api = await connectToWsEndpoint('hydraDx')
  const resp = (await api.query.assetRegistry.assets(assetid)).toHuman() as any
  const assetInfo: HydradxAssetSymbolDecimalsResponse = {
    name: resp.name,
    assetType: resp.assetType,
    existentialDeposit: resp.existentialDeposit,
    symbol: resp.symbol,
    decimals: parseInt(resp.decimals),
    xcmRateLimit: resp.xcmRateLimit,
    isSufficient: resp.isSufficient,
  }
  return assetInfo
}

export async function hydradx_omnipool_sell(
  assetin: string,
  assetout: string,
  rawamount: number,
  submitamount: number,
) {
  const api = await connectToWsEndpoint('hydraDx')
  const pinfo = await getHydraDxSellPrice(assetin, assetout, rawamount)

  const aout = pinfo.amountOut

  //const aout = sellprice.amountOut;
  const resp: any = await getHydradxAssetSymbolDecimals(Number(assetin))

  const tokenDecimals = Number(resp.decimals)
  const minBuyAmount = BigInt(Math.round(aout * 1e10))
  console.log(`[hydradx_omnipool_sell] my input:`, assetin, assetout, rawamount, minBuyAmount, submitamount)

  // two options for swaps, omnipool sell or router sell
  console.log(`sorting out the route`)
  // get the swap routes
  const route = await hdx_get_routes(assetin, assetout, rawamount)
  var tx: any
  console.log(`working with: `, assetin, assetout, submitamount)
  console.log(`got route back: `, route)
  if (route.length == 1) {
    console.log(`route log`)
    console.log(route[0])
    if (route[0].pool == 'Omnipool') {
      console.log(`omnipool only detected`)
      tx = await api.tx.omnipool.sell(assetin, assetout, submitamount, minBuyAmount)
      console.log(`omnipool tx drafted`)
      console.log(tx.toHex())
    }
  } else {
    tx = await api.tx.router.sell(
      assetin.toString(),
      assetout.toString(),
      submitamount.toString(),
      minBuyAmount / BigInt(10000),
      route,
    )
    console.log(`selltx router.sell drafted`)
  }
  console.log(`final tx:`)
  console.log(tx.toHuman())
  console.log(tx.toHex())

  return tx
}
