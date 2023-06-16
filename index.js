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






const uri = `mongodb+srv://${process.env.USER_NAME}:${process.env.USER_PASS}@cluster0.jukjd3u.mongodb.net/?retryWrites=true&w=majority`

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        const usersCollection = client.db('summerschool').collection('users')
        const classCollection = client.db('summerschool').collection('classes')
        const selectClassCollection = client.db('summerschool').collection('selectClasses')


        // save user
        app.put('/users/:email', async (req, res) => {
            const email = req.params.email
            const user = req.body
            const query = { email: email }
            const options = { upsert: true }
            const updateDoc = {
                $set: user,
            }
            const result = await usersCollection.updateOne(query, updateDoc, options)
            res.send(result)
        })


        // Get user
        app.get('/users', async (req, res) => {
            const result = await usersCollection.find().toArray()
            res.send(result)
        })


        // Get a single user
        app.get('/users/:email', async (req, res) => {
            const email = req.params.email
            const query = { email: email }
            const result = await usersCollection.findOne(query)
            res.send(result)
        })


        // Get all class
        app.get('/classes', async (req, res) => {
            const result = await classCollection.find().toArray()
            res.send(result)
        })


        // Save a class in database
        app.post('/classes', async (req, res) => {
            const classes = req.body
            console.log(classes)
            const result = await classCollection.insertOne(classes)
            console.log(result)
            res.send(result)
        })


        // Get user classes
        app.get('/classes/:email', async (req, res) => {
            const email = req.params.email
            const query = { email: email }
            const result = await classCollection.find(query).toArray()
            // console.log(result)
            res.send(result)
        })



        // Get all select class
        app.get('/saveClass/:email', async (req, res) => {
            const email = req.params.email
            const query = { selectStudent: email }
            const result = await selectClassCollection.find(query).toArray()
            res.send(result)
        })


        // Save select class
        app.post('/saveClass', async (req, res) => {
            const selectClasses = req.body
            console.log(selectClasses)
            const result = await selectClassCollection.insertOne(selectClasses)
            console.log(result)
            res.send(result)
        })


        // delete room
        app.delete('/saveClass/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: new ObjectId(id) }
            const result = await selectClassCollection.deleteOne(query)
            res.send(result)
        })




        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);





app.get('/', (req, res) => {
    res.send('Athlete\'s Haven Server is running..')
})

app.listen(port, () => {
    console.log(`Athlete\'s Haven is running on port ${port}`)
})