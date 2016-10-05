'use strict';

const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const bodyParser = require('body-parser');
const request = require('request');
const cinema = require('./cinema');
const concerts = require('./concerts');

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

// Handler receiving messages
app.post('/webhook', (req, res) => {
    let events = req.body.entry[0].messaging;
    for (let i = 0; i < events.length; i++) {
        let event = events[i];
        if (event.message && event.message.text) {
            //if user sends a text message
            if (event.sender.id && event.message.text) {
                sendNews(event.sender.id, {
                    text: "Добрый день! Список команд есть в меню слева :)"
                });
            }
            // if user sends postback
        } else if (event.postback) {
            sendInfo(event.sender.id, event.postback.payload);
        }
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


const sendNews = (recipientId, message) => {
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
                    type: template,
                    payload: {
                        template_type: 'generic',
                        elements: [{
                            title: 'Welcome to Peter\'s Hats',
                            item_url: 'https://petersfancybrownhats.com',
                            image_url: 'https://petersfancybrownhats.com/company_image.png',
                            subtitle: 'We\'ve got the right hat for everyone.',
                            buttons: [{
                                type: 'web_url',
                                url: 'https://vk.com',
                                title: 'View Website'
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


// Handler to detect what postback was received

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
