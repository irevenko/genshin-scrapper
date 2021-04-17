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
  crafring?: Array<IPotionCraft>
}

export interface IPotionCraft {
  item: string;
  quantity: number;
}

export interface IPotion {
  [key: string]: IPotionVals;
}