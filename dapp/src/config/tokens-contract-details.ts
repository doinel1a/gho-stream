import type { ITokenContract } from '@/interfaces/token';

const approveFunction = 'function approve(address spender, uint256 amount) returns (bool)';
const balanceOfFunction = 'function balanceOf(address account) view returns (uint256)';

const tokensContractDetails: ITokenContract[] = [
  {
    name: 'DAI',
    icon: 'https://staging.aave.com/icons/tokens/dai.svg',
    address: '0xFF34B3d4Aee8ddCd6F9AFFFB6Fe49bD371b8a357',
    aAddress: '0x72CB9080841acB75E5AB9d83E5F78a3d20326e6A',
    abi: [approveFunction, balanceOfFunction],
    decimals: 18
  },
  {
    name: 'USDC',
    icon: 'https://staging.aave.com/icons/tokens/usdc.svg',
    address: '0x94a9D9AC8a22534E3FaCa9F4e7F2E2cf85d5E4C8',
    aAddress: '0x915790Fe8cc10Acf844CB77F8DC3299d4E3be78a',
    abi: [approveFunction, balanceOfFunction],
    decimals: 6
  },
  {
    name: 'WETH',
    icon: 'https://staging.aave.com/icons/tokens/weth.svg',
    address: '0xC558DBdd856501FCd9aaF1E62eae57A9F0629a3c',
    aAddress: '0xaC775C0b34c50Ba68bBC0e4F3c9aCCaf34123eda',
    abi: [approveFunction, balanceOfFunction],
    decimals: 18
  }
];

export default tokensContractDetails;
