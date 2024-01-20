import EReducerState from '@/constants/reducer-state';

const maxAmountToBorrowTransactionInitialState = {
  isLoading: false,
  isError: false,
  isSuccess: false,
  maxAmount: 0 as number | undefined
};

type TMaxAmountToBorrowTransactionState = typeof maxAmountToBorrowTransactionInitialState;

interface IMaxAmountToBorrowTransactionAction {
  state: EReducerState;
  payload: number | undefined;
}

function maxAmountToBorrowTransactionReducer(
  state: TMaxAmountToBorrowTransactionState,
  action: IMaxAmountToBorrowTransactionAction
) {
  switch (action.state) {
    case EReducerState.start: {
      return {
        isLoading: true,
        isError: false,
        isSuccess: false,
        maxAmount: undefined
      };
    }
    case EReducerState.success: {
      return {
        isLoading: false,
        isError: false,
        isSuccess: true,
        maxAmount: action.payload
      };
    }
    case EReducerState.error: {
      return {
        isLoading: false,
        isError: true,
        isSuccess: false,
        maxAmount: undefined
      };
    }
    case EReducerState.reset: {
      return {
        isLoading: false,
        isError: false,
        isSuccess: false,
        maxAmount: undefined
      };
    }
    default: {
      return state;
    }
  }
}

export type { TMaxAmountToBorrowTransactionState, IMaxAmountToBorrowTransactionAction };
export { maxAmountToBorrowTransactionInitialState, maxAmountToBorrowTransactionReducer };
