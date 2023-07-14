const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
const jwt = require('jsonwebtoken');


const app = express();
const port = process.env.PORT || 5000;
require('dotenv').config();


// middleware
app.use(cors());
app.use(express.json());

// console.log("YES",process.env.DB_USER);
// console.log(process.env.DB_PASS);
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.h8pz7ag.mongodb.net/?retryWrites=true&w=majority`;
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});


function verifyJWT(req, res, next) {
    // console.log('inside token',req.headers.authorization)

    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send('Unauthorized Access');
    }

    const token = authHeader.split(' ')[1];

    jwt.verify(token, process.env.ACCESS_TOKEN, function (err, decoded) {
        if (err) {

            return (res.status(403).send({ message: 'Forbidden access.........' }))
        }
        req.decoded = decoded;
        next();
    })
}

// console.log(process.env.ACCESS_TOKEN);

async function run(){

    try {

        const usersCollections = client.db('Social_Media').collection('Users');

        app.get('/jwt', async (req, res) => {
            const email = req.query.email;
            const query = { email: email }
            const user = await usersCollections.findOne(query);
            if (user) {
                const token = jwt.sign({ email }, process.env.ACCESS_TOKEN, { expiresIn: '5h' })
                return res.send({ accessToken: token });
            }
            res.status(403).send({ accessToken: '' })
        })

        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await usersCollections.insertOne(user);
            res.send(result);
        });

        app.get('/finduser', async (req, res) => {
            const email = req.query.email;
            const query = { email: email }
            const user = await usersCollections.findOne(query);
            if (user) {
                return res.send({ accessToken: true });
            }
            return res.send({ accessToken: false });
        })
    }
    finally{

    }

};


run().catch(console.dir);



    


run().catch(console.log);



app.get('/', (req, res)=> {
    res.send("Hello From RTR Social Media");
});


app.listen(port, ()=>{
    console.log(`Server is running from port ${port}`);
});
