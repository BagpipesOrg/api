import { Codec } from '@polkadot/types/types'
import connectToWsEndpoint from './connect'
import { ApiPromise } from '@polkadot/api'
import { SubmittableExtrinsic } from '@polkadot/api/types'

function resolveMethod(api: ApiPromise, palletName: string, methodName: string, isTx: boolean): any {
  const camelPalletName = toCamelCase(palletName)
  const camelMethodName = toCamelCase(methodName)
  const namespace = isTx ? api.tx : api.query

  if (!namespace[camelPalletName] || !namespace[camelPalletName][camelMethodName]) {
    throw new Error(`The method ${methodName} is not available on the pallet ${palletName}.`)
  }
  return namespace[camelPalletName][camelMethodName]
}

function formatParams(params: any[]): any[] {
  // Ensure params are correctly formatted as an array
  return Array.isArray(params) ? params : [params]
}

export async function executeChainQueryMethod(
  chain: string,
  palletName: string,
  methodName: string,
  params: any[],
  atBlock: string,
): Promise<any> {
  const api = await connectToWsEndpoint(chain)

  const method = resolveMethod(api, palletName, methodName, false)

  const formattedParams = formatParams(params)

  try {
    let result: Codec
    if (atBlock) {
      const blockHash = await this.getBlockHash(api, atBlock)
      result = await method.at(blockHash, ...formattedParams)
    } else {
      result = await method(...formattedParams)
    }
    return result // .toHuman()
  } catch (error) {
    console.error('Error executing chain query method:', error)
    throw error
  }
}

function toCamelCase(str: string): string {
  return str.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase())
}

// chain tx node, draft the tx
export async function GenerateGenericChainTx(
  chain: string,
  palletName: string,
  methodName: string,
  params: any[],
): Promise<any> {
  const api = await connectToWsEndpoint(chain)
  const method = resolveMethod(api, palletName, methodName, true)
  const formattedParams = formatParams(params)

  try {
    let extrinsic: SubmittableExtrinsic<'promise'>

    extrinsic = method(...formattedParams) as SubmittableExtrinsic<'promise'>

    return extrinsic
  } catch (error) {
    console.error('Error executing chain tx method:', error)
    throw error
  }
}
