import cheerio from 'cheerio';
import { fetchPage, FOOD_URL, BASE_URL, exportResults, downloadImage } from './utils';
import { IPotion, IPotionCraft, IFood, ISpecialDishes, IEventDishes } from './types';
import webp from 'webp-converter';
import fs from 'fs';

const getFood = async () => {
  try {
    const html = await fetchPage(FOOD_URL);
    const $ = cheerio.load(html);

    const classes = ['food', 'special-dishes', 'event-dishes'];
    let counter = 0;

    const food: IFood = {};
    const specialDishes: ISpecialDishes = {};
    const eventDishes: IEventDishes = {};

    $('.article-table').each(async (index, element) => {
      $(element).addClass(classes[counter])
      counter += 1;
   });

    $('.food > tbody > tr').each(async (index, element) => {
       const tds = $(element).find('td');       

       const name = $(tds[1]).find('a').attr('title');
       const rarity = $(tds[2]).find('img').attr('alt');        
       const type = $(tds[3]).text();
       const effect = $(tds[4]).text();
       const hasRecipe = $(tds[5]).text();
       
       if (name !== undefined) {
        food[name.toLowerCase().replace(/ /g, '-')] = {
          name: name.trim(),
          rarity: parseInt(rarity!.charAt(0), 10),
          type: type.trim(),
          effect: effect,
        };

        if (hasRecipe.trim() === 'Yes') { 
          food[name.toLowerCase().replace(/ /g, '-')].hasRecipe = true
        } else if (hasRecipe.trim() === 'No') { 
          food[name.toLowerCase().replace(/ /g, '-')].hasRecipe = false
        }
       }
    });

    $('.special-dishes > tbody > tr').each(async (index, element) => {
      const tds = $(element).find('td');       

      const name = $(tds[1]).find('a').attr('title');
      const rarity = $(tds[2]).find('img').attr('alt');        
      const type = $(tds[3]).text();
      const effect = $(tds[4]).text();
      const character = $(tds[5]).text();
      
      if (name !== undefined) {
       specialDishes[name.toLowerCase().replace(/ /g, '-')] = {
         name: name.trim(),
         rarity: parseInt(rarity!.charAt(0), 10),
         type: type.trim(),
         effect: effect.trim(),
         character: character.trim()
       };
      }
   });

   $('.event-dishes > tbody > tr').each(async (index, element) => {
    const tds = $(element).find('td');       

    const name = $(tds[1]).find('a').attr('title');
    const rarity = $(tds[2]).find('img').attr('alt');        
    const type = $(tds[3]).text();
    const effect = $(tds[4]).text();
    const event = $(tds[5]).text();
    
    if (name !== undefined) {
     eventDishes[name.toLowerCase().replace(/ /g, '-')] = {
       name: name.trim(),
       rarity: parseInt(rarity!.charAt(0), 10),
       type: type.trim(),
       effect: effect.trim(),
       event: event.trim()
     };
    }
   });
    console.log('Fetched food data');
    return [food, specialDishes, eventDishes];
  } catch (error) {
    throw error;
  }
};

const getFoodCraft = async (potions: IPotion) => {
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

const getFoodImages = async (potions: IPotion) => {
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

const downloadFoodImages = (links: Array<string>, potions: IPotion) => {
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
  const food = await getFood();
  console.log(food[0])
  // const images = await getFoodImages(food);
  // const allPotions = await getFoodCraft(food);


  // downloadFoodImages(images, food);
  // convertToWebp(food);
  // renameImages(food);
  // exportResults(allPotions, "./data/food.json")
})();