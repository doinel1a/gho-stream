import EReducerState from '@/constants/reducer-state';

const supplyTransactionInitialState = {
  isLoading: false,
  isError: false,
  isSuccess: false,
  errorCode: 0 as number | undefined
};

type TSupplyTransactionState = typeof supplyTransactionInitialState;

interface ISupplyTransactionAction {
  state: EReducerState;
  payload: number | undefined;
}

function supplyTransactionReducer(
  state: TSupplyTransactionState,
  action: ISupplyTransactionAction
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

export type { TSupplyTransactionState, ISupplyTransactionAction };
export { supplyTransactionInitialState, supplyTransactionReducer };
