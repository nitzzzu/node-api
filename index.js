let config = require('./config');
let express = require('express');
let cors = require('cors');
let faker = require('faker');
let request = require('request');
let rp = require('request-promise-native');
let qs = require('querystring');
let bodyParser = require('body-parser');
let jwt = require('jsonwebtoken');

let users = [
    {
        name: 'test',
        password: 'test'
    }
]

let app = express();
app.use(cors());
app.options('*', cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

app.get('/user', (req, res) => {
    let user = {
        name: faker.name.findName(),
        email: faker.internet.email(),
        website: faker.internet.url(),
        address: faker.address.streetAddress() + faker.address.city() + faker.address.country(),
        bio: faker.lorem.sentences(),
        image: faker.image.avatar()
    };

    res.send(user);
});

app.post('/login', (req, res) => {
    let token = '';
    for (let user of users) {
        if (user.name == req.body.name && user.password == req.body.password) {
            token = jwt.sign(user, config.secret);
            break;
        }
    }

    if (token) {
        res.status(200).json({
            message: 'Login Successful',
            token
        });
    }
    else {
        res.status(403).json({
            message: 'Wrong credentials'
        });
    }
});

app.use((req, res, next) => {
    let token = req.body.token || req.query.token || req.headers['x-access-token'];
    if (token) {
        jwt.verify(token, config.secret, (err, decod) => {
            if (err) {
                res.status(403).json({
                    message: 'Wrong Token'
                });
            }
            else {
                req.decoded = decod;
                next();
            }
        });
    }
    else {
        res.status(403).json({
            message: 'No Token'
        });
    }
});

app.listen(config.port, function () {
    console.log('Started on port: ' + config.port);
});