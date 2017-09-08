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

//Random int function

function randomInteger(min, max) {
    let rand = min + Math.random() * (max - min)
    rand = Math.round(rand);
    return rand;
}


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
                    sendTextMessage(recipientId, `${n} \n ${result[n]}`);
                }
            })
            .catch(err => console.log(err))
    },
    getAllConcerts(recipientId) {
        concerts.getConcerts()
            .then((result) => {
                for (let n in result) {
                    sendTextMessage(recipientId, `${n} \n ${result[n]}`);
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


app.post('/webhook/', function(req, res) {
    console.log(req.body, 'POST BODY');
    let messaging_events = req.body.entry[0].messaging
    for (let i = 0; i < messaging_events.length; i++) {
        let event = req.body.entry[0].messaging[i]
        let sender = event.sender.id
        if (event.message && event.message.text) {
            let text = event.message.text
            sendTextMessage(sender, 'Добрый день! Список доступных команд есть в меню :)');
        }
        if (event.postback) {
            let payload = event.postback.payload;
            generateInfo(sender, payload)
            //continue
        }
    }
    res.sendStatus(200)
})

function generateInfo(senderId, payloadType) {
    if (payloadType == 'news') {
        fbMessage.getRandomNewsItem(senderId);
    } else if (payloadType == 'cinema') {
        fbMessage.getAllFilms(senderId);
    } else if (payloadType == 'theatre') {
        sendTheatreImage(senderId);
    } else if (payloadType == 'concerts') {
        fbMessage.getAllConcerts(senderId);
    };
};


// Function to send simple text message
function sendTextMessage(sender, text) {
    let messageData = { text: text }
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: { access_token: pageToken },
        method: 'POST',
        json: {
            recipient: { id: sender },
            message: messageData,
        }
    }, function(error, response, body) {
        if (error) {
            console.log('Error sending messages: ', error)
        } else if (response.body.error) {
            console.log('Error: ', response.body.error)
        }
    })
}

//Function to send image message
function sendTheatreImage(recipientId, message) {
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
                        url: 'https://pp.userapi.com/c638718/v638718167/26884/SF37xbWKErE.jpg'
                    }
                }
            }
        }
    }, function(error, response, body) {
        if (error) {
            console.log('Error sending message: ', error);
        } else if (response.body.error) {
            console.log('Error: ', response.body.error);
        }
    });
};


function sendNews(recipientId, newsArray) {
    let randomNumber = randomInteger(0, newsArray.length - 1);
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
                                title: newsArray[randomNumber].title,
                                item_url: newsArray[randomNumber].url,
                                image_url: newsArray[randomNumber].image,
                                subtitle: newsArray[randomNumber].subtitle,
                                buttons: [{
                                    type: 'web_url',
                                    url: newsArray[randomNumber].url,
                                    title: 'Прочитать новость'
                                }]
                            }]
                        }
                    }
                }
            }
        }, function(error, response, body) {
            if (error) {
                console.log('Error sending message: ', error);
            } else if (response.body.error) {
                console.log('Error: ', response.body.error);
            }
        });
}

app.listen(port, function() {
    console.log('Listening on port ' + port);
});
