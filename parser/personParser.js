import request from 'request';
import cheerio from 'cheerio';
import moment from 'moment';
import denodeify from 'denodeify';
import { writeFileSync, existsSync, mkdirSync } from 'fs';

const requestPromise = denodeify(request);
const trim = s => s.trim()

export function infoParser(infoType, text, html) {
    switch(infoType) {
        case 'Дата рождения':
            return { key: 'birthDay', data: moment(text.slice(infoType.length + 1).trim(), 'DD-MM-YYYY').isVaid ? moment(text.slice(infoType.length + 1).trim(), 'DD-MM-YYYY').toDate() : null };
        case 'Место рождения':
            return { key: 'nationality', data: text.slice(infoType.length + 1).trim() };
        case 'Рост':
            return { key: 'height', data: /(\d+)/.exec(text)[1] }
    }
    return false;
}

export default function movieParser(id) {
    return requestPromise(`https://my-hit.org/star/${id}/`)
        .then((response) => {
            const $ = cheerio.load(response.body);
            const info = {};
            if ($('.fullstory').text().match('запрашиваемая Вами страница недоступна')) {
                return false;
            }
            $('.fullstory ul.list-unstyled')
            .each((i, elem) => {
                $(elem).find('li')
                    .each((i, elem) => {
                        const element = $(elem);
                        const infoType = element.find('b').first().text().slice(0, -1);

                        const infoData = infoParser(infoType, element.text(), element);
                        if (infoData) {
                            info[infoData.key] = infoData.data;
                        }
                    });
            });
            return ({
                personId: id,
                name: $('.fullstory h1').first().text().trim(),
                nameEnglish: $('.fullstory h4').first().text().trim(),
                likes: +$('.btn-rating-up-sm b.plus').text(),
                dislikes: +$('.btn-rating-down-sm b.minus').text(),
                image: $('.fullstory img').length ? 'https://my-hit.org' + $('.fullstory img').attr('src') : null,
                ...info,
            });
        });
}

export function saveFilm(film) {
    if (!existsSync(`parser/cache/${film.year}`)) {
        mkdirSync(`parser/cache/${film.year}`);
    }
    writeFileSync(`parser/cache/${film.year}/${film.id}`, JSON.stringify(film));
}