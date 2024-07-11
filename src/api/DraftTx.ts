//import { decodeAddress } from '@polkadot/util-crypto';
import { blake2AsU8a, decodeAddress, addressToEvm } from '@polkadot/util-crypto'
import { hexToU8a, isHex, u8aToHex } from '@polkadot/util'
//import { createTypeUnsafe, GenericCall, GenericExtrinsic, GenericExtrinsicPayload } from '@polkadot/types';

//import { EXTRINSIC_VERSION } from '@polkadot/types/extrinsic/v4/Extrinsic';

//import { createMetadata } from '@substrate/txwrapper/lib/util';
import '@polkadot/types-augment'
//import ExtrinsicV4 from '@polkadot/types/extrinsic/v4/Extrinsic'
//import { TypeRegistry } from '@polkadot/types/create'

//import endpoints from "./WsEndpoints";
//import { ChainInfo, listChains, CHAIN_METADATA } from "./Chains";
import connectToWsEndpoint from './connect'

//import { createType } from '@polkadot/types';

import Keyring from '@polkadot/keyring'

function raw_address_now(ss58: string) {
  const keyring = new Keyring()
  const address = u8aToHex(keyring.decodeAddress(ss58))
  return address
}

function getRawAddress(ss58Address: string): Uint8Array {
  try {
    return decodeAddress(ss58Address)
  } catch (e) {
    throw new Error('Invalid SS58 address format.')
  }
}
function number_to_string(input: number): number {
  // 	console.log(`number_to_string: `, input);
  const numberWithCommas = input.toString()
  const numberWithNoCommas = numberWithCommas.replace(/,/g, '') // Remove the commas
  // 	console.log(`number_to_string numberWithNoCommas: `, numberWithNoCommas);
  // Using parseInt to convert to an integer
  const integerNumber = parseInt(numberWithNoCommas, 10) // The second argument (10) specifies the base (decimal) for parsing.
  // 	console.log(`number_to_string integerNumber: `, integerNumber);

  return integerNumber
}

export async function generic_system_remark(chain: string, msg: string) {
  const api = await connectToWsEndpoint(chain)

  return api.tx.system.remarkWithEvent(msg)
}

// Moonbeam

async function moonbeam2parachain(accountidme: string, assetid: string, amount: string, paraid: number) {
  const api = await connectToWsEndpoint('moonbeam')

  const asset = {
    fun: {
      Fungible: amount,
    },
    id: {
      Concrete: {
        interior: {
          X3: [{ Parachain: paraid, PalletInstance: 50, GeneralIndex: assetid }],
          parents: 1,
        },
      },
    },
  }

  const destination = {
    parents: 1,
    interior: {
      X2: [{ Parachain: paraid, AccountId32: accountidme, network: null }],
    },
  }

  const tx = api.tx.xTokens.transferMultiasset({ V3: asset }, { V2: destination }, { Unlimited: 0 })

  return tx
}

/// moonbeam > Polkadot Relay chain
export async function moon2polkadot(account: string, amount: number) {
  const api = await connectToWsEndpoint('moonbeam')
  console.log(`moon2polkadot input account, amount: `, account, amount)
  const relayAccount = getRawAddress(account)
  console.log(`relayaccount: `, relayAccount)
  const dest = {
    parents: 1,
    interior: { X1: { AccountId32: { id: relayAccount, network: null } } },
  }

  const asset = {
    id: {
      Concrete: {
        interior: null,
        parents: 1,
      },
    },
    fun: { Fungible: amount.toString() },
  }

  const tx = api.tx.xTokens.transferMultiasset({ V2: asset }, { v2: dest }, { Unlimited: null })
  return tx
}

/// working: https://moonbeam.subscan.io/extrinsic/6444324-6?tab=xcm_transfer
export async function moon2parachain(assetid: string, amount: number, account: string, paraid: number) {
  const api = await connectToWsEndpoint('moonbeam')
  console.log(`moon to assethub called`)
  const accountme = getRawAddress(account) //"0xb6864e89ef92820dfd586c034a264e175415cee72270d853ab8b42110f24de25";
  const cleanAssetId = assetid.replace(/,/g, '')

  const dest = {
    parents: 1,
    interior: {
      X2: [
        { Parachain: paraid },
        {
          Accountid32: {
            id: accountme, //convertAccountId32ToAccountId20(accountido),
            network: null,
          },
        },
      ],
    },
  }

  const tx = await api.tx.xTokens.transfer(
    { foreignasset: cleanAssetId.toString() },
    { amount: amount },
    { V3: dest },
    { Unlimited: null },
  )

  return tx
}

/// https://moonbeam.subscan.io/extrinsic/6444042-5?tab=xcm_transfer
export async function moon2hydra2(assetid: string, amount: number, account: string) {
  const accountme = getRawAddress(account) //"0xb6864e89ef92820dfd586c034a264e175415cee72270d853ab8b42110f24de25";
  //const amount = 1000000000000;
  const cleanAssetId = assetid.replace(/,/g, '')
  console.log(`moon2hydra2 input:`, cleanAssetId, accountme, amount)
  const api = await connectToWsEndpoint('moonbeam')

  const dest = {
    parents: 1,
    interior: {
      X2: [
        { Parachain: 2034 }, // hydra paraid
        {
          Accountid32: {
            id: accountme, //convertAccountId32ToAccountId20(accountido),
            network: null,
          },
        },
      ],
    },
  }

  //const assetid = "166446646689194205559791995948102903873";
  const tx = await api.tx.xTokens.transfer(
    { foreignasset: cleanAssetId.toString() },
    { amount: amount },
    { V3: dest },
    { Unlimited: null },
  )
  return tx
}

// native only, do not use
// only for native once
// https://moonbeam.subscan.io/extrinsic/6443822-5?tab=xcm_transfer
export async function moon2hydra(account: string, amount: number) {
  const api = await connectToWsEndpoint('moonbeam')
  console.log(`moon2hydra input: `, account, amount)
  const accountme = getRawAddress(account)

  /*
 const asset = {
      id: { Concrete: { parents: 0, interior: { X1:{
        PalletInstance: 10 } }},
      fun: { Fungible: parseInt(amount) },
    }};
*/
  const asset = {
    id: {
      Concrete: {
        parents: 0,
        interior: {
          X1: {
            PalletInstance: 10,
          },
        },
      },
    },
    fun: {
      Fungible: amount.toString(),
    },
  }

  //     console.log(`asset obj: `, JSON.stringify(asset));

  const dest = {
    parents: 1,
    interior: {
      X2: [
        { Parachain: 2034 }, // hydra paraid
        {
          Accountid32: {
            id: accountme, //convertAccountId32ToAccountId20(accountido),
            network: {
              Any: 'NULL',
            },
          },
        },
      ],
    },
  }

  return api.tx.xTokens.transferMultiasset({ V2: asset }, { V2: dest }, { Unlimited: null })
}

/// hydra > moonbeam
export async function hydra2moonbeam(accountme: string, assetid: string, amount: string) {
  const api = await connectToWsEndpoint('hydraDx')

  const dest = {
    parents: 1,
    interior: {
      X2: [
        { Parachain: 2004 }, // Moonbeam paraid
        {
          AccountKey20: {
            key: accountme, //convertAccountId32ToAccountId20(accountido),
            network: null,
          },
        },
      ],
    },
  }

  return api.tx.xTokens.transfer({ currency_id: assetid }, { amount: amount }, { V3: dest }, { Unlimited: null })
}

/// polkadot > moonbeam
export async function polkadot2moonbeam(amount: string, accountme: string) {
  const api = await connectToWsEndpoint('polkadot')

  const destination = {
    interior: { X1: { Parachain: 2004 } },
    parents: 0,
  }

  const assets = [
    {
      id: { Concrete: { parents: 0, interior: 'Here' } },
      fun: { Fungible: amount },
    },
  ]

  const beneficiary = {
    parents: 0,
    interior: {
      X1: {
        AccountKey20: {
          // change me
          network: null,
          key: accountme, //convertAccountId32ToAccountId20(accountido),
        },
      },
    },
  }

  const tx = api.tx.xcmPallet.limitedReserveTransferAssets(
    { V2: destination },
    { V2: beneficiary },
    { V2: assets },
    { fee_asset_item: 0 },
    { Unlimited: null },
  )

  return tx
}

/// assethub > moonbeam
export async function assethub2moonbeam(amount: string, assetid: string, account: string) {
  const api = await connectToWsEndpoint('assetHub')

  const destination = {
    interior: { X1: { Parachain: 2004 } },
    parents: 1,
  }

  const asset = {
    id: {
      Concrete: {
        parents: 0,
        interior: {
          X2: [{ PalletInstance: 50 }, { GeneralIndex: assetid }],
        },
      },
    },
    fun: { Fungible: amount },
  }

  const bene = {
    parents: 1,
    interior: {
      X2: [
        { Parachain: 2023 }, // Moonriver paraid
        {
          AccountKey20: {
            // change me
            network: null,
            key: account, //convertAccountId32ToAccountId20(accountido),
          },
        },
      ],
    },
  }

  const tx = api.tx.polkadotXcm.limitedTeleportAssets(
    { V2: destination },
    { V2: bene },
    { V2: [asset] },
    { fee_asset_item: 1 },
    { Unlimited: null },
  )

  return tx
}

/// interlay > moonbeam
export async function interlay2moonbeam(amount: string, assetid: string, account: string) {
  const api = await connectToWsEndpoint('interlay')

  const dest = {
    parents: 1,
    interior: {
      X2: [
        { Parachain: 2004 }, // Moonbeam paraid
        {
          AccountKey20: {
            key: account, //convertAccountId32ToAccountId20(accountido),
            network: null,
          },
        },
      ],
    },
  }

  const tx = await api.tx.xTokens.transfer(
    { foreignasset: assetid },
    { amount: amount.toString() },
    { V3: dest },
    { unlimited: null },
  )
  return tx
}

// https://assethub-polkadot.subscan.io/extrinsic/4929110-2
export async function assethub2interlay(assetid: number, amount: number, destaccount: string) {
  const paraid = 2032
  const api = await connectToWsEndpoint('polkadot')
  const accountido = raw_address_now(destaccount)
  //	console.log(`assetid:`, assetid);
  // remove commas in assetid

  //

  const destination = {
    parents: 1,
    interior: { X1: { Parachain: paraid } },
  }

  const account = {
    parents: 0,
    interior: { X1: { AccountId32: { id: accountido, network: null } } },
  }

  const asset = {
    id: {
      Concrete: {
        parents: 0,
        interior: {
          X2: [{ PalletInstance: 50 }, { GeneralIndex: number_to_string(assetid).toString() }],
        },
      },
    },
    fun: { Fungible: number_to_string(amount).toString() },
  }

  //console.log(`asset: `, asset);

  const tx = api.tx.polkadotXcm.limitedReserveTransferAssets({ V2: destination }, { V2: account }, { V2: [asset] }, 0, {
    Unlimited: null,
  })

  return tx
}

// https://moonriver.subscan.io/block/0xdc22e440ade2ebc6a5c3c07db1ab05f84f762f3b7a011f07b1fcc4cfbe68198a
// correct with talisman polkadot wallet: https://polkadot.js.org/apps/?rpc=wss%3A%2F%2Fmoonriver.public.curie.radiumblock.co%2Fws#/extrinsics/decode/0x6a0101000101000921000700e40b54020101020009210100ca477d2ed3c433806a8ce7969c5a1890187d765ab8080d3793b49b42aa9e805f00
export async function moonriver2turing(accountidme: string, amount: number) {
  const api = await connectToWsEndpoint('moonriver')
  const accountid = getRawAddress(accountidme)
  const asset = {
    id: {
      Concrete: {
        interior: {
          X1: { Parachain: 2114 },
        },
        parents: 1,
      },
    },
    fun: { Fungible: amount.toString() },
  }

  const dest = {
    parents: 1,
    interior: {
      X2: [
        { Parachain: 2114 }, // Moonriver paraid
        {
          Accountid32: {
            // change me
            network: null,
            id: accountid, //convertAccountId32ToAccountId20(accountido),
          },
        },
      ],
    },
  }

  const tx = await api.tx.xTokens.transferMultiasset({ V2: asset }, { v2: dest }, { Unlimited: null })

  return tx
}

export function substrate_address_to_evm(accountid32: string): string {
  const byteArray = addressToEvm(accountid32)
  return u8aToHex(byteArray) // return the hex version of the address
}

// https://turing.subscan.io/extrinsic/4825155-2
export async function turing2moonriver(accountido: string, amount: number) {
  console.log(`turing 2 moonriver tx gen`)
  console.log(`tx input: `, accountido, amount)
  const api = await connectToWsEndpoint('turing')
  //const accountme =
  const accountme = accountido //substrate_address_to_evm(accountido); // convert to evm address

  const asset = {
    id: {
      Concrete: {
        interior: {
          X1: { Parachain: 2114 },
        },
        parents: 1,
      },
    },
    fun: { Fungible: amount.toString() },
  }

  const destination = {
    parents: 1,
    interior: {
      X2: [
        { Parachain: 2023 }, // Moonriver paraid
        {
          AccountKey20: {
            // change me
            network: null,
            key: accountme, //convertAccountId32ToAccountId20(accountido),
          },
        },
      ],
    },
  }

  const tx = await api.tx.xTokens.transferMultiasset({ V3: asset }, { V3: destination }, { Unlimited: null })
  return tx
}

// send TUR native from turing to mangatax
export async function turing2mangata(amount: number, accountido: string) {
  // const wsProvider = new WsProvider('wss://rpc.turing.oak.tech');
  const api = await connectToWsEndpoint('turing')
  const accountid = raw_address_now(accountido)
  const parachainid = 2114 // mangatax

  const asset = {
    id: {
      Concrete: {
        parents: 1,
        interior: {
          X1: { Parachain: parachainid },
        },
      },
    },
    fun: { Fungible: amount.toString() },
  }
  //console.log(`asset:`, asset);
  const destination = {
    parents: 1,
    interior: {
      X2: [
        { Parachain: 2110 }, // turing paraid
        {
          accountId32: {
            network: null,
            id: accountid,
          },
        },
      ],
    },
  }

  const tx = await api.tx.xTokens.transferMultiasset(
    { V3: asset },
    { V3: destination },
    { Limited: { proof_size: 0, ref_time: 4000000000 } },
  )
  return tx
}

// working: https://polkadot.subscan.io/xcm_message/polkadot-6cff92a4178a7bf397617201e13f00c4da124981
/// ref: https://polkaholic.io/tx/0x47914429bcf15b47f4d202d74172e5fbe876c5ac8b8a968f1db44377906f6654
/// DOT to assethub
export async function polkadot_to_assethub(amount: number, address: string) {
  const api = await connectToWsEndpoint('polkadot')
  const paraid = 1000
  const accountId = api.createType('AccountId32', address).toHex()

  //console.log(`Connected to assethub`);
  const destination = {
    parents: 0,
    interior: { X1: { Parachain: paraid } },
  }

  const account = {
    parents: 0,
    interior: { X1: { AccountId32: { id: accountId, network: null } } },
  }

  const asset = [
    {
      id: { Concrete: { parents: 0, interior: 'Here' } },
      fun: { Fungible: amount },
    },
  ]

  const tx = api.tx.xcmPallet.limitedTeleportAssets(
    { V3: destination },
    { V3: account },
    { V3: asset },
    { fee_asset_item: 0 },
    { Unlimited: 0 },
  )

  return tx
}

/// Send DOT to a parachain
export async function genericPolkadotToParachain(paraid: number, amount: number, address: string) {
  const api = await connectToWsEndpoint('polkadot')
  //const address = "12u9Ha4PxyyQPvJgq3BghnqNXDwLqTnnJFuXV7aZQoiregT2";
  const accountId = api.createType('AccountId32', address).toHex()

  const destination = {
    parents: 0,
    interior: { X1: { Parachain: paraid } },
  }

  const account = {
    parents: 0,
    interior: { X1: { AccountId32: { id: accountId } } },
  }

  const asset = [
    {
      id: { Concrete: { parents: 0, interior: 'Here' } },
      fun: { Fungible: amount },
    },
  ]

  const tx = api.tx.xcmPallet.reserveTransferAssets({ V3: destination }, { V3: account }, { V3: asset }, 0)

  return tx
}

// working: https://hydradx.subscan.io/xcm_message/polkadot-047344414db62b7c424c8de9037c5a99edd0794c
export async function dotToHydraDx(amount: number, targetAddress: string) {
  const paraid = 2034 // TODO: call from ChainInfo
  console.log(`cant connect`)
  const api = await connectToWsEndpoint('polkadot')
  console.log(`connect`)
  console.log(`drafting dot to hydradx`)

  const rawTargetAddress = getRawAddress(targetAddress)

  const destination = {
    parents: 0,
    interior: {
      X1: {
        Parachain: paraid,
      },
    },
  }

  const targetAccount = {
    parents: 0,
    interior: {
      X1: {
        AccountId32: {
          id: rawTargetAddress,
        },
      },
    },
  }

  const asset = [
    {
      id: { Concrete: { parents: 0, interior: 'Here' } },
      fun: { Fungible: amount },
    },
  ]

  //console.log(`Creating tx`);
  const tx = api.tx.xcmPallet.limitedReserveTransferAssets(
    { V3: destination },
    { V3: targetAccount },
    { V3: asset },
    0,
    { Unlimited: null }, // weight_limit
  )

  return tx
}

export async function dotToParachain(amount: number, targetAddress: string) {
  const paraid = 1000
  const api = await connectToWsEndpoint('polkadot')
  console.log(`sending dot to parachain`)

  const rawTargetAddress = getRawAddress(targetAddress)

  // const address = "12u9Ha4PxyyQPvJgq3BghnqNXDwLqTnnJFuXV7aZQoiregT2";
  // const accountId = api.createType("account_id_32", address).toHex(); // convert account to public key

  const destination = {
    parents: 0,
    interior: { X1: { Parachain: paraid } },
  }

  const targetAccount = {
    parents: 0,
    interior: { X1: { AccountId32: { id: rawTargetAddress } } },
  }

  const asset = [
    {
      id: { Concrete: { parents: 0, interior: 'Here' } },
      fun: { Fungible: amount },
    },
  ]

  const tx = api.tx.xcmPallet.limitedReserveTransferAssets(
    { V3: destination },
    { V3: targetAccount },
    { V3: asset },
    0,
    { Unlimited: null }, // weight_limit
  )

  return tx
}

// ref: https://hydradx.subscan.io/extrinsic/3330338-2?event=3330338-7
// dry run results: https://polkadot.js.org/apps/?rpc=wss%3A%2F%2Frpc.hydradx.cloud#/extrinsics/decode and input this: 0x640489010300000300a10f00000000002801010200a10f000000
// HYDRADX > parachain
export async function hydraDxToParachain(amount: number, assetId: number, destAccount: string, paraId: number) {
  const api = await connectToWsEndpoint('hydraDx')

  const asset = {
    fun: {
      Fungible: amount,
    },
    id: {
      Concrete: {
        interior: {
          X3: [{ Parachain: paraId, PalletInstance: 50, GeneralIndex: assetId }],
          parents: 1,
        },
      },
    },
  }

  const destination = {
    parents: 1,
    interior: { X2: [{ Parachain: paraId, AccountId32: destAccount, network: null }] },
  }

  const tx = api.tx.xTokens.transferMultiasset({ V3: asset }, { V2: destination }, { Unlimited: 0 })

  return tx
}

function uint8ArrayToHex(uint8Array: Uint8Array): string {
  let hex = ''
  for (let i = 0; i < uint8Array.length; i++) {
    const byte = uint8Array[i]
    // Use the toString(16) method to convert each byte to a hexadecimal string.
    // Ensure that the resulting string has two characters by using padStart.
    hex += byte.toString(16).padStart(2, '0')
  }
  return hex
}

// works: https://assethub-polkadot.subscan.io/xcm_message/polkadot-b987dc6756fcb830746ef5fd6d40344a78f8d1f3
export async function assethub_to_polkadot(amount: number, address: string) {
  console.log(`[assethub_to_polkadot] connecting`)
  const api = await connectToWsEndpoint('assetHub')
  // Assuming 'connectToWsEndpoint' connects to the parachain
  const paraid = 1000 // The parachain ID where the assetHub is located, change if different
  console.log(`[assethub_to_polkadot] connected`)
  const accountId = api.createType('AccountId32', address).toHex()

  // Define the destination on the Polkadot Relay Chain
  const destination = {
    parents: 1, // One level up from a parachain to the Relay Chain
    interior: { Here: null }, // The destination is the Relay Chain itself
  }

  const account = {
    parents: 0, // The account is on the Relay Chain (no parent required)
    interior: { X1: { AccountId32: { id: accountId, network: null } } },
  }

  const asset = [
    {
      id: { Concrete: { parents: 1, interior: 'Here' } }, // The asset is on the parachain (origin)
      fun: { Fungible: amount },
    },
  ]

  // The transaction to teleport assets from assetHub to Polkadot
  const tx = api.tx.polkadotXcm.limitedTeleportAssets(
    { V3: destination },
    { V3: account },
    { V3: asset },
    { fee_asset_item: 0 },
    { Unlimited: null },
  )

  return tx
}

/// assethub > hydra
export async function assethub_to_hydra(assetid: number, amount: number, accountId: string) {
  console.log(`[assethub_to_hydra]`)
  const api = await connectToWsEndpoint('assetHub')
  const paraid = 2034 //hydradx
  const accountid = raw_address_now(accountId) //uint8ArrayToHex(blake2(getRawAddress(accountid)).map((x, i): number => (x + 256 - ZERO[i]) % 256));
  const destination = {
    interior: { X1: { Parachain: paraid } },
    parents: 1,
  }

  const account = {
    parents: 0,
    interior: { X1: { AccountId32: { id: accountid, network: 'Any' } } },
  }

  const asset = {
    id: {
      Concrete: {
        parents: 0,
        interior: {
          X2: [
            {
              PalletInstance: 50,
            },
            {
              GeneralIndex: assetid.toString(),
            },
          ],
        },
      },
    },
    fun: { Fungible: amount },
    //	parents: 0,
  }
  //];

  const tx = api.tx.polkadotXcm.limitedReserveTransferAssets({ V2: destination }, { V2: account }, { V2: [asset] }, 0, {
    Unlimited: 0,
  })
  return tx
}

/// assethub > parachain, send an asset on assethub to receiving parachain
export async function assethub_to_parachain(assetid: string, amount: number, accountid: string, paraid: number) {
  const api = await connectToWsEndpoint('assetHub')

  const accountId = raw_address_now(accountid) //uint8ArrayToHex(blake2(getRawAddress(accountid)).map((x, i): number => (x + 256 - ZERO[i]) % 256));

  //const paraid = 2034;//hydradx
  //const accountid = "0xca477d2ed3c433806a8ce7969c5a1890187d765ab8080d3793b49b42aa9e805f";
  const destination = {
    interior: { X1: { Parachain: paraid } },
    parents: 1,
  }

  const account = {
    parents: 0,
    interior: { X1: { AccountId32: { id: accountId } } },
  }

  const asset = {
    id: {
      Concrete: {
        parents: 0,
        interior: {
          X2: [{ PalletInstance: 50 }, { GeneralIndex: assetid }],
        },
      },
    },
    fun: { Fungible: amount },
    parents: 0,
  }
  //];

  const tx = api.tx.polkadotXcm.limitedReserveTransferAssets({ V3: destination }, { V3: account }, { V3: [asset] }, 0, {
    Unlimited: 0,
  })
  return tx
}
