import EReducerState from '@/constants/reducer-state';

const suppliedBalanceTransactionInitialState = {
  isLoading: false,
  isError: false,
  isSuccess: false,
  balance: 0 as number | undefined
};

type TSuppliedBalanceTransactionState = typeof suppliedBalanceTransactionInitialState;

interface ISuppliedBalanceTransactionAction {
  state: EReducerState;
  payload: number | undefined;
}

function suppliedBalanceTransactionReducer(
  state: TSuppliedBalanceTransactionState,
  action: ISuppliedBalanceTransactionAction
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

export type { TSuppliedBalanceTransactionState, ISuppliedBalanceTransactionAction };
export { suppliedBalanceTransactionInitialState, suppliedBalanceTransactionReducer };
