import connectToWsEndpoint from './connect';

function parachain_times(time: number) {
  const times = {
    100800: "7d",
    28800: "2d",
    72000: "5d",
    1209600: "12w",
    10512000: "2y"
  };
//  Auction duration	7 days	100_800	The total duration of the slot auction, subject to the candle auction mechanism.
// Opening period	2 days	28_800	The opening period of the slot auction.
// Ending period	5 days	72_000	The ending period of the slot auction.
}


export async function find_ingress_polkadot_channels(paraid: number): Promise<[number]> {
	const api = await connectToWsEndpoint('polkadot');
	const Channels = (
        (await api.query.hrmp.hrmpIngressChannelsIndex(paraid)) as any
      ).map((a) => a.toNumber());

	return Channels;
}

export async function find_engress_polkadot_channels(paraid: number): Promise<[number]> {
	const api = await connectToWsEndpoint('polkadot');
	const Channels = (
        (await api.query.hrmp.hrmpEgressChannelsIndex(paraid)) as any
      ).map((a) => a.toNumber());

	return Channels;
}

export async function inandoutchannels(paraid: number): Promise<number[]> {
    const s_ingress = await find_ingress_polkadot_channels(paraid);
      const s_egress = await find_engress_polkadot_channels(paraid);
    const paraid_map: number[] = s_ingress.filter((num) => s_egress.includes(num));
  
    return paraid_map;
  
  }