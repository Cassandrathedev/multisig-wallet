import MultiSigWalletABI from "./MultiSigWallet.json";

export const CONTRACT_ADDRESS = "0xDa4AdA2552B4c4dDf68b99383cC1E3586ffEDD78";
export const CONTRACT_ABI = MultiSigWalletABI.abi;

export const OWNERS = [
    "0x9EFc7ec00233e8746f856a6a5c229Ec27bb98827",
    "0x85eE2dc9EB54e587ab1D5a772a7344c1673A4766",
    "0x28AD6cB5F9AAdCAC28D2a371373a3408C1aFF083",
];

export const REQUIRED = 2; // 2 of 3