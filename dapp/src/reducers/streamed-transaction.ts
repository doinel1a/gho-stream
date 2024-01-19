import type IStreamedAsset from '@/interfaces/streamed-asset';

import EReducerState from '@/constants/reducer-state';

const streamedTransactionInitialState = {
  isLoading: false,
  isError: false,
  isSuccess: false,
  streams: [] as IStreamedAsset[] | undefined
};

type TStreamedTransactionState = typeof streamedTransactionInitialState;

interface IStreamedTransactionAction {
  state: EReducerState;
  payload: IStreamedAsset[] | undefined;
}

function streamedTransactionReducer(
  state: TStreamedTransactionState,
  action: IStreamedTransactionAction
) {
  switch (action.state) {
    case EReducerState.start: {
      return {
        isLoading: true,
        isError: false,
        isSuccess: false,
        streams: undefined
      };
    }
    case EReducerState.success: {
      return {
        isLoading: false,
        isError: false,
        isSuccess: true,
        streams: action.payload
      };
    }
    case EReducerState.error: {
      return {
        isLoading: false,
        isError: true,
        isSuccess: false,
        streams: undefined
      };
    }
    case EReducerState.reset: {
      return {
        isLoading: false,
        isError: false,
        isSuccess: false,
        streams: undefined
      };
    }
    default: {
      return state;
    }
  }
}

export type { TStreamedTransactionState, IStreamedTransactionAction };
export { streamedTransactionInitialState, streamedTransactionReducer };
