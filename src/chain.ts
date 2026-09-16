import { createPublicClient, createWalletClient, custom, http, keccak256, stringToHex, toBytes, type Address, type Hash } from 'viem';

export const chain = { id: 968, name: 'BOT Chain Testnet', nativeCurrency: { name: 'BOT', symbol: 'BOT', decimals: 18 }, rpcUrls: { default: { http: [import.meta.env.VITE_BOTCHAIN_RPC_URL || 'https://rpc.bohr.life'] } }, blockExplorers: { default: { name: 'BOTScan', url: 'https://scan.bohr.life' } } } as const;
export const registryAddress = (import.meta.env.VITE_RUNSEAL_CONTRACT_ADDRESS || '') as Address;
export const registryAbi = [
  { type: 'function', name: 'sealIntent', stateMutability: 'nonpayable', inputs: [{ name: 'sealId', type: 'bytes32' }, { name: 'intentSeal', type: 'bytes32' }], outputs: [] },
  { type: 'function', name: 'seals', stateMutability: 'view', inputs: [{ name: '', type: 'bytes32' }], outputs: [{ name: 'submitter', type: 'address' }, { name: 'intentSeal', type: 'bytes32' }, { name: 'createdAt', type: 'uint64' }] },
  { type: 'event', name: 'IntentSealed', anonymous: false, inputs: [{ name: 'sealId', type: 'bytes32', indexed: true }, { name: 'intentSeal', type: 'bytes32', indexed: true }, { name: 'submitter', type: 'address', indexed: true }] }
] as const;
export const publicClient = createPublicClient({ chain, transport: http(chain.rpcUrls.default.http[0]) });
export function canonical(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonical).join(',')}]`;
  if (value && typeof value === 'object') return `{${Object.entries(value).sort(([a], [b]) => a.localeCompare(b)).map(([k, v]) => `${JSON.stringify(k)}:${canonical(v)}`).join(',')}}`;
  return JSON.stringify(value);
}
export function intentSeal(intent: unknown): Hash { return keccak256(toBytes(canonical(intent))); }
export function sealId(id: string): Hash { return keccak256(stringToHex(id)); }
export async function connectWallet() {
  const provider = (window as Window & { ethereum?: { request(args: { method: string; params?: unknown[] }): Promise<unknown>; on?: (event: string, cb: (...args: unknown[]) => void) => void; removeListener?: (event: string, cb: (...args: unknown[]) => void) => void } }).ethereum;
  if (!provider) throw new Error('No injected wallet found. Install or unlock an EVM wallet to seal on-chain.');
  const wallet = createWalletClient({ chain, transport: custom(provider) });
  const [account] = await wallet.requestAddresses();
  return { provider, wallet, account };
}
export async function ensureTestnet(provider: { request(args: { method: string; params?: unknown[] }): Promise<unknown> }) {
  try { await provider.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: '0x3c8' }] }); }
  catch (error) {
    if ((error as { code?: number }).code !== 4902) throw error;
    await provider.request({ method: 'wallet_addEthereumChain', params: [{ chainId: '0x3c8', chainName: chain.name, nativeCurrency: chain.nativeCurrency, rpcUrls: chain.rpcUrls.default.http, blockExplorerUrls: [chain.blockExplorers.default.url] }] });
    await provider.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: '0x3c8' }] });
  }
}
