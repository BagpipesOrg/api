// broadcast.ts

import { ApiPromise } from '@polkadot/api';
import connectToWsEndpoint from "./connect";

/**
 * Broadcast a signed extrinsic to the chain.
 * 
 * @param {string} chain - The name of the chain (e.g. 'polkadot').
 * @param {any} signedExtrinsic - The signed extrinsic to broadcast.
 */
export async function broadcastToChain(chain: string, signedExtrinsic: any): Promise<any> {
    let api: ApiPromise;
    
    try {
        api = await connectToWsEndpoint(chain);
    } catch (error) {
        console.error("Failed to connect to the endpoint. Please ensure you're connected and try again.");
        throw error;
    }

    try {
       
     //   const parsedTransaction = api.tx(signedExtrinsic);
        const tx = await api.rpc.author.submitExtrinsic(signedExtrinsic);
        return tx;
    } catch (error) {
        console.error('Error broadcasting transaction:', error.message || error.toString());
        throw error;
    }
}
