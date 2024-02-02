// parse urls.json link db

import { getUrl, saveUrl } from '../api/handledb'
import { scenario_summary } from './scenario'
import { hydradx_omnipool_sell, getHydradxAssetSymbolDecimals } from '../api/DraftSwap'

import * as pako from 'pako'

function addPadding(base64String: string): string {
  while (base64String.length % 4 !== 0) {
    base64String += '='
  }
  return base64String
}

interface Position {
  x: number
  y: number
}

interface Data {
  label: string
  triggerToast?: boolean
  image?: string
  name?: string
}

interface Asset {
  name: string
  assetId: string | number
  symbol?: string
}

interface FormData {
  chain?: string
  asset?: Asset
  address?: string
  amount?: string | null
  delay?: string | null
  contact?: string | null
  action?: string
  actionData?: {
    actionType: string
    source: {
      chain: string
      assetId: string | number
      address: string
      amount: string
      symbol?: string
      delay?: any //yolo
    }
    target: {
      chain: string
      assetId: string | number
      address: string
      symbol?: string
    }
  }
}

interface Node {
  id: string
  type: string
  position: Position
  data: Data
  style: Record<string, unknown>
  formData: FormData
  width: number
  height: number
  selected: boolean
  positionAbsolute: Position
  dragging: boolean
}

interface Edge {
  id: string
  source: string
  target: string
  style: {
    stroke: string
    strokeWidth: number
  }
  markerEnd: {
    type: string
    strokeWidth: number
  }
  type: string
  label: string
  labelShowBg: boolean
  labelStyle: {
    backgroundColor: string
  }
  focusable: boolean
}

interface Graph {
  nodes: Node[]
  edges: Edge[]
}

const swap_edges: {
  id: string
  source: string
  target: string
  style: {
    stroke: string
    strokeWidth: number
  }
  markerEnd: {
    type: string
    strokeWidth: number
  }
  type: string
  label: string
  labelShowBg: boolean
  labelStyle: {
    backgroundColor: string
  }
  focusable: boolean
  animated: boolean
}[] = [
  {
    id: 'chain_f267e2-action_508433',
    source: 'chain_f267e2',
    target: 'action_508433',
    style: {
      stroke: 'green',
      strokeWidth: 2,
    },
    markerEnd: {
      type: 'arrow',
      strokeWidth: 1,
    },
    type: 'simplebezier',
    label: '',
    labelShowBg: true,
    labelStyle: {
      backgroundColor: 'green',
    },
    focusable: true,
    animated: true,
  },
  {
    id: 'action_508433-chain_e2ccf0',
    source: 'action_508433',
    target: 'chain_e2ccf0',
    style: {
      stroke: 'green',
      strokeWidth: 2,
    },
    markerEnd: {
      type: 'arrow',
      strokeWidth: 1,
    },
    type: 'simplebezier',
    label: '',
    labelShowBg: true,
    labelStyle: {
      backgroundColor: 'green',
    },
    focusable: true,
    animated: true,
  },
]

// create a swap tx and insert the scenario and return the tx info and the scenario key
export async function create_swap(assetin: number, assetout: number, amount: number) {
  const out = {
    swap_tx: '',
    scenarioid: '',
  }

  // validate the0 assetids

  const tokenDecimals = 12

  // Adjust the source amount according to the token decimals
  const submittableAmount = amount * 10 ** tokenDecimals

  const tx = await hydradx_omnipool_sell(assetin.toString(), assetout.toString(), amount, submittableAmount)
  out['swap_tx'] = tx.toHex()
  const chain = 'hydraDx'

  // get asset details
  const source_asset_symbol: string = (await getHydradxAssetSymbolDecimals(assetin)).symbol
  const dest_asset_symbol: string = (await getHydradxAssetSymbolDecimals(assetout)).symbol

  const source_node: Node = {
    id: 'chain_f267e2',
    type: 'chain',
    position: {
      x: -248.7668445883158,
      y: -206.36392800608164,
    },
    data: {
      label: 'Chain',
      image: './chain.svg',
      name: 'Chain',
    },
    style: {},
    formData: {
      chain: chain,
      asset: {
        name: 'HydraDX',
        assetId: assetin.toString(),
        symbol: source_asset_symbol,
      },
      address: 'not set',
      amount: amount.toString(),
      delay: null,
      contact: null,
    },
    width: 244,
    height: 437,
    selected: false,
    positionAbsolute: {
      x: -248.7668445883158,
      y: -206.36392800608164,
    },
    dragging: false,
  }

  const action_node: Node = {
    id: 'action_508433',
    type: 'action',
    position: {
      x: 187.4944032146526,
      y: -143.68266396598847,
    },
    data: {
      label: 'action',
      triggerToast: true,
    },
    style: {},
    formData: {
      action: 'swap',
      actionData: {
        actionType: 'swap',
        source: {
          chain: chain,
          assetId: assetin.toString(),
          address: 'not set',
          amount: amount.toString(),
          symbol: source_asset_symbol,
          delay: null,
        },
        target: {
          chain: chain,
          assetId: assetout.toString(),
          address: 'not set',
          symbol: dest_asset_symbol,
        },
      },
    },
    width: 201,
    height: 221,
    selected: true,
    positionAbsolute: {
      x: 187.4944032146526,
      y: -143.68266396598847,
    },
    dragging: false,
  }

  const dest_node: Node = {
    id: 'chain_e2ccf0',
    type: 'chain',
    position: {
      x: 652.0521448138634,
      y: -175.1006106176817,
    }, // Set the desired position
    data: { label: 'Chain', image: './chain.svg', name: 'Chain' },
    style: {},
    formData: {
      chain: chain,
      asset: { name: dest_asset_symbol, assetId: assetout.toString(), symbol: dest_asset_symbol },
      address: 'not set',
      amount: amount.toString(),
      delay: null,
      contact: null,
    },
    width: 244,
    height: 441,
    selected: false,
    positionAbsolute: {
      x: 804.2081077573107,
      y: 118.96131201636871,
    },
    dragging: false,
  }
  const object: Graph = {
    nodes: [source_node, action_node, dest_node],
    edges: swap_edges,
  }

  const outen: string = JSON.stringify(object)

  const short_url = await compressString(outen)

  out['scenarioid'] = short_url

  return out
}

export async function scenario_info(input: string) {
  const parsed: Graph = JSON.parse(input)
  const chainList: string[] = []

  for (const node of parsed.nodes) {
    if (node.type === 'chain') {
      //         console.log(`Chain Name: ${node.formData?.chain}`);
      chainList.push(node.formData.chain)
    } else if (node.type === 'action' && node.formData?.action) {
      chainList.push(node.formData.action)
    }
  }
  const formattedChainList = chainList.join(' > ')

  return formattedChainList
}

// multi hop/scenario tx's
export function multi_scenario_info(scenario_data: Graph): scenario_summary[] {
  const alles: scenario_summary[] = []

  for (const node of scenario_data.nodes) {
    const tmp_scenario: scenario_summary = {
      source_chain: 'not set',
      source_address: 'not set',
      dest_chain: 'not set',
      dest_address: 'not set',
      assetid: 0,
      amount: 0,
      txtype: 'not set',
      tx: 'not set',
    }
    if (node.type === 'action' && node.formData?.action) {
      tmp_scenario['txtype'] = node.formData.actionData.actionType
      console.log(`action node`, node.formData)
      tmp_scenario['source_amount'] = node.formData.actionData.source.amount
      tmp_scenario['assetid'] = node.formData.actionData.source.assetId
      tmp_scenario['amount'] = node.formData.actionData.source.amount
      if (node.formData.actionData) {
        console.log(`node.formData.actionData is true:`, node.formData.actionData)
        tmp_scenario['source_address'] = node.formData.actionData.source.address
        tmp_scenario['dest_address'] = node.formData.actionData.target.address

        const schain = node.formData.actionData.source.chain
        const dchain = node.formData.actionData.target.chain
        if (schain) {
          tmp_scenario['source_chain'] = schain
        }
        if (dchain) {
          tmp_scenario['dest_chain'] = dchain
        }
      }
      alles.push(tmp_scenario)
    }
  }

  return alles
}

/*
be able to provide an output like this: 
  const output = {
    tx: '',
    summary: '',
    asset: '',
    amount: '',
    txtype: ''
  }
This only supports single action scenarios
*/
export async function scenario_detailed_info(scenario_data: Graph) {
  const source_asset = ''
  const source_amount = ''
  const tx_type = ''

  const output = {
    source_asset: '',
    source_amount: '',
    source_chain: '',
    tx_type: '',
    dest_asset: '',
    dest_amount: '',
    dest_chain: '',
    dest_address: '',
  }

  const chainList: string[] = []
  const amounts: string[] = []
  const assets: string[] = []
  /*
  const infolist = scenario_data.nodes.entries();
  const sourcenode: Node = infolist[0];
  const destnode: Node = infolist[2];
  output['source_asset'] = sourcenode.formData.asset.assetId.toString();
  output['source_amount'] = sourcenode.formData.amount;
  output['dest_asset'] = destnode.formData.asset.assetId.toString();
  output['dest_amount'] = destnode.formData.amount;
*/
  const addresses: string[] = []

  for (const node of scenario_data.nodes) {
    if (node.type === 'chain') {
      console.log(`Chain Name: ${node.formData?.chain}`)
      chainList.push(node.formData.chain)
      //    amounts.push(node.formData.asset.assetId.toString());
      if (node.formData.asset.assetId) {
        assets.push(node.formData.asset.assetId.toString())
      }
      addresses.push(node.formData.address)
    } else if (node.type === 'action' && node.formData?.action) {
      output['tx_type'] = node.formData.actionData.actionType
      console.log(`action node`, node.formData)
      output['source_amount'] = node.formData.actionData.source.amount
      output['source_asset'] = node.formData.actionData.source.assetId.toString()
      if (node.formData.actionData) {
        console.log(`node.formData.actionData is true:`, node.formData.actionData)
        addresses.push(node.formData.actionData.target.address)
        const schain = node.formData.actionData.source.chain
        const dchain = node.formData.actionData.target.chain
        if (schain) {
          output['source_chain'] = schain
        }
        if (dchain) {
          output['dest_chain'] = dchain
        }
      }
    }
  }
  // output['source_asset'] = assets[0];
  //  output['source_amount'] = amounts[0];
  output['dest_asset'] = assets[1]
  //output['dest_amount'] =  amounts[1];
  output['dest_address'] = addresses[1]
  return output
}

// insert a new scenario, store it in the db and generate a link to it
export async function insert_scenario(
  source_chain: string,
  dest_chain: string,
  source_address: string,
  amount: number,
  assetid: number,
): Promise<any> {
  const source_node: Node = {
    id: 'Api_generated',
    type: 'chain',
    position: { x: 100, y: 100 }, // Set the desired position
    data: { label: 'New Chain', image: './new_chain.svg', name: 'NewChain' },
    style: {},
    formData: {
      chain: source_chain,
      asset: { name: 'NewAsset', assetId: assetid },
      address: 'newAddress',
      amount: amount.toString(),
      delay: null,
      contact: null,
    },
    width: 200,
    height: 300,
    selected: false,
    positionAbsolute: { x: 100, y: 100 },
    dragging: false,
  }

  const action_node: Node = {
    id: 'action_4f16b2',
    type: 'action',
    position: {
      x: -5.6337570402485895,
      y: 211.98330575486636,
    },
    data: {
      label: 'action',
    },
    style: {},
    formData: {
      action: 'xTransfer',
      actionData: {
        actionType: 'xTransfer',
        source: {
          chain: source_chain,
          assetId: assetid,
          address: source_address,
          amount: amount.toString(),
          //symbol: "DOT"
        },
        target: {
          chain: dest_chain,
          assetId: assetid.toString(),
          address: dest_chain,
        },
      },
    },
    width: 200,
    height: 246,
    selected: true,
    positionAbsolute: {
      x: -5.6337570402485895,
      y: 211.98330575486636,
    },
    dragging: false,
  }

  const dest_node: Node = {
    id: 'chain_dest_Api_generated',
    type: 'chain',
    position: {
      x: 804.2081077573107,
      y: 118.96131201636871,
    }, // Set the desired position
    data: { label: 'Chain', image: './chain.svg', name: 'Chain' },
    style: {},
    formData: {
      chain: dest_chain,
      asset: { name: '', assetId: assetid },
      address: 'not set',
      amount: amount.toString(),
      delay: null,
      contact: null,
    },
    width: 244,
    height: 441,
    selected: false,
    positionAbsolute: {
      x: 804.2081077573107,
      y: 118.96131201636871,
    },
    dragging: false,
  }
  const object: Graph = {
    nodes: [source_node, action_node, dest_node],
    edges: [],
  }

  const outen: string = JSON.stringify(object)
  //  console.log(`output: `, outen);
  const short_url = await compressString(outen)
  //   console.log(`compressed string: `, short_url);

  return short_url
}

export async function decompressString(compressedInput: string): Promise<string> {
  //  console.log(`decompressing string`);
  //  console.log(`got input:`, compressedInput);
  try {
    //  console.log(`expanded url:`, expandedUrl);
    // console.log(`0 expanded url:`, expandedUrl.longUrl);

    const newinput = compressedInput
    // console.log(`newinput:`, newinput);
    const in2 = addPadding(newinput)
    // Ensure that the base64 string is properly formatted
    const formattedInput = in2.replace(/[^A-Za-z0-9+/]/g, '')

    // console.log('Formatted Input:', formattedInput);

    const uint8Array = new Uint8Array(
      atob(formattedInput)
        .split('')
        .map((char) => char.charCodeAt(0)),
    )

    const decompressed = pako.inflate(uint8Array, { to: 'string' })
    //  console.log(`calling get url`);

    return decompressed
  } catch (error) {
    console.error('Error decoding base64 string:', error)
    return '' // Return an empty string or handle the error as needed
  }
}

export async function compressString(input: string): Promise<string> {
  //  console.log(`compressing string`)
  try {
    const utf8encoded = new TextEncoder().encode(input)
    const compressed = pako.deflate(utf8encoded)
    const base64encoded = btoa(String.fromCharCode.apply(null, compressed))

    //  console.log('Base64 Encoded:', base64encoded);

    const shortUrl = await saveUrl(base64encoded)
    //     console.log('saved link: ', shortUrl);

    return shortUrl
  } catch (error) {
    console.error('Error compressing string:', error)
    return '' // Return an empty string or handle the error as needed
  }
}
