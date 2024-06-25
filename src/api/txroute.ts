import {
  dotToHydraDx,
  assethub2interlay,
  assethub_to_polkadot,
  hydraDxToParachain,
  polkadot_to_assethub,
  assethub_to_parachain,
  assethub_to_hydra,
  moonriver2turing,
  turing2moonriver,
  moon2polkadot,
  moon2parachain,
  moon2hydra2,
  hydra2moonbeam,
  interlay2moonbeam,
  polkadot2moonbeam,
  assethub2moonbeam,
  turing2mangata,
} from './DraftTx'

import { get_moonbeam_asset_decimals } from './assethelp';

/// spit out a tx
/// input: source chain, dest chain, assetid, amount
export async function route_tx(
  source_chain: string,
  dest_chain: string,
  assetid: number,
  amount: number,
  destinationaddress: string,
) {
  // console.log(`route_tx start`);
  // todo lowercase it
  const sourcechain = source_chain.toLowerCase()
  const destchain = dest_chain.toLowerCase()

  console.log(`${sourcechain}:${destchain}`)
  switch (`${sourcechain}:${destchain}`) {
    case 'polkadot:hydradx':
      console.log('handleTransfer for Polkadot to HydraDx...')
      return dotToHydraDx(amount, destinationaddress)

    case 'hydradx:assethub':
      console.log('handleTransfer for HydraDx to AssetHub...')
      const paraid1 = 1000
      return hydraDxToParachain(amount, assetid, destinationaddress, paraid1)

    case 'polkadot:assethub':
      console.log('handleTransfer for Polkadot to AssetHub...')
      return polkadot_to_assethub(amount, destinationaddress)

    case 'hydradx:polkadot':
      console.log('handleTransfer for HydraDx to Polkadot...')
      const paraid2 = 0
      return hydraDxToParachain(amount, assetid, destinationaddress, paraid2)

    case 'moonbeam:polkadot':
      return moon2polkadot(destinationaddress, amount)

    case 'moonbeam:assetHub':
      console.log(`moon2assethub`)
      const mdecimals1 = get_moonbeam_asset_decimals(assetid.toString())
      const correct_amount2 = amount * 10 ** mdecimals1
      return moon2parachain(assetid.toString(), correct_amount2, destinationaddress, 1000)

    case 'moonbeam:hydraDx':
      console.log(`assetid`, assetid)
      const mdecimals2 = get_moonbeam_asset_decimals(assetid.toString())
      const correct_amount22 = amount * 10 ** mdecimals2
      console.log(`moon2hydra decimals:`, mdecimals2)
      console.log(`moon2hydra correct_amount:`, correct_amount22)
      return moon2hydra2(assetid.toString(), correct_amount22, destinationaddress)

    //            return moon2hydra(destinationaddress, correct_amount);

    case 'moonbeam:interlay':
      const mdecimals = get_moonbeam_asset_decimals(assetid.toString())
      const correct_amount = amount * 10 ** mdecimals

      return moon2parachain(assetid.toString(), correct_amount, destinationaddress, 2032)

    case 'interlay:moonbeam':
      return interlay2moonbeam(amount.toString(), assetid.toString(), destinationaddress)

    case 'hydraDx:moonbeam':
      return hydra2moonbeam(destinationaddress, assetid.toString(), amount.toString())

    case 'assethub:moonbeam':
      return assethub2moonbeam(amount.toString(), assetid.toString(), destinationaddress)

    case 'moonriver:turing':
      return moonriver2turing(destinationaddress, amount)

    case 'turing:moonriver':
      return turing2moonriver(destinationaddress, amount)

    case 'turing:mangatax':
      return turing2mangata(amount, destinationaddress)

    case 'assethub:polkadot':
      console.log('handleTransfer for AssetHub to Polkadot...')
      return assethub_to_polkadot(amount, destinationaddress)
    //return assethub_to_parachain(assetid.toString(), amount, destinationaddress, paraid3);

    case 'assethub:interlay':
      console.log(`assethub 2 interlay`)
      return assethub2interlay(assetid, amount, destinationaddress)

    case 'assethub:hydradx':
      console.log('handleTransfer for AssetHub to HydraDx...')
      return assethub_to_hydra(assetid, amount, destinationaddress)

    default:
      console.log(`error error`)
      throw new Error(`Unsupported chain combination: ${sourcechain}:${destchain}`)
  }
}
