const express = require('express');
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.94yoj.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();
        const database = client.db("tour-packages");
        const packagesCollection = database.collection("packages");
        const ordersCollection = database.collection("orders");

        // GET PACKAGES API
        app.get('/packages', async(req, res) => {
            const cursor = packagesCollection.find({});
            const packages = await cursor.toArray();
            res.send(packages);
        })

        // GET SINGLE PACKAGE API
        app.get('/packages/:id', async(req, res)=>{
            const id = req.params.id;
            const query = { _id: ObjectId(id)};
            const package = await packagesCollection.findOne(query);
            res.json(package);
        })

        // ORDER POST API
        app.post("/order", async(req, res)=> {
            const data = req.body;
            const result = await ordersCollection.insertOne(data);
            res.json(result);
        })

        //GET ORDERS API
        app.get('/orders', async(req,res) => {
            const cursor = ordersCollection.find({});
            const orders = await cursor.toArray();
            res.send(orders);
        })

        // UPDATE STATUS API
        app.put('/orders/:id', async(req, res) =>{
            const id = req.params.id;
            const orderStatus = req.body;
            const filter = { _id: ObjectId(id) }
            const updateDoc = {
                $set: {
                    status: orderStatus.status
                },
            };
            const result = await ordersCollection.updateOne(filter, updateDoc)
            res.json(result)
        })

        // DELETE API
        app.delete('/orders/:id', async(req, res)=> {
            const id = req.params.id;
            const query = {_id: ObjectId(id)};
            const result = await ordersCollection.deleteOne(query);
            res.json(result)
        })
    }
    finally {
        // await client.close();
    }

}
run().catch(console.dir);

app.get('/', (req, res)=> {
    res.send('Running Server Successfully')
})

app.listen(port, ()=>{
    console.log('Running server on port : ', port);
})