import { CHAIN_ASSETS } from "./chainAssets";


export function get_moonbeam_asset_decimals(assetid: string) {
    const assetobj = list_onchainassets("moonbeam");
    var decimals = 0;
    for (const x of assetobj) {
      if (x.assetId === assetid) {
        console.log(`assetobj| found asset: `, x);
        decimals = parseInt(x.asset.decimals, 10);
      }
    }
    return decimals;
  }


  export function list_onchainassets(chain: string) {
    switch (chain) {
      case "moonbeam":
        const assets = CHAIN_ASSETS.moonbeam.assets;
        return assets.map(
          (assetData: { asset: any; decimals: any; assetId: any }) => ({
            asset: assetData.asset,
            decimals: assetData.decimals,
            assetId: assetData.assetId.replace(",", ""),
          })
        );
    }
  }