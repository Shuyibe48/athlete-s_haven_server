const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const morgan = require('morgan')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb')
const port = process.env.PORT || 5000


// middleware
const corsOptions = {
    origin: '*',
    credentials: true,
    optionSuccessStatus: 200,
}
app.use(cors(corsOptions))
app.use(express.json())
app.use(morgan('dev'))


// summerschool
// Ut4qAVGWLLRX9Uv2





app.get('/', (req, res) => {
    res.send('Athlete\'s Haven Server is running..')
})

app.listen(port, () => {
    console.log(`Athlete\'s Haven is running on port ${port}`)
})