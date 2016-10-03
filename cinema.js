'use strict';

const request = require('request');
const cheerio = require('cheerio');

const url = 'http://kinoafisha.ua/cinema/vinnica/smartcinema';

const getFilms = () => {

    return new Promise((resolve, reject) => {

        request(url, (error, response, body) => {
            if (error) {
                reject(error);
            } else {
                let $ = cheerio.load(body);

                let films = [];

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
