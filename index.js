const config = require('./config');
const express = require('express');
const cors = require('cors');
const faker = require('faker');
const request = require('request');
const rp = require('request-promise-native');
const qs = require('querystring');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const schedule = require('node-schedule');
const winston = require('winston');
const fs = require('fs');
const logDir = 'log';
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir);
}

const tsFormat = () => (new Date()).toLocaleTimeString();
const logger = new (winston.Logger)({
  transports: [
    new (winston.transports.Console)({
      timestamp: tsFormat,
      colorize: true,
      level: 'info'
    }),
    new (winston.transports.File)({
      filename: `${logDir}/results.log`,
      timestamp: tsFormat,
      level: config.env === 'development' ? 'debug' : 'info'
    })
  ]
});

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

// async function run() {
//     let job = schedule.scheduleJob('*/1 * * * *', async function () {
//       logger.info('job started');
//       await parse();
//     });
// }

app.listen(config.port, function () {
    logger.info('Started on port: ' + config.port);
});