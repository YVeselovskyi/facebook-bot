const request = require('request');
const cheerio = require('cheerio');

const url = 'http://kinoafisha.ua/cinema/vinnica/smartcinema';

const getFilms = () => {

    return new Promise((resolve, reject) => {

        request(url, (error, response, body) => {
            if (error) {
                reject(error);
            } else {
                var $ = cheerio.load(body);

                var films = [];

                $('.cinema-room a b').each(function(index) {
                    films.push($(this).text());
                });

                resolve(films);
            }
        });
    });
};

module.exports = {
    getFilms: getFilms
}
