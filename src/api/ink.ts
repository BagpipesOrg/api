import { ApiPromise } from '@polkadot/api'
import { ContractPromise } from '@polkadot/api-contract'
import connectToWsEndpoint from './connect'

// list !ink contracts on chain
async function get_contracts(api: ApiPromise) {
  const keys = await api.query.contracts.contractInfoOf.keys()
  return keys
}

export async function list_contracts_on_roc_contracts() {
  const api = await connectToWsEndpoint('rococo_contracts')
  const loot = await get_contracts(api)
  return loot
}

export async function roc_contract_info(address: string, abiJson: any) {
  const api = await connectToWsEndpoint('rococo_contracts')
  console.log(`[roc_contract_info] connected to ROC`)
  const out = await contract_info(api, address, abiJson)
  console.log(`[roc_contract_info] contract_info ok`)
  return out
}

/// input: apipromise, contract address, abijson blob
export async function contract_info(api: any, address: string, abiJson: any) {
  console.log(`[contract_info] `)
  const contract = new ContractPromise(api, abiJson, address)
  const messages = contract.abi.messages // abi.types to get the types
  const messageList = []
  messages.forEach((message) => {
    const messageStruct = {
      function_name: message.method,
      selector: message.selector.toString(),
      mutates: message.isMutating,
      args: message.args.map((arg) => `${arg.name}: ${arg.type.displayName || arg.type.type}`),
    }

    // Add the struct to the list
    messageList.push(messageStruct)
  })

  return messageList
}
