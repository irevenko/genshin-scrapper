import axios from 'axios';

export const INGREDIENTS_URL =
  'https://genshin-impact.fandom.com/wiki/Category:Cooking_Ingredient';

export const POTIONS_URL =
  'https://genshin-impact.fandom.com/wiki/Potions';

export const BASE_URL = 'https://genshin-impact.fandom.com/wiki/';


export const fetchPage = async (url: string) => {
  try {
    const result = await axios.get(url);
    return result.data;
  } catch (err) {
    return err;
  }
};