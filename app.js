const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const bodyParser = require('body-parser');
const request = require('request');

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

var allSenders = {};

app.post('/webhook', function(req, res) {
    var data = req.body;

    // Make sure this is a page subscription
    if (data.object == 'page') {
        console.log(data.entry[0].messaging);
        res.sendStatus(200);
    }
});


function receivedMessage(event) {
    var senderID = event.sender.id;
    var recipientID = event.recipient.id;
    var timeOfMessage = event.timestamp;
    var message = event.message;
    var messageId = message.mid;

    // You may get a text or attachment but not both
    var messageText = message.text;
    var messageAttachments = message.attachments;

    allSenders[senderID] = true;

    if (message && messageText) {
        Object.keys(allSenders).forEach(function(recipientID) {
            sendTextMessage(recipientID, messageText)
        });
        console.log(allSenders);
    };

}

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
            // console.error(response);
            // console.error(error);
        }
    });
}


app.listen(port, () => {
    console.log('Listening on port ' + port);
});
