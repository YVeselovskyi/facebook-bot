const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.get('/' , (req,res) => {
  res.send('Main!');
})


app.get('/webhook', (req, res) => {
  if (req.query['hub.mode'] === 'subscribe' &&
      req.query['hub.verify_token'] === 'DynamoKyiv') {
    console.log("Validating webhook");
    res.status(200).send(req.query['hub.challenge']);
  } else {
    console.error("Failed validation. Make sure the validation tokens match.");
    res.sendStatus(403);
  }
});

app.listen(port, () => {
    console.log('Listening on port ' + port);
});
