let express = require('express');

let port = process.env.PORT || 3000;
let app = express();

app.get('/hello', (req,res) => {
	res.send('hello world');
});

app.listen(port, function() {
    console.log('API Started on port: ' + port);
});