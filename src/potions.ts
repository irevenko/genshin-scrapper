import cheerio from 'cheerio';
import { fetchPage, POTIONS_URL } from './utils';

const getPotions = async () => {
  try {
    const html = await fetchPage(POTIONS_URL);
    const $ = cheerio.load(html);

    $('.article-table > tbody > tr').each(async (index, element) => {
      const name = $(element).find('td > a').attr('title');

      console.log(name)
    });

    $('.article-table > tbody > tr > td').each(async (index, element) => {
      const effect = $(element).text();

      console.log(effect.trim())
    });
  } catch (error) {
    throw error;
  }
};

(async () => {
  getPotions();
})();