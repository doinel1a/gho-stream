import type { IToken } from '@/interfaces/token';

import EReducerState from '@/constants/reducer-state';

const suppliedTransactionInitialState = {
  isLoading: false,
  isError: false,
  isSuccess: false,
  tokens: [] as IToken[] | undefined
};

type TSuppliedTransactionState = typeof suppliedTransactionInitialState;

interface ISuppliedTransactionAction {
  state: EReducerState;
  payload: IToken[] | undefined;
}

function suppliedTransactionReducer(
  state: TSuppliedTransactionState,
  action: ISuppliedTransactionAction
) {
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

export type { TSuppliedTransactionState, ISuppliedTransactionAction };
export { suppliedTransactionInitialState, suppliedTransactionReducer };
