import EReducerState from '@/constants/reducer-state';

const streamedBalanceTransactionInitialState = {
  isLoading: false,
  isError: false,
  isSuccess: false,
  balance: 0 as number | undefined
};

type TStreamedBalanceTransactionState = typeof streamedBalanceTransactionInitialState;

interface IStreamedBalanceTransactionAction {
  state: EReducerState;
  payload: number | undefined;
}

function streamedBalanceTransactionReducer(
  state: TStreamedBalanceTransactionState,
  action: IStreamedBalanceTransactionAction
) {
  switch (action.state) {
    case EReducerState.start: {
      return {
        isLoading: true,
        isError: false,
        isSuccess: false,
        balance: undefined
      };
    }
    case EReducerState.success: {
      return {
        isLoading: false,
        isError: false,
        isSuccess: true,
        balance: action.payload
      };
    }
    case EReducerState.error: {
      return {
        isLoading: false,
        isError: true,
        isSuccess: false,
        balance: undefined
      };
    }
    case EReducerState.reset: {
      return {
        isLoading: false,
        isError: false,
        isSuccess: false,
        balance: undefined
      };
    }
    default: {
      return state;
    }
  }
}

export type { TStreamedBalanceTransactionState, IStreamedBalanceTransactionAction };
export { streamedBalanceTransactionInitialState, streamedBalanceTransactionReducer };
