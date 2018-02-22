'use strict'

module.exports = {
    secret: 'samplesecret',
    env: process.env.NODE_ENV || 'development',
    port: process.env.PORT || 3000
}