export interface IIngredientVals {
  name: string;
  description: string;
  rarity?: number;
  sources: Array<string>;
}

export interface IIngredient {
  [key: string]: IIngredientVals;
}


export interface IPotionVals {
  name: string;
  effect: string;
  rarity: number;
}

export interface IPotion {
  [key: string]: IPotionVals;
}