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
                    let name = $(this).find('.event_title').text();
                    concerts[name] = true;
                });



                resolve(concerts);
            }
        });
    });
};

module.exports = {
    getConcerts: getConcerts
};

getConcerts()
    .then((result) => {
        console.log(result);
    })
    .catch(err => console.log(err))
