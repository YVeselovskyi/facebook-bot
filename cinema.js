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

                    let time = $(this).find('.shows .new').text();
                    let name = $(this).find('.name').text();
                    let timeFilter = (str) => {
                        if(str){
                          return str.replace( /3D/g, '' ).replace( /2D/g, '' ).match(/.{1,5}/g).toString();
                        } else {
                          return 'Сегодня сеансов больше нет :('
                        }
                    };
                    films[name] = timeFilter(time);
                });

                resolve(films);
            }
        });
    });
};

module.exports = {
    getFilms: getFilms
};
