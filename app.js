const http = require('http')


const config = require('./utils/config');
const express = require('express')
const app = express()
const cors = require('cors')
const blogsRouter = require('./controllers/blogs')
const usersRouter = require('./controllers/users')
const loginRouter = require('./controllers/login')
const middleware = require('./utils/middleware')
const logger = require('./utils/logger')

const mongoose = require('mongoose')
mongoose.set('strictQuery', false)
const url = config.MONGODB_URI;

mongoose.connect(url)
.then(result => {
  logger.info("connected to MongoDB");
})
.catch((error) => {
  logger.info("error connecting to MongoDB:", error.message);
});

app.use(cors())
app.use(express.json())

app.use('/api/users', usersRouter);

app.use('/', blogsRouter);
app.use('/api/login', loginRouter);

if (process.env.NODE_ENV === 'test') {
  const testingRouter = require('./controllers/testing')
  app.use('/api/testing', testingRouter)
}

app.use(middleware.errorHandler);

module.exports = app;