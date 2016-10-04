'use strict';

const request = require('request');
const cheerio = require('cheerio');

const url = 'https://vinnitsa.karabas.com/concerts/';

const getConcerts = () => {

    return new Promise((resolve, reject) => {

        request(url, (error, response, body) => {
            if (error) {
                reject(error);
            } else {
                let $ = cheerio.load(body);

                let concerts = {};

                $('.block-mini').each(function(i) {
                    let name = $(this).find('.event_title').text().trim();
                    let date = $(this).find('.box-date strong em').text();
                    let month = $(this).find('.box-date span').text();
                    let place = $(this).find('.block-time a').text();
                    concerts[name] = `${date} ${month} ${place}`;
                });

                resolve(concerts);
            }
        });
    });
};

module.exports = {
    getConcerts: getConcerts
};
