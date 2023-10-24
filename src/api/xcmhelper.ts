import connectToWsEndpoint from './connect';


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