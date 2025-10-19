import { GenericContractsDeclaration } from "~~/utils/helper/contract";

const deployedContracts = {
  11155111: {
    ZamaKYC: {
      address: "0x115E877D0eA462c9B2F78fF43bf0E87E5EC5c18b",
      abi: [
        {
          "inputs": [],
          "stateMutability": "nonpayable",
          "type": "constructor"
        },
        {
          "anonymous": false,
          "inputs": [
            {
              "indexed": true,
              "internalType": "address",
              "name": "user",
              "type": "address"
            },
            {
              "indexed": false,
              "internalType": "uint256",
              "name": "timestamp",
              "type": "uint256"
            }
          ],
          "name": "KYCApproved",
          "type": "event"
        },
        {
          "anonymous": false,
          "inputs": [
            {
              "indexed": true,
              "internalType": "address",
              "name": "user",
              "type": "address"
            },
            {
              "indexed": false,
              "internalType": "string",
              "name": "reason",
              "type": "string"
            },
            {
              "indexed": false,
              "internalType": "uint256",
              "name": "timestamp",
              "type": "uint256"
            }
          ],
          "name": "KYCRejected",
          "type": "event"
        },
        {
          "anonymous": false,
          "inputs": [
            {
              "indexed": true,
              "internalType": "address",
              "name": "user",
              "type": "address"
            },
            {
              "indexed": false,
              "internalType": "uint256",
              "name": "timestamp",
              "type": "uint256"
            }
          ],
          "name": "KYCSubmitted",
          "type": "event"
        },
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "user",
              "type": "address"
            }
          ],
          "name": "approveKYC",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "user",
              "type": "address"
            }
          ],
          "name": "getKYCData",
          "outputs": [
            {
              "internalType": "uint64",
              "name": "nameHash",
              "type": "uint64"
            },
            {
              "internalType": "uint64",
              "name": "addressHash",
              "type": "uint64"
            },
            {
              "internalType": "uint64",
              "name": "documentHash",
              "type": "uint64"
            },
            {
              "internalType": "uint8",
              "name": "status",
              "type": "uint8"
            },
            {
              "internalType": "uint256",
              "name": "submittedAt",
              "type": "uint256"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "user",
              "type": "address"
            }
          ],
          "name": "getKYCStatus",
          "outputs": [
            {
              "internalType": "uint8",
              "name": "",
              "type": "uint8"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [],
          "name": "protocolId",
          "outputs": [
            {
              "internalType": "uint256",
              "name": "",
              "type": "uint256"
            }
          ],
          "stateMutability": "pure",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "user",
              "type": "address"
            },
            {
              "internalType": "string",
              "name": "reason",
              "type": "string"
            }
          ],
          "name": "rejectKYC",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "uint64",
              "name": "nameHash",
              "type": "uint64"
            },
            {
              "internalType": "uint64",
              "name": "addressHash",
              "type": "uint64"
            },
            {
              "internalType": "uint64",
              "name": "documentHash",
              "type": "uint64"
            },
            {
              "internalType": "externalEuint64",
              "name": "encryptedAge",
              "type": "bytes32"
            },
            {
              "internalType": "bytes",
              "name": "inputProof",
              "type": "bytes"
            }
          ],
          "name": "submitKYC",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        }
      ],
      inheritedFunctions: {},
    },
  },
} as const;

export default deployedContracts satisfies GenericContractsDeclaration;
