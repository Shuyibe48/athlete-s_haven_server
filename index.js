const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const morgan = require('morgan')
const jwt = require('jsonwebtoken')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb')
const port = process.env.PORT || 5000
// const stripe = require("stripe")(process.env.PAYMENT_SECRET_KEY)


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





// middle were function for verify token 
function verifyJWT(req, res, next) {
    const authorization = req.headers.authorization
    console.log(authorization)
    if (!authorization) {
        return res.status(404).send({ error: 'unauthorized access' })
    }

    // // step 1. verify if the provided token id valid or not.
    const token = authorization.split(' ')[1]
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        console.log(err)
        if (err) {
            return res.status(403).send({ error: 'unauthorized access' })
        }

        console.log({ decoded })
        req.decoded = decoded
        next()
    })
}






async function run() {
    try {
        const usersCollection = client.db('summerschool').collection('users')
        const classCollection = client.db('summerschool').collection('classes')
        const selectClassCollection = client.db('summerschool').collection('selectClasses')
        const enrolledClassCollection = client.db('summerschool').collection('enrolledClass')


        // // generate client secret
        // app.post('/create-payment-intent', async (req, res) => {
        //     const price = req.body
        //     if(price){
        //         const amount = parseFloat(price) * 100
        //         const paymentIntent = await stripe.paymentIntents.create({
        //             amount: amount,
        //             currency: 'usd',
        //             payment_method_types: ['card']
        //         })
        //         res.send({clientSecret: paymentIntent.client_secret})
        //     }
        // })


        // sign jwt token
        app.post('/jwt', async (req, res) => {
            const body = req.body
            const token = jwt.sign(body, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "1hr" })
            res.send({ token })
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

        // save user 
        app.post('/users', async (req, res) => {
            const user = req.body
            const result = await usersCollection.insertOne(user)
            res.send(result)
        })

        // update user role 
        app.patch('/users/:id', async (req, res) => {
            const { id } = req.body
            const { role } = req.body

            const query = { _id: new ObjectId(id) }

            const options = {
                $set: {
                    role: role
                }
            }

            const result = await usersCollection.updateOne(query, options)
            res.send(result)
        })











        // get class
        app.get('/class', async (req, res) => {
            const result = await classCollection.find().toArray()
            res.send(result)
        })

        // Get class by email
        app.get('/class/:email', async (req, res) => {
            const email = req.params.email
            const query = { instructorEmail: email }
            const result = await classCollection.find(query).toArray()
            res.send(result)
        })

        // Get class by status
        app.get('/approved', async (req, res) => {
            const query = { status: 2 }
            const result = await classCollection.find(query).toArray()
            res.send(result)
        })

        // save class 
        app.post('/class', async (req, res) => {
            const classData = req.body
            const result = await classCollection.insertOne(classData)
            res.send(result)
        })

        // admin update class status
        app.patch('/class/:id', async (req, res) => {
            const { id } = req.body
            const { status } = req.body

            const query = { _id: new ObjectId(id) }

            const options = {
                $set: {
                    status: status
                }
            }

            const result = await classCollection.updateOne(query, options)
            res.send(result)
        })





        // ==============================


        // get selected class
        app.get('/cart/:email', async (req, res) => {
            const email = req.params.email
            const query = { studentEmail: email }
            const result = await selectClassCollection.find(query).toArray()
            res.send(result)
        })

        // save class on cart
        app.post('/cart', async (req, res) => {
            const classData = req.body
            const result = await selectClassCollection.insertOne(classData)
            res.send(result)
        })

        // delete cart class
        app.delete('/cart/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: new ObjectId(id) }
            const result = await selectClassCollection.deleteOne(query)
            res.send(result)
        })


        // get cart class
        app.get('/cart-class/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: new ObjectId(id) }
            const result = await classCollection.findOne(query)
            res.send(result)
        })



        // update class sets
        app.patch('/cart-class/:id', async (req, res) => {
            const id = req.params.id
            const { availableSeats } = req.body
            const { totalEnrolled } = req.body

            const query = { _id: new ObjectId(id) }

            const options = {
                $set: {
                    availableSeats: availableSeats,
                    totalEnrolled: totalEnrolled
                }
            }

            const result = await classCollection.updateOne(query, options)
            res.send(result)
        })




        // get enrolled class 
        app.get('/enrolled/:email', async (req, res) => {
            const email = req.params.email
            const query = { email: email }
            const result = await enrolledClassCollection.find(query).toArray()
            res.send(result)
        })

        // enrolled class save 
        app.post('/enrolled', async (req, res) => {
            const enrolledClass = req.body
            const result = await enrolledClassCollection.insertOne(enrolledClass)
            res.send(result)
        })


        // =================================
        // =================================


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