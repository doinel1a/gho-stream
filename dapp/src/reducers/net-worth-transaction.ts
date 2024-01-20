import EReducerState from '@/constants/reducer-state';

const netWorthTransactionInitialState = {
  isLoading: false,
  isError: false,
  isSuccess: false,
  netWorth: 0 as number | undefined
};

type TNetWorthTransactionState = typeof netWorthTransactionInitialState;

interface INetWorthTransactionAction {
  state: EReducerState;
  payload: number | undefined;
}

function netWorthTransactionReducer(
  state: TNetWorthTransactionState,
  action: INetWorthTransactionAction
) {
  switch (action.state) {
    case EReducerState.start: {
      return {
        isLoading: true,
        isError: false,
        isSuccess: false,
        netWorth: undefined
      };
    }
    case EReducerState.success: {
      return {
        isLoading: false,
        isError: false,
        isSuccess: true,
        netWorth: action.payload
      };
    }
    case EReducerState.error: {
      return {
        isLoading: false,
        isError: true,
        isSuccess: false,
        netWorth: undefined
      };
    }
    case EReducerState.reset: {
      return {
        isLoading: false,
        isError: false,
        isSuccess: false,
        netWorth: undefined
      };
    }
    default: {
      return state;
    }
  }
}

export type { TNetWorthTransactionState, INetWorthTransactionAction };
export { netWorthTransactionInitialState, netWorthTransactionReducer };
