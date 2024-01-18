import type INftData from '@/interfaces/nft-data';

export default function decodeNftUri(nftUri: string) {
  try {
    const base64Data = nftUri.split(',');
    const stringData = atob(base64Data[1]);
    const jsonData: INftData = JSON.parse(stringData) as INftData;

    return jsonData;
  } catch (error) {
    if (error instanceof Error) {
      console.error('ERROR PARSING NFT URI', error.message);

      return null;
    }
  }

  return null;
}
