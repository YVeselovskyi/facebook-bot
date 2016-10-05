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
// app.post('/webhook', (req, res) => {
//     let events = req.body.entry[0].messaging;
//     console.log(req.body.entry[0]);
//     for (let i = 0; i < events.length; i++) {
//         let event = events[i];
//         if (event.message && event.message.text) {
//             //if user sends a text message
//             if (event.sender.id && event.message.text) {
//                 sendMessage(event.sender.id, {
//                     text: "Добрый день! Список команд есть в меню слева :)"
//                 });
//             }
//         } else if (event.postback.payload == 'news') {
//             fbMessage.getRandomNewsItem(event.sender.id);
//         } else if (event.postback.payload == 'cinema') {
//             fbMessage.getAllFilms(event.sender.id);
//         } else if (event.postback.payload == 'theatre') {
//             sendTheatreImage(event.sender.id);
//         } else if (event.postback.payload == 'concerts') {
//             fbMessage.getAllConcerts(event.sender.id);
//         };
//     }
//     res.sendStatus(200);
// });

app.post('/webhook/', function(req, res) {
    let messaging_events = req.body.entry[0].messaging
    for (let i = 0; i < messaging_events.length; i++) {
        let event = req.body.entry[0].messaging[i]
        let sender = event.sender.id
        if (event.message && event.message.text) {
            let text = event.message.text
            sendTextMessage(sender, 'NU PRIVETIK');
        }
        if (event.postback) {
            let text = JSON.stringify(event.postback)
            sendTextMessage(sender, "Postback received: " + text.substring(0, 200))
            continue
        }
    }
    res.sendStatus(200)
})

// Function to send simple text message
function sendTextMessage(sender, text) {
    let messageData = { text:text }
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {access_token:pageToken},
        method: 'POST',
        json: {
            recipient: {id:sender},
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
function sendTheatreImage(recipientId, message){
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
    }, function(error, response, body){
        if (error) {
            console.log('Error sending message: ', error);
        } else if (response.body.error) {
            console.log('Error: ', response.body.error);
        }
    });
};


function sendNews(recipientId, newsArray){
    let randomNumber =
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
        }, function(error, response, body){
            if (error) {
                console.log('Error sending message: ', error);
            } else if (response.body.error) {
                console.log('Error: ', response.body.error);
            }
        });
}

app.listen(port, function(){
    console.log('Listening on port ' + port);
});
