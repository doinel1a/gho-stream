interface ITokenBase {
  name: string;
  icon: string;
}

interface ITokenContract extends ITokenBase {
  address: string;
  abi: string[];
  decimals: number;
}

interface IToken extends ITokenBase {
  weiBalance: number;
  normalizedBalance: number;
}

export type { ITokenContract, IToken };
