export interface IIngredientVals {
  name: string;
  description: string;
  rarity?: number;
  sources: Array<string>;
}

export interface IIngredient {
  [key: string]: IIngredientVals;
}
