import request from 'request';
import cheerio from 'cheerio';
import denodeify from 'denodeify';
import { writeFileSync, existsSync, mkdirSync } from 'fs';

const requestPromise = denodeify(request);
const trim = s => s.trim()

export function infoParser(infoType, text, html) {
    switch(infoType) {
        case 'Продолжительность':
            return { key: 'time', data: +/(\d+)/.exec(text)[1] };
        case 'Жанр':
            return { key: 'genre', data: text.slice(infoType.length + 1, -1).trim().split(',').map(trim) };
        case 'Страна':
            return { key: 'country', data: text.slice(infoType.length + 1, -1).trim().split(',').map(trim) };
        case 'Год':
            return { key: 'year', data: +/(\d+)/.exec(text)[1] };
        case 'Режиссер': {
            let data = html.find('a').map((i,elem) => (elem.attribs.href)).toArray();
            data = data.filter(pers => pers.match(/\/star\/\d+/)).map(pers => /(\d+)/.exec(pers)[1]);
            return { key: 'directors', data, };
        }
        case 'Композитор': {
            let data = html.find('a').map((i,elem) => (elem.attribs.href)).toArray();
            data = data.filter(pers => pers.match(/\/star\/\d+/)).map(pers => /(\d+)/.exec(pers)[1]);
            return { key: 'composers', data, };
        }
        case 'В ролях': {
            let data = html.find('a').map((i,elem) => (elem.attribs.href)).toArray();
            data = data.filter(pers => pers.match(/\/star\/\d+/)).map(pers => /(\d+)/.exec(pers)[1]);
            return { key: 'actors', data, };
        }
    }
    return false;
}

export default function movieParser(type, id) {
    return requestPromise(`https://my-hit.org/${type}/${id}/`)
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

            const year = /(.+)\((\d+)\)/.exec($('.fullstory h1').first().text());
            return ({
                movieId: id,
                type,
                name: /(.+)\(.+\)/.exec($('.fullstory h1').first().text())[1],
                year: year && year[2],
                nameOriginal: $('.fullstory h4').first().text().trim(),
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