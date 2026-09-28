# The Sentinel Technical Specification

## Overview
The Sentinel is the cryptographic security layer of the Nexus Truth network. It acts as the ultimate arbiter of truth, ensuring that decentralized hardware providers actually performed the computational work they claim, and ensuring that proprietary AI models remain completely encrypted while being processed on consumer hardware.

## Cryptographic Architecture

* **Zero Knowledge Proofs:** The Sentinel utilizes advanced zero knowledge cryptography. This allows a node to mathematically prove it executed a specific machine learning inference task correctly without revealing the underlying proprietary dataset to the node operator.
* **The Vetting Window:** All new nodes entering the network undergo a 72 hour testing period. The Sentinel deploys dummy workloads with known outcomes to these new nodes. If the returned results deviate from the known truth, the node is permanently blacklisted.

## On Chain Settlement and Security

* **Cryptographic Signatures:** Every completed workload generates a unique cryptographic hash.
* **Smart Contract Integration:** The Sentinel submits these verified hashes to the Nexus Truth smart contracts. Once consensus is reached, the contract autonomously releases NXUS tokens to the hardware provider.
* **Malicious Actor Slashing:** If a node attempts to submit falsified compute results, The Sentinel instantly rejects the proof and slashes the staked NXUS tokens belonging to that node, economically deterring bad actors.
