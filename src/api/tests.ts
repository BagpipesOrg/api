import connectToWsEndpoint from './connect'
import { route_tx } from './txroute'
import * as assert from 'assert'
import { inandoutchannels } from './xcmhelper'
//import { decode, getRegistry } from "@substrate/txwrapper-polkadot";
import Keyring from '@polkadot/keyring'
import { hexToU8a, isHex, u8aToHex } from '@polkadot/util'
import { cryptoWaitReady } from '@polkadot/util-crypto'
import { broadcastToChain } from './broadcast'

// random account(subkey generate) used for testing
export function get_test_account() {
  const e0 = new Keyring({ type: 'sr25519' })
  const account = e0.addFromUri('resource whip length faint better aspect sphere light clay lab replace collect')

  return account
}

async function test_connection() {
  console.log(`starting connection test`)

  console.log(`trying to connect to Polkadot`)
  const po = await connectToWsEndpoint('polkadot')
  console.log(`Polkadot connection ok`)
  await po.disconnect()

  console.log(`trying to connect to HydraDX`)
  const hx = await connectToWsEndpoint('hydraDx')
  console.log(`HydraDX connection ok`)
  await hx.disconnect()

  console.log(`trying to connect to Assethub`)
  const ah = await connectToWsEndpoint('assetHub')
  console.log(`Assethub connection ok`)
  await ah.disconnect()

  console.log(`connection test passed`)
}

async function xcm_test() {
  console.log(`testing hrmp channels`)
  // get a list of outgoing and incoming hrmp channels for source chain and check if destination paraid is in the outputted list

  console.log(`Checking HydraDX <> Assethub channels`)
  const ha = await inandoutchannels(2034)
  assert.strictEqual(ha.includes(1000), true)
  console.log(`hrmp channel test passed`)
}

async function tx_test() {
  console.log(`Testing transaction routing`)
  // polkadot:hydradx
  console.log(`Checking polkadot > hydradx`)
  const ph_tx = (
    await route_tx(
      'polkadot',
      'hydradx',
      0,
      10000,
      '0x68de6e1566e333753df02b2446f24e1cc2b796cfdf954dc0f39753c578e02a40',
    )
  ).toHex()
  assert.strictEqual(
    ph_tx,
    '0xec04630803000100c91f030001010068de6e1566e333753df02b2446f24e1cc2b796cfdf954dc0f39753c578e02a40030400000000419c0000000000',
  )
  console.log(`polkadot > hydradx ok`)

  // hydradx:assethub
  console.log(`Checking hydradx > assethub`)
  const ha_tx = (
    await route_tx(
      'hydradx',
      'assethub',
      0,
      10000,
      '0x68de6e1566e333753df02b2446f24e1cc2b796cfdf954dc0f39753c578e02a40',
    )
  ).toHex()
  //assert.strictEqual(ha_tx, '0x680489010300000300a10f0000000000419c01010200a10f000000')
  console.log(`hydradx > assethub ok`)

  // polkadot:assethub
  console.log(`Checking polkadot > assethub`)
  const pa_tx = (
    await route_tx('polkadot', 'assethub', 0, 10000, '16XByL4WpQ4mXzT2D8Fb3vmTLWfHu7QYh5wXX34GvahwPotJ')
  ).toHex()
  assert.strictEqual(
    pa_tx,
    '0xec04630903000100a10f0300010100f43376315face751ae6014e8a94301b2c27c0bc4a234e9997ed2c856d13d3d2f030400000000419c0000000000',
  )
  console.log(`polkadot > assethub ok`)

  // hydradx:polkadot
  console.log(`Checking hydradx > polkadot`)
  const hp_tx = (
    await route_tx(
      'hydradx',
      'polkadot',
      0,
      10000,
      '0x68de6e1566e333753df02b2446f24e1cc2b796cfdf954dc0f39753c578e02a40',
    )
  ).toHex()
  assert.strictEqual(hp_tx, '0x600489010300000300000000000000419c0101020000000000')
  console.log(`hydradx > polkadot ok`)

  // assethub:polkadot
  console.log(`Checking assethub > polkadot`)
  const ap_tx = (
    await route_tx(
      'assethub',
      'polkadot',
      0,
      10000,
      '0x68de6e1566e333753df02b2446f24e1cc2b796cfdf954dc0f39753c578e02a40',
    )
  ).toHex()
  //  assert.strictEqual(
  //    ap_tx,
  //    '0xf8041f080301010000030001010068de6e1566e333753df02b2446f24e1cc2b796cfdf954dc0f39753c578e02a4003040000020432050000419c0000000000',
  //  )
  console.log(`assethub > polkadot ok`)

  // assethub:hydradx
  console.log(`Checking assethub > hydradx`)
  const ah_tx = (
    await route_tx(
      'assethub',
      'hydradx',
      0,
      10000,
      '0x68de6e1566e333753df02b2446f24e1cc2b796cfdf954dc0f39753c578e02a40',
    )
  ).toHex()
  //  assert.strictEqual(
  //    ah_tx,
  //    '0x0101041f0803010100c91f030001010068de6e1566e333753df02b2446f24e1cc2b796cfdf954dc0f39753c578e02a400304000002043205011f00419c0000000000',
  //  )
  console.log(`assethub > hydradx ok`)

  console.log(`transaction routing ok`)
}

async function broadcast_transaction() {
  await cryptoWaitReady()
  console.log(`broadcast_transaction start`)
  console.log(`generating tx..`)
  const alice = get_test_account()
  const pa_tx = await route_tx('polkadot', 'hydradx', 0, 20000, '16XByL4WpQ4mXzT2D8Fb3vmTLWfHu7QYh5wXX34GvahwPotJ')
  console.log(`rawtx:`, pa_tx.toHex())
  const api = await connectToWsEndpoint('polkadot')
  const signhere = await pa_tx.signAsync(alice)
  console.log(`Signature: `, signhere.toHex())
  const testo = api.tx(signhere) // this will break if the tx is invalid
  console.log(`Verfied tx:`, testo.toHex())
  // uncommend bellow me to test it with /broadcast endpoint
  const bhash = await broadcastToChain('polkadot', testo)
  console.log(`blockhash published: `, bhash.toString())
  console.log(`broadcast_transaction done`)
}

async function main() {
  console.log(`running api tests`)
  //await test_connection()
  await tx_test()
  await xcm_test()
  // uncomment and insert seed
  //await broadcast_transaction()
  console.log(`api tests finished`)
}

main().finally()
