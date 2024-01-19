/* eslint-disable semi */

export default interface IStreamedAsset {
  id: bigint;
  startTime: string;
  endTime: string;
  recipient: string;
  status: string;
  depositAmount: number;
  streamedAmount: number;
  withdrawnAmount: number;
  tokenUri: string;
}
