const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
const jwt = require('jsonwebtoken');
const { ObjectId } = require('mongodb');


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

async function run() {

    try {

        const usersCollections = client.db('Social_Media').collection('Users');
        const postCollections = client.db('Social_Media').collection('Posts');
        const allCommentsCollections = client.db('Social_Media').collection('Comments');

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
        });

        app.get('/profile/:email', async (req, res) => {
            const email = req.params.email;
            // console.log(email);
            const query = { email: email }
            const user = await usersCollections.findOne(query);
            res.send(user);
        });

        app.post('/post', async (req, res) => {
            const user = req.body;
            const result = await postCollections.insertOne(user);
            res.send(result);
        });

       
        app.get('/allPost', async (req, res) => {
            const query = {}
            const result = await postCollections.find(query).sort({ _id: -1 }).limit(10).toArray();
            res.send(result);
        });

        app.get('/singlePost/:id', async (req, res) => {
            const id= req.params.id;
            // console.log(id)
            const filter = {_id: new ObjectId(id)};
            const result = await postCollections.findOne(filter);
            // console.log(result)
            res.send(result);
        });

        app.get('/doublePost/:email', async (req, res) => {
            const email= req.params.email;
            // console.log(email)
            const filter = {email: email};
            const result = await postCollections.find(filter).sort({ _id: -1 }).toArray();
            // console.log(result)
            res.send(result);
        });


        app.put('/updateLove/:id', async (req, res) => {
            
            const id = req.params.id;
            const love = req.body.data;
            // console.log("love count number",love.n.toString());
            // console.log("id",id);
            const filter = { _id: new ObjectId(id) }
            const options = { upsert: true }
            const updatedDoc = {
                $set: {
                    love: love
                }
            }
            const result = await postCollections.updateOne(filter, updatedDoc, options);
            res.send(result);
        });


        app.put('/updateLike/:id', async (req, res) => {
            
            const id = req.params.id;
            const like = req.body.data;
            // console.log("love count number",like);
            // console.log("id",id);
            const filter = { _id: new ObjectId(id) }
            const options = { upsert: true }
            const updatedDoc = {
                $set: {
                    like: like
                }
            }
            const result = await postCollections.updateOne(filter, updatedDoc, options);
            res.send(result);
        });


        app.post('/comments', async (req, res) => {
            const user = req.body;
            // console.log(user)
            const result = await allCommentsCollections.insertOne(user);
            res.send(result);
        });

        app.get('/comments/:id', async (req, res) => {
            const id = req.params.id
            const query = {postId: id}
            const result = await allCommentsCollections.find(query).sort({ _id: -1 }).toArray();
            res.send(result);
        });


        app.put('/updateProfile/:id', async (req, res) => {
            
            const id = req.params.id;
            const info = req.body;
            // console.log("love count number",love.n.toString());
            // console.log(info.profileInfo.name);
            // console.log(id);
            const filter = { _id: new ObjectId(id) }
            const options = { upsert: true }
            const updatedDoc = {
                $set: {
                    name: info.profileInfo.name,
                    email: info.profileInfo.email,
                    versity: info.profileInfo.versity,
                    address: info.profileInfo.address
                }
            }
            const result = await usersCollections.updateOne(filter, updatedDoc, options);
            res.send(result);
        });
        

        app.get('/topThreeLovePosts', async (req, res) => {
            
            
            const topThreePosts = await postCollections.find().sort({ "love.n": -1 }).limit(3).toArray();

              // Send the top three posts as the API response
              res.json(topThreePosts);
        });


        



    }
    finally {

    }

};


run().catch(console.dir);






run().catch(console.log);



app.get('/', (req, res) => {
    res.send("Hello From RTR Social Media");
});


app.listen(port, () => {
    console.log(`Server is running from port ${port}`);
});
