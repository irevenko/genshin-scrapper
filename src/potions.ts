import cheerio from 'cheerio';
import { fetchPage, POTIONS_URL, BASE_URL, exportResults } from './utils';
import { IPotion } from './types';

const getPotions = async () => {
  try {
    const html = await fetchPage(POTIONS_URL);
    const $ = cheerio.load(html);

    const potions: IPotion = {};

    $('.article-table > tbody > tr').each(async (index, element) => {
       const tds = $(element).find('td');       
       const name = $(tds[1]).find('a').attr('title');
       const rarity = $(tds[2]).find('img').attr('alt');        
       const effect = $(tds[4]).text();
       
       if (name !== undefined) { 
        potions[name.toLowerCase().replace(/ /g, '-')] = {
          name: name.trim(),
          effect: effect,
          rarity: parseInt(rarity!.charAt(0), 10),
        };
       }
    });

    return potions;
  } catch (error) {
    throw error;
  }
};

const getPotionNames = async () => {
  try {
    const html = await fetchPage(POTIONS_URL);
    const $ = cheerio.load(html);

    const names: Array<string> = [];

    $('.article-table > tbody > tr').each(async (index, element) => {
       const tds = $(element).find('td');       
       const name = $(tds[1]).find('a').attr('title');
       
       if (name !== undefined) { 
          names.push(name.trim())
        };
    });

    return names;
  } catch (error) {
    throw error;
  }
};

const getPotionsCraft = async (names: Array<string>) => {
  for (const name of names) {
    try {
      const html = await fetchPage(BASE_URL+name);
      const $ = cheerio.load(html);
    
      $('.genshin_recipe.hidden').each(async (index, element) => {
         const divs = $(element).next().find('.mobileHide');       

         const item = $(divs[0]).find('a').attr('title');
         const itemCount = $(divs[0]).text().split(' ');

         const item2 = $(divs[1]).find('a').attr('title');
         const itemCount2 = $(divs[1]).text().split(' ');

         const mora = $(divs[2]).find('a').attr('title');
         const moraCount = $(divs[2]).text().split(' ');
         

         if (item !== undefined) { 
           console.log(item + " " + itemCount[1]);
           console.log(item2 + " " + itemCount2[1]);
           console.log(mora + " " + moraCount[1]);
           console.log('--------------------------')
         }
      });
  
    } catch (error) {
      throw error;
    }
  }
};

(async () => {
  const names = await getPotionNames();
  const potions = await getPotionsCraft(names);
})();