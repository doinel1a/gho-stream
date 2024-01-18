import EReducerState from '@/constants/reducer-state';

const withdrawTransactionInitialState = {
  isLoading: false,
  isError: false,
  isSuccess: false,
  errorCode: 0 as number | undefined
};

type TWithdrawTransactionState = typeof withdrawTransactionInitialState;

interface IWithdrawTransactionAction {
  state: EReducerState;
  payload: number | undefined;
}

function withdrawTransactionReducer(
  state: TWithdrawTransactionState,
  action: IWithdrawTransactionAction
) {
  switch (action.state) {
    case EReducerState.start: {
      return {
        isLoading: true,
        isError: false,
        isSuccess: false,
        errorCode: undefined
      };
    }
    case EReducerState.success: {
      return {
        isLoading: false,
        isError: false,
        isSuccess: true,
        errorCode: undefined
      };
    }
    case EReducerState.error: {
      return {
        isLoading: false,
        isError: true,
        isSuccess: false,
        errorCode: action.payload
      };
    }
    case EReducerState.reset: {
      return {
        isLoading: false,
        isError: false,
        isSuccess: false,
        errorCode: undefined
      };
    }
    default: {
      return state;
    }
  }
}

export type { TWithdrawTransactionState, IWithdrawTransactionAction };
export { withdrawTransactionInitialState, withdrawTransactionReducer };
