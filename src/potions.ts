import cheerio from 'cheerio';
import { fetchPage, POTIONS_URL, BASE_URL, exportResults } from './utils';
import { IPotion, IPotionCraft } from './types';

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
    console.log('Fetched potions data');
    return potions;
  } catch (error) {
    throw error;
  }
};

const getPotionsCraft = async (potions: IPotion) => {
  for (let potion in potions) {
    try {
      const html = await fetchPage(BASE_URL+potions[potion].name);
      const $ = cheerio.load(html);

      const crafts: Array<IPotionCraft> = [];

      $('.genshin_recipe.hidden').each(async (index, element) => {
         const divs = $(element).next().find('.mobileHide');

         const item = $(divs[0]).find('a').attr('title');
         const itemCount = $(divs[0]).text().split(' ');

         const item2 = $(divs[1]).find('a').attr('title');
         const itemCount2 = $(divs[1]).text().split(' ');

         const mora = $(divs[2]).find('a').attr('title');
         const moraCount = $(divs[2]).text().split(' ');

         if (item !== undefined) {
           crafts.push({item: item, quantity: parseInt(itemCount[1], 10)})
           crafts.push({item: item2, quantity: parseInt(itemCount2[1], 10)})
           crafts.push({item: mora, quantity: parseInt(moraCount[1], 10)})
          }

          potions[potion].crafring = crafts;
      });
    } catch (error) {
      throw error;
    }
  }
  console.log('Fetched potion crafts');
  return potions;
};

(async () => {
  const potions = await getPotions();
  const allPotions = await getPotionsCraft(potions);

  await exportResults(allPotions, "./data/potions.json")
})();