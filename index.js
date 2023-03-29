// require('dotenv').config();
const config = require('./utils/config')
const logger = require('./utils/logger')

const app = require('./app') // the actual Express application

// const PORT = process.env.PORT;
app.listen(config.PORT, () => {
  logger.info('server running')
})

