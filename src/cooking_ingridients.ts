import axios from "axios";
import cheerio from "cheerio";
import fs from "fs";

const INGREDIENTS_URL =
  "https://genshin-impact.fandom.com/wiki/Category:Cooking_Ingredient";
const BASE_URL = "https://genshin-impact.fandom.com/wiki/";
let a = 2;
interface IIngredientVals {
  name: string;
  description: string;
  rarity?: number;
  sources: Array<string>;
}

interface IIngredient {
  [key: string]: IIngredientVals;
}

const fetchPage = async (url: string) => {
  try {
    const result = await axios.get(url);
    return result.data;
  } catch (err) {
    return err;
  }
};

const allNames = async () => {
  try {
    const html = await fetchPage(INGREDIENTS_URL);
    const $ = cheerio.load(html);

    let names: Array<string> = [];

    $(".category-page__member").each(async (index, element) => {
      const name = $(element).find(".category-page__member-link").text();
      names.push(name);
    });

    return names;
  } catch (error) {
    throw error;
  }
};

const allInfo = async (names: Array<string>) => {
  let info: IIngredient = {};

  for (const element of names) {
    try {
      const html = await fetchPage(BASE_URL + element);
      const $ = cheerio.load(html);

      $('div[data-source="description"]').each((i, el) => {
        let prevText = $(el).prev().text();

        const description = $(el).find(".pi-data-value.pi-font").text();

        const sources: Array<string> = [];
        const sourcesLen: number = $(el)
          .next()
          .find(".pi-item.pi-data.pi-item-spacing.pi-border-color").length;

        for (let i = 1; i <= sourcesLen; i += 1) {
          const src = $(el)
            .next()
            .find(`div[data-source="source${i.toString()}"] > div`)
            .text();
          sources.push(src);
        }

        if (prevText.includes("Rarity")) {
          const rarity = $(el).prev().find("img").attr("alt");
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
  return info;
};

const exportResults = (results: IIngredient, outputFile: string) => {
  try {
    fs.writeFile(outputFile, JSON.stringify(results, null, 2), (err) => {
      if (err) {
        console.log(err);
      }
      console.log("Results exported successfully to " + outputFile);
    });
  } catch (error) {
    throw error;
  }
};

(async () => {
  const names = await allNames();
  const ingridients = await allInfo(names);
  exportResults(ingridients, "./data/cooking-ingridient.json");
})();
