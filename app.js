const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const bodyParser = require('body-parser');
const request = require('request');
const cinema = require('./cinema');


const pageToken = 'EAAMy7RcgMngBAKuBeZBkeRocU4TbaBytzYU2Tx9xexoDQDfmR1XEdEayBPJXkrNZCIDOQ5Cmv4ctClNzrWNjSbmTHzBY4q6ZAbIed6kh61oaKKUT9v10LA8QBr5taJZAdh6tX6qPNfLV6i4YES1MVYR4TapcxOdNd9adrV2aHAZDZD';

app.use(bodyParser.json())

app.get('/', (req, res) => {
    res.send('Main!');
})

app.get('/webhook', (req, res) => {
    if (req.query['hub.mode'] === 'subscribe' &&
        req.query['hub.verify_token'] === 'DynamoKyiv') {
        // console.log("Validating webhook");
        res.status(200).send(req.query['hub.challenge']);
    } else {
        // console.error("Failed validation. Make sure the validation tokens match.");
        res.sendStatus(403);
    }
});


app.post('/webhook', function(req, res) {
    var data = req.body;

    // Make sure this is a page subscription
    if (data.object == 'page') {
        messagingEvents = data.entry[0].messaging;

        for (i = 0; i < messagingEvents.length; i++) {
            event = data.entry[0].messaging[i];
            var senderID = event.sender.id;
            console.log(event.postback);
            if (event.message && event.message.text) {
                var text = event.message.text;
                if (text) {
                    sendTextMessage(senderID, 'Привет, вот список доступных команд :)')
                } else if (event.postback) {
                    // cinema.getFilms()
                    //     .then((result) => {
                    //         result.forEach(function(i) { sendTextMessage(senderID, i) });
                    //     })
                    //     .catch(err => console.log(err));
                    //console.log(event.postback);
                }

            };


        }
        res.sendStatus(200);
    }
});


function sendTextMessage(recipientId, messageText) {
    var messageData = {
        recipient: {
            id: recipientId
        },
        message: {
            text: messageText
        }
    };

    callSendAPI(messageData);
}

function callSendAPI(messageData) {
    request({
        uri: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {
            access_token: pageToken
        },
        method: 'POST',
        json: messageData

    }, function(error, response, body) {
        if (!error && response.statusCode == 200) {
            var recipientId = body.recipient_id;
            var messageId = body.message_id;

            // console.log("Successfully sent generic message with id %s to recipient %s",
            //   messageId, recipientId);
        } else {
            console.error("Unable to send message.");
        }
    });
}


app.listen(port, () => {
    console.log('Listening on port ' + port);
});
