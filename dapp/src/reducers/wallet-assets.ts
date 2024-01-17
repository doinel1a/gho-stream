import type { IToken } from '@/interfaces/token';

import EReducerState from '@/constants/reducer-state';

const walletAssetsInitialState = {
  isLoading: false,
  isError: false,
  isSuccess: false,
  tokens: [] as IToken[] | undefined
};

type TWalletAssetsState = typeof walletAssetsInitialState;

interface IWalletAssetsAction {
  state: EReducerState;
  payload: IToken[] | undefined;
}

function walletAssetsReducer(state: TWalletAssetsState, action: IWalletAssetsAction) {
  switch (action.state) {
    case EReducerState.start: {
      return {
        isLoading: true,
        isError: false,
        isSuccess: false,
        tokens: undefined
      };
    }
    case EReducerState.success: {
      return {
        isLoading: false,
        isError: false,
        isSuccess: true,
        tokens: action.payload
      };
    }
    case EReducerState.error: {
      return {
        isLoading: false,
        isError: true,
        isSuccess: false,
        tokens: undefined
      };
    }
    case EReducerState.reset: {
      return {
        isLoading: false,
        isError: false,
        isSuccess: false,
        tokens: undefined
      };
    }
    default: {
      return state;
    }
  }
}

export type { TWalletAssetsState, IWalletAssetsAction };
export { walletAssetsInitialState, walletAssetsReducer };
