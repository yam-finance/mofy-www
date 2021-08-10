// src/lib/config/index.ts
import { browser } from '$app/env';
import dotenv from 'dotenv';

browser ? '' : dotenv.config();

export const INFURA_API_KEY = browser ? '' : process.env['INFURA_API_KEY'];
export const NFT_STORAGE_API_KEY = browser ? '' : process.env['NFT_STORAGE_API_KEY'];

export function zkExplorer(_networkId: number): string {
	if (_networkId === 1) {
		return 'https://zkscan.io/explorer/transactions/';
	} else if (_networkId === 4) {
		return 'https://rinkeby.zkscan.io/explorer/transactions/';
	}
}
