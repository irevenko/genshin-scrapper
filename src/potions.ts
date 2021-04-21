import cheerio from 'cheerio';
import { fetchPage, POTIONS_URL, BASE_URL, exportResults, downloadImage } from './utils';
import { IPotion, IPotionCraft } from './types';
import webp from 'webp-converter';
import fs from 'fs';

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

          potions[potion].crafting = crafts;
      });
    } catch (error) {
      throw error;
    }
  }
  console.log('Fetched potion crafts');
  return potions;
};

const getPotionsImages = async (potions: IPotion) => {
  const images: Array<string> = [];

  for (const potion in potions) {
    try {
      const html = await fetchPage(BASE_URL + potions[potion].name);
      const $ = cheerio.load(html);

      $('.portable-infobox').each((i, el) => {
        const image = $(el)
          .find('.pi-image-collection > div > figure > a')
          .attr('href');
        if (image === undefined) {
          const newImage = $(el).find('figure > a').attr('href');
          images.push(newImage);
        } else {
          images.push(image);
        }
      });
    } catch (error) {
      throw error;
    }
  }
  console.log('Downloaded ingredients images');
  return images;
};

const downloadPotionsImages = (links: Array<string>, potions: IPotion) => {
  let linkCounter = 0;

  for (const potion in potions) {
    downloadImage(
      links[linkCounter],
      `./images/potions/${potions[potion].name}.png`,
      () => {
        console.log(`downloaded ${links[linkCounter]}`);
      }
    );
    linkCounter += 1;
  }
};

const convertToWebp = (potions: IPotion) => {
  webp.grant_permission();

  for (const potion in potions) {
    webp.cwebp(
      './images/potions/' + potions[potion].name + '.png',
      './images/potions/webp/' + potions[potion].name + '.webp',
      '-q 80'
    );
  }
  console.log('Converted potions images');
};

const renameImages = (potions: IPotion) => {
  for (let potion in potions) {
    const newName = potions[potion].name.replace(/ /g, '-');

    fs.renameSync(
      './images/potions/webp/' + potions[potion].name + '.webp',
      './images/potions/webp/' + newName.toLowerCase()
    );
  }
  console.log('Renamed potions images');
};

(async () => {
  const potions = await getPotions();
  const images = await getPotionsImages(potions);
  const allPotions = await getPotionsCraft(potions);


  downloadPotionsImages(images, potions);
  convertToWebp(potions);
  renameImages(potions);
  exportResults(allPotions, "./data/potions.json")
})();