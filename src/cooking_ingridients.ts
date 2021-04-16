import fs from 'fs';
import cheerio from 'cheerio';
import request from 'request';
import webp from 'webp-converter';
import { IIngredient } from './types';
import { BASE_URL, INGREDIENTS_URL, fetchPage } from './utils';

const getIngredientsNames = async () => {
  try {
    const html = await fetchPage(INGREDIENTS_URL);
    const $ = cheerio.load(html);

    let names: Array<string> = [];

    $('.category-page__member').each(async (index, element) => {
      const name = $(element).find('.category-page__member-link').text();
      names.push(name);
    });

    const filteredNames = names.filter(function (value, index, arr) {
      return value !== 'Category:Processing';
    });

    console.log('Fetched ingredients names');
    return filteredNames;
  } catch (error) {
    throw error;
  }
};

const getIngredientsInfo = async (names: Array<string>) => {
  let info: IIngredient = {};

  for (const element of names) {
    try {
      const html = await fetchPage(BASE_URL + element);
      const $ = cheerio.load(html);

      $('div[data-source="description"]').each((i, el) => {
        let prevText = $(el).prev().text();

        const description = $(el).find('.pi-data-value.pi-font').text();

        const sources: Array<string> = [];
        const sourcesLen: number = $(el)
          .next()
          .find('.pi-item.pi-data.pi-item-spacing.pi-border-color').length;

        for (let i = 1; i <= sourcesLen; i += 1) {
          const src = $(el)
            .next()
            .find(`div[data-source="source${i.toString()}"] > div`)
            .text();
          sources.push(src);
        }

        if (prevText.includes('Rarity')) {
          const rarity = $(el).prev().find('img').attr('alt');
          info[element.toLowerCase()] = {
            name: element,
            description: description,
            rarity: parseInt(rarity!.charAt(0), 10),
            sources: sources,
          };
        } else {
          info[element.toLowerCase()] = {
            name: element,
            description: description,
            sources: sources,
          };
        }
      });
    } catch (error) {
      throw error;
    }
  }
  console.log('Fetched ingredients info');
  return info;
};

const getIngredientsImages = async (names: Array<string>) => {
  const images: Array<string> = [];

  for (const element of names) {
    try {
      const html = await fetchPage(BASE_URL + element);
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

const downloadImage = (url, path, callback) => {
  request.head(url, (err, res, body) => {
    request(url).pipe(fs.createWriteStream(path)).on('close', callback);
  });
};

const downloadAll = (links: Array<string>, names: Array<string>) => {
  for (let i = 0; i < links.length; i += 1) {
    downloadImage(
      links[i],
      `./images/cooking_ingredients/${names[i]}.png`,
      () => {
        console.log(`downloaded ${links[i]}`);
      }
    );
  }
};

const convertToWebp = (names: Array<string>) => {
  webp.grant_permission();

  for (const name of names) {
    webp.cwebp(
      './images/cooking_ingredients/' + name + '.png',
      './images/cooking_ingredients/webp/' + name + '.webp',
      '-q 80'
    );
  }
  console.log('Converted ingredients images');
};

const renameImages = (names: Array<string>) => {
  for (let name of names) {
    const newName = name.replace(/ /g, '-');

    fs.renameSync(
      './images/cooking_ingredients/webp/' + name + '.webp',
      './images/cooking_ingredients/webp/' + newName.toLowerCase()
    );
  }
  console.log('Renamed ingredients images');
};

const exportResults = (results: IIngredient, outputFile: string) => {
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

if (!fs.existsSync('./data')) {
  fs.mkdirSync('./data');
  console.log('Directory is created.');
} else {
  console.log('Directory already exists.');
}

if (!fs.existsSync('./images/cooking_ingredients/webp')) {
  fs.mkdirSync('./images/cooking_ingredients/webp', { recursive: true });
  console.log('Directory is created.');
} else {
  console.log('Directory already exists.');
}

(async () => {
  const names = await getIngredientsNames();
  const images = await getIngredientsImages(names);
  const ingredients = await getIngredientsInfo(names);

  downloadAll(images, names);
  convertToWebp(names);
  renameImages(names);
  exportResults(ingredients, './data/cooking-ingredients.json');
})();
