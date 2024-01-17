/* eslint-disable semi */

interface IAttribute {
  trait_type: string;
  value: string;
}

export default interface INftData {
  name: string;
  description: string;
  image: string;
  attributes: IAttribute[];
  external_url: string;
}
