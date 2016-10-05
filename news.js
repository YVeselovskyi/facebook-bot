'use strict';

const request = require('request');
const cheerio = require('cheerio');

const url = 'http://www.dialog.ua/tag/55/';

//Function to get info about concerts from given url

const getNews = () => {

    return new Promise((resolve, reject) => {

        request(url, (error, response, body) => {
            if (error) {
                reject(error);
            } else {
                let $ = cheerio.load(body);

                let news = [];
                $('.block-news-news').each(function(i) {
                    let newsItem = {};
                    let mainTitle = $(this).find('.block-news-news-title').text();
                    let subTitle = 'Перейдите, чтобы увидеть полную новость'
                    let imageUrl = $(this).find('.block-news-news-img img').attr('src');
                    let siteUrl = `http://www.dialog.ua${$(this).find('.block-news-news-title').attr('href')}`;
                    newsItem['title'] = mainTitle;
                    newsItem['subtitle'] = subTitle;
                    newsItem['url'] = siteUrl;
                    newsItem['image'] = imageUrl;
                    news.push(newsItem);
                });

                resolve(news);
            }
        });
    });
};

module.exports = {
    getNews: getNews
};
