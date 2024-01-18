import type { ITokenContract } from '@/interfaces/token';

const approveFunction = 'function approve(address spender, uint256 amount) returns (bool)';
const balanceOfFunction = 'function balanceOf(address account) view returns (uint256)';

const tokensContractDetails: ITokenContract[] = [
  {
    name: 'DAI',
    icon: 'https://staging.aave.com/icons/tokens/dai.svg',
    address: '0xFF34B3d4Aee8ddCd6F9AFFFB6Fe49bD371b8a357',
    abi: [approveFunction, balanceOfFunction],
    decimals: 18
  },
  {
    name: 'USDC',
    icon: 'https://staging.aave.com/icons/tokens/usdc.svg',
    address: '0x94a9D9AC8a22534E3FaCa9F4e7F2E2cf85d5E4C8',
    abi: [approveFunction, balanceOfFunction],
    decimals: 6
  },
  {
    name: 'WETH',
    icon: 'https://staging.aave.com/icons/tokens/weth.svg',
    address: '0xC558DBdd856501FCd9aaF1E62eae57A9F0629a3c',
    abi: [approveFunction, balanceOfFunction],
    decimals: 18
  }
];

export default tokensContractDetails;
