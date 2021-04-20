export interface IIngredient {
  [key: string]: IIngredientVals;
}

export interface IPotion {
  [key: string]: IPotionVals;
}

export interface IFood {
  [key: string]: IFoodVals;
}

export interface ISpecialDishes {
  [key: string]: ISpecialDishesVals;
}

export interface IEventDishes {
  [key: string]: IEventDishesVals;
}

export interface IIngredientVals {
  name: string;
  description: string;
  rarity?: number;
  sources: Array<string>;
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

export interface IFoodVals {
  name: string;
  type: string;
  effect: string;
  rarity: number;
  hasRecipe?: boolean;
}

export interface ISpecialDishesVals {
  name: string;
  type: string;
  effect: string;
  rarity: number;
  character: string;
}

export interface IEventDishesVals {
  name: string;
  type: string;
  effect: string;
  rarity: number;
  event: string;
}