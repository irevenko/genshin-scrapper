import request from 'request';
import axios from 'axios';
import fs from 'fs';

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

export const exportResults = (results: any, outputFile: string) => {
  try {
    fs.writeFile(outputFile, JSON.stringify(results, null, 2), (err) => {
      if (err) {
        console.log(err);
      }
      console.log('Ingredients results exported successfully to ' + outputFile);
    });
  } catch (error) {
    throw error;
  }
};

export const downloadImage = (url, path, callback) => {
  request.head(url, (err, res, body) => {
    request(url).pipe(fs.createWriteStream(path)).on('close', callback);
  });
};
