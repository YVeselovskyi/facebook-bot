'use strict';

const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const bodyParser = require('body-parser');
const request = require('request');
const cinema = require('./cinema');
const concerts = require('./concerts');
const news = require('./news');

const pageToken = process.env.fbToken;

app.use(bodyParser.json())

app.get('/', (req, res) => {
    res.send('Main!');
});


// Checking if token matches with fb token
app.get('/webhook', (req, res) => {
    if (req.query['hub.verify_token'] === 'DynamoKyiv') {
        res.send(req.query['hub.challenge']);
    } else {
        res.send('Invalid verify token');
    }
});

//Object with methods which are executing functions from another modules

const fbMessage = {
    getAllFilms(recipientId) {
        cinema.getFilms()
            .then((result) => {
                for (let n in result) {
                    sendMessage(recipientId, {
                        text: `${n}: ${result[n]}`
                    });
                }
            })
            .catch(err => console.log(err))
    },
    getAllConcerts(recipientId) {
        concerts.getConcerts()
            .then((result) => {
                for (let n in result) {
                    sendMessage(recipientId, {
                        text: `${n} \n ${result[n]}`
                    });
                }
            })
            .catch(err => console.log(err))
    },
    getRandomNewsItem(recipientId) {
        news.getNews()
            .then((result) => {
                sendNews(recipientId, result);
            })
            .catch(err => console.log(err))
    }
};

// Handler receiving messages
app.post('/webhook', (req, res) => {
    let events = req.body.entry[0].messaging;
    for (let i = 0; i < events.length; i++) {
        let event = events[i];
        if (!event.postback.payload) {
            sendMessage(event.sender.id, {
                text: "Добрый день! Список команд есть в меню слева :)"
            });
        } else if (event.postback.payload == 'news') {
            fbMessage.getRandomNewsItem(event.sender.id);
        } else if (event.postback.payload == 'cinema') {
            fbMessage.getAllFilms(event.sender.id);
        } else if (event.postback.payload == 'theatre') {
            sendTheatreImage(event.sender.id);
        } else if (event.postback.payload == 'concerts') {
            fbMessage.getAllConcerts(event.sender.id);
        };
    }
    res.sendStatus(200);
});


// Function to send simple text message
const sendMessage = (recipientId, message) => {
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {
            access_token: pageToken
        },
        method: 'POST',
        json: {
            recipient: {
                id: recipientId
            },
            message: message,
        }
    }, (error, response, body) => {
        if (error) {
            console.log('Error sending message: ', error);
        } else if (response.body.error) {
            console.log('Error: ', response.body.error);
        }
    });
};

//Function to send image message 
const sendTheatreImage = (recipientId, message) => {
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {
            access_token: pageToken
        },
        method: 'POST',
        json: {
            recipient: {
                id: recipientId
            },
            message: {
                attachment: {
                    type: 'image',
                    payload: {
                        // Image with theatre schedule for current month
                        url: 'https://pp.vk.me/c637922/v637922167/13940/EKWTqUcJusc.jpg'
                    }
                }
            }
        }
    }, (error, response, body) => {
        if (error) {
            console.log('Error sending message: ', error);
        } else if (response.body.error) {
            console.log('Error: ', response.body.error);
        }
    });
};


const sendNews = (recipientId, newsArray) => {
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {
            access_token: pageToken
        },
        method: 'POST',
        json: {
            recipient: {
                id: recipientId
            },
            message: {
                attachment: {
                    type: 'template',
                    payload: {
                        template_type: 'generic',
                        elements: [{
                            title: newsArray[0].title,
                            item_url: 'https://petersfancybrownhats.com',
                            image_url: 'https://petersfancybrownhats.com/company_image.png',
                            subtitle: 'We\'ve got the right hat for everyone.',
                            buttons: [{
                                type: 'web_url',
                                url: 'https://vk.com',
                                title: 'Прочитать новость'
                            }]
                        }]
                    }
                }
            }
        }
    }, (error, response, body) => {
        if (error) {
            console.log('Error sending message: ', error);
        } else if (response.body.error) {
            console.log('Error: ', response.body.error);
        }
    });
}

app.listen(port, () => {
    console.log('Listening on port ' + port);
});
