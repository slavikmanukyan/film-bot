import { init as initDb, Movie, Person, MovieStar } from 'lib/db';
import MovieParser, { saveFilm } from './movieParser';
import PersonParser from './personParser';
import co from 'co';

const clearLine = () => process.stdout.write(' '.repeat(80) + '\r');
const parsers = {
    movie() {
        const parse = co.wrap(function* (type) {
            let lastMovie = yield Movie.find({ where: { type, }, attributes: ['movieId'], order: [['movieId', 'DESC']] });
            let index = lastMovie ? lastMovie.movieId + 1 : 1;
            let lastError = 0;
            while(true) {
                clearLine();
                process.stdout.write(`parsing movie ${index}\r`);
                try {
                    const filmData = yield MovieParser(type, index);
                    lastError = 0;
                    const { directors = [], actors = [], composers = [], ...film } = filmData;
                    let movieStars = [];
                    movieStars = movieStars.concat(directors.filter((v,i,a)=>a.indexOf(v)==i).map(director => ({
                        personId: +director,
                        movieId: index,
                        movieType: type,
                        role: 'director',
                    })));
                    movieStars = movieStars.concat(composers.filter((v,i,a)=>a.indexOf(v)==i).map(composer => ({
                        personId: +composer,
                        movieId: index,
                        movieType: type,
                        role: 'composer',
                    })));
                    movieStars = movieStars.concat(actors.filter((v,i,a)=>a.indexOf(v)==i).map((actor, i) => ({
                        personId: +actor,
                        movieId: index,
                        movieType: type,
                        role: 'actor',
                        rolePriority: actors.length > 5 ? (i < 5 ? 5 - i : 1) : 5,
                    })));

                    film && film.name && Movie.create(film);
                    movieStars.length && MovieStar.bulkCreate(movieStars);

                    clearLine();
                    process.stdout.write(`parsed movie ${film.name}\r`);
                } catch(error) {
                    lastError++;
                    console.log(index, error)
                }
                index++;
                if (lastError === 10 || index > 480000) break;
            }
        });
    parse('film').then(() => console.log('done-film')).catch(console.log);
    parse('serial').then(() => console.log('done-serial'));
    },
    person() {
        const parse = co.wrap(function* (type) {
            let index =  1;
            let lastError = 0;
            while(true) {
                clearLine();
                process.stdout.write(`parsing person ${index}\r`);
                try {
                    const personData = yield PersonParser(index);
                    lastError = 0;
                    Person.create(personData);
                    
                } catch(error) {
                    lastError++;
                    console.log(index, error)
                }
                index++;
                if (lastError === 10) break;
            }
        });
        parse();
    }
}

initDb()
.then(() => {
    parsers[process.env['PARSE_TYPE'] || 'person']();
});