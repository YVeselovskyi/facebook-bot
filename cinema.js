'use strict';

const request = require('request');
const cheerio = require('cheerio');

const url = 'https://www.goldmir.net/ru/kino/cinema-shows/257_smartcinema';

const getFilms = () => {

    return new Promise((resolve, reject) => {

        request(url, (error, response, body) => {
            if (error) {
                reject(error);
            } else {
                let $ = cheerio.load(body);

                let films = {};

                $('.kino_shows').each(function(i) {
                    films[`${$(this).find('.name').text()}`] = `${$(this).find('.shows').text()}`;
                });

                resolve(films);
            }
        });
    });
};

module.exports = {
    getFilms: getFilms
}

getFilms()
    .then((result) => {
        console.log(result);
    })
    .catch(err => console.log(err));
