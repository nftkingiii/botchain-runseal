# Runseal

Runseal is a release console for agent actions: write the expected intent first, preserve its fingerprint, supply the observed result, then inspect field-level differences before accepting it. A local match is a comparison, not proof that the action occurred. An on-chain registry seal proves only that a wallet submitted a commitment hash and that the contract later returned the same stored hash.

The product adapts the idea of a trace with ordered observations into a compact four-stage run: Intent → Sealed → Observed → Verified. The deployed contract does not execute agents, evaluate policy, or attest business outcomes. It stores an intent commitment and submitter/timestamp only.

## BOT Chain Testnet

- Chain: BOT Chain Testnet, chain ID `968` (`0x3c8`)
- RPC: `https://rpc.bohr.life`
- Native token: BOT
- Explorer: [BOTScan](https://scan.bohr.life)
- Verified `RunsealRegistry`: `0xA319834D29875902762747655E8364d8605Da4eD`
- Deployment transaction: [0x743d3404013be763e9c20c90c5bfb7001caae1e70aef9f0ee6d69090f3cf10ad](https://scan.bohr.life/tx/0x743d3404013be763e9c20c90c5bfb7001caae1e70aef9f0ee6d69090f3cf10ad)

The UI talks only to the deployed ABI: `sealIntent(bytes32 sealId, bytes32 intentSeal)`, `seals(bytes32)`, and `IntentSealed`. It checks network/code, simulates before asking the connected wallet to submit, waits for receipt, then reads `seals` back. It never signs automatically and never uses a stored private key.

## Run locally

Use Node.js 20.19+ (tested on Node 24) and npm 11.4+.

```sh
npm ci --ignore-scripts
npm run dev
```

For a production-like local service:

```sh
npm run build
npm start
```

The server listens on `0.0.0.0:$PORT` (default `4310`), serves SPA deep links, and exposes `/healthz` with a revision identifier. Set the public configuration in `.env` using `.env.example`; never put wallet secrets in frontend environment variables. `VITE_RUNSEAL_CONTRACT_ADDRESS` must be the intended registry address. No API keys, oracle, prover, or off-chain service is integrated; RPC access is public and direct from the browser.

## Workflows

- **Runs:** searchable/filterable local list, selected-run URL persistence, intent-to-observation field comparison, export to JSON.
- **Seal intent:** validates a bounded JSON object, fingerprints it locally, and stores it in browser storage scoped by chain, registry and account. Local storage is not a durable or shared audit database.
- **Verify:** compares supplied expected/observed fields locally. It cannot authenticate the source of the observation.
- **Registry seal:** explicit wallet connect, chain switch/add if needed, bytecode check, ABI simulation, wallet confirmation, receipt status, and contract read-back.

Sample rows are illustrative and cannot be written to the registry. Create a new intent to produce a real local fingerprint.

## Testnet proof checklist

- [x] Testnet chain ID and RPC config checked against `eth_chainId` (`0x3c8`).
- [x] Contract source verified on BOTScan; deployment transaction and address recorded above.
- [ ] User creates an intent in the live DApp; capture the locally computed commitment.
- [ ] User explicitly approves `sealIntent` in a wallet on chain 968; retain the transaction hash.
- [ ] Confirm successful status and matching `seals(sealId)` read-back; link the explorer transaction.
- [ ] Supply the observed result and inspect local field comparison; do not describe it as an oracle attestation.

## Checks

```sh
npm test
npm run typecheck
npm run build
forge build
forge test -vv
```

Foundry verifies the project-specific registry behavior. App tests cover the HTTP health endpoint and deep-link fallback. No transaction is included in the test suite.
