require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const {default: helmet} = require('helmet')
const compression = require('compression')
const app = express()

// init middleware
app.use(morgan("dev"))
app.use(helmet())
app.use(compression())

// init db
require('./dbs/init.mongodb')
// const { checkOverLoad } = require('./helpers/check.connect')
// checkOverLoad()
 
// init router
app.use('/', require('./routes'))
// handle error


module.exports = app