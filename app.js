require('dotenv-extended').load();
import { init as initDb, Movie, Person, sequelize } from 'lib/db';

var builder = require('botbuilder');
var restify = require('restify');
var init = require('./index')


// Setup Restify Server
var server = restify.createServer();
initDb().then(() => {
    server.listen(process.env.port || process.env.PORT || 3978, function () {
        console.log('%s listening to %s', server.name, server.url);
    });
});
// Create chat bot
var connector = new builder.ChatConnector({
    appId: 'cfa0c416-69a2-40b6-ad60-0cfc0b7a0efc',
    appPassword: 'x4Cmyn9xe46M9n1nAqCCiYJ'
});
var bot = new builder.UniversalBot(connector);
server.post('/api/messages', connector.listen());

// You can provide your own model by specifing the 'LUIS_MODEL_URL' environment variable
// This Url can be obtained by uploading or creating your model from the LUIS portal: https://www.luis.ai/
const LuisModelUrl = 'https://westus.api.cognitive.microsoft.com/luis/v2.0/apps/2631b69b-e9c4-4e8b-968b-4bd024d027b2?subscription-key=94530cf99d65419ea0c237995c142572';

// bot.dialog('/', function (session) {
//     session.send("Hello World");
// });
let dataMovies;
// Main dialog with LUIS
var recognizer = new builder.LuisRecognizer(LuisModelUrl);
bot.dialog('/', new builder.IntentDialog({ recognizers: [recognizer] })
    .matches('greeting', function(session, args, next) {
        session.sendTyping()
        if(args.score>0.95) {
            console.log('probability -> ',args.score);
            session.send('Hi nigger')
        }
        else {
            console.log('probability -> ', args.score );
            session.send('Sorry, I did not understand');
        }
        })
    .matches('getfilm',[
        function(session, args, next) {
        session.sendTyping(); 
        console.log(args.entities);
        const entities = args.entities;
        let where = {};

        
        let filmType = {

        };
        let year = {
        };

        let genre = {

        };

        entities.forEach(entity => {
            if (entity.type === 'film_type') {
                if (entity.entity === 'serial' || entity.entity === 'serials') {
                    filmType.type = 'serial';
                } else if (entity.entity === 'movie' || entity.entity === 'movies') {
                    filmType.type = 'film';
                }
            }
            if (entity.type === 'genre') {
                if (entity.entity === 'horror' || entity.entity === 'horrific') {
                    genre.genre = { $contains: ['Ужасы'] }
                } else if (entity.entity === 'comedy') {
                     genre.genre = { $contains: ['Комедия'] };
                }
            }
            if (entity.type === 'builtin.datetime.date' && entity.resolution.date.length === 4) {
                if (!year.year) {
                    year.year = {};
                }
                switch (entity.resolution.mod) {
                    case 'After':
                        year.year.$gt = entity.resolution.date;
                        break;
                    case 'Before':
                        year.year.$lt = entity.resolution.date;
                        break;
                    default:
                        year.year = entity.resolution.date;
                        break;
                }
            }
        });



        session.send('Let me search some films');
        session.sendTyping();

        console.log({
            ...filmType,
            ...year,
        })

        Movie.findAll({
            where: {
                ...filmType,
                ...year,
                ...genre,
            },
            limit: 500,
            order: [['likes', 'DESC']]
        })
        .then(movies => {
            dataMovies = movies;
            let random = Math.round(Math.random() * 10 * 454)

            if (!movies.length) {
                session.endDialog('Sorry! I didn\'t find any film');
                return;
            }
            let randMovies = movies.sort((a, b) => Math.random() - 0.5).slice(0, 10);
             var msg = new builder.Message(session)
            .textFormat(builder.TextFormat.xml)
            .attachmentLayout('carousel')
            .attachments(
                randMovies.map(movie => new builder.HeroCard(session)
                                        .title(movie.nameOriginal || movie.name)
                                        .subtitle(`${movie.year}`)
                                        .text(`${movie.type} ${movie.time ? movie.time + ' mins' : ''} ${movie.genre.join(', ')}`)
                                        .images([
                                            builder.CardImage.create(session, movie.image)])
                                        .tap(builder.CardAction.openUrl(session, `https://my-hit.org/${movie.type}/${movie.movieId}/`))
                                        )
                );
        session.send('Here is a list of films !')
        session.send(msg);
        builder.Prompts.choice(session, "Want more?", "Yes|No Thanks");
    })
    }, function(session, results, next) {
        console.log(results);
        session.sendTyping();
        if (results.response) {
            if (results.response.entity === 'Yes') {
                let randMovies = dataMovies.sort((a, b) => Math.random() - 0.5).slice(0, 10);
                 var msg = new builder.Message(session)
                .textFormat(builder.TextFormat.xml)
                .attachmentLayout('carousel')
                .attachments(
                    randMovies.map(movie => new builder.HeroCard(session)
                                            .title(movie.nameOriginal || movie.name)
                                            .text(`${movie.type} ${movie.time ? movie.time + ' mins' : ''} ${movie.genre.join(', ')}`)
                                            .images([
                                                builder.CardImage.create(session, movie.image)])
                                            .tap(builder.CardAction.openUrl(session, `https://my-hit.org/${movie.type}/${movie.movieId}/`))
                                            )
                    );
                session.send('Here is another list of films !')
                session.send(msg);
            } else {
                session.send('Ok, Thanks')
                session.endDialog('Bye! ;)');
            }
        }
    }])
    .matches('getperson', [
        function(session, args, next) {
            const entities = args.entities;
            session.sendTyping();
            session.send('Let me search some actors');

              let year = {
                };

                entities.forEach(entity => {
                    if (entity.type === 'builtin.datetime.date') {
                        if (!year.year) {
                            year.year = {};
                        }
                        switch (entity.resolution.mod) {
                            case 'After':
                                year.year.$gt = new Date(entity.resolution.date);
                                break;
                            case 'Before':
                                year.year.$lt = new Date(entity.resolution.date);
                                break;
                            default:
                                year.year = new Date(entity.resolution.date);
                                break;
                        }
                    }
                });
                Person.findAll({
                    ...year,
                    order: [sequelize.fn('random')],
                    limit: 8,
                })
                .then(persons => {
                 var msg = new builder.Message(session)
                .textFormat(builder.TextFormat.xml)
                .attachmentLayout('carousel')
                .attachments(
                    persons.map(person => new builder.HeroCard(session)
                                            .title(person.nameEnglish || person.name)
                                            .images([
                                                builder.CardImage.create(session, person.image)])
                                            .tap(builder.CardAction.openUrl(session, `https://my-hit.org/star/${person.personId}/`))
                                            )
                    );
                session.send('Here is list of actors!')
                session.send(msg);
                })

        }
    ])

    .onDefault((session) => {
        session.send('Sorry, I did not understand \'%s\'', session.message.text);
    }));