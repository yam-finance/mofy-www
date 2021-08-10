// src/lib/config/index.ts
import { browser } from '$app/env';
import dotenv from 'dotenv';

browser ? '' : dotenv.config();

export function zkExplorer(_networkId: number): string {
	if (_networkId === 1) {
		return 'https://zkscan.io/explorer/transactions/';
	} else if (_networkId === 4) {
		return 'https://rinkeby.zkscan.io/explorer/transactions/';
	}
}
