'use strict';

const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const bodyParser = require('body-parser');
const request = require('request');
const cinema = require('./cinema');
const concerts = require('./concerts');

const pageToken = 'EAAMy7RcgMngBAKuBeZBkeRocU4TbaBytzYU2Tx9xexoDQDfmR1XEdEayBPJXkrNZCIDOQ5Cmv4ctClNzrWNjSbmTHzBY4q6ZAbIed6kh61oaKKUT9v10LA8QBr5taJZAdh6tX6qPNfLV6i4YES1MVYR4TapcxOdNd9adrV2aHAZDZD';

app.use(bodyParser.json())

app.get('/', (req, res) => {
    res.send('Main!');
});

app.get('/webhook', (req, res) => {
    if (req.query['hub.verify_token'] === 'DynamoKyiv') {
        res.send(req.query['hub.challenge']);
    } else {
        res.send('Invalid verify token');
    }
});


let fbMessage = {
    allFilms(recipientId) {
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
    allConcerts(recipientId) {
        concerts.getConcerts()
            .then((result) => {
                for (let n in result) {
                    sendMessage(recipientId, {
                        text: `${n} \n ${result[n]}`
                    });
                }
            })
            .catch(err => console.log(err))
    }
};

// handler receiving messages
app.post('/webhook', (req, res) => {
    let events = req.body.entry[0].messaging;
    for (let i = 0; i < events.length; i++) {
        let event = events[i];
        if (event.message && event.message.text) {
            if (event.sender.id && event.message.text) {
                sendMessage(event.sender.id, {
                    text: "Добрый день! Список команд есть в меню слева :)"
                });
            }
        } else if (event.postback) {
            sendInfo(event.sender.id, event.postback.payload);
        }
    }
    res.sendStatus(200);
});

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

let sendInfo = (recipientId, postback) => {
    if (postback == 'cinema') {
        fbMessage.allFilms(recipientId);
    } else if (postback == 'theatre') {
        sendTheatreImage(recipientId);
    } else if (postback == 'concerts') {
        fbMessage.allConcerts(recipientId);
    }
};

app.listen(port, () => {
    console.log('Listening on port ' + port);
});
