const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Mongo db

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.1yjvy4y.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();
    const carsCollection = client
      .db('rabbikhalidhasan')
      .collection('carCollections');
    const usedCarCollection = client
      .db('rabbikhalidhasan')
      .collection('usedCollection');
    const userCollection = client
      .db('rabbikhalidhasan')
      .collection('allUserCollection');

    app.get('/cars', async (req, res) => {
      const cursor = carsCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    app.post('/jwt', async (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET);
      res.send(token);
    });

    app.get('/cars/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const options = {
        projection: {
          title: 1,
          img: 1,
          price: 1,
          mileage: 1,
          make: 1,
          description: 1,
        },
      };
      const result = await carsCollection.findOne(query, options);
      res.send(result);
    });

    app.put('/cars/:id', async (req, res) => {
      const id = req.params.id;
      const car = req.body;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updatedCar = {
        $set: {
          title: car.title,
          price: car.price,
          make: car.make,
          mileage: car.mileage,
          description: car.description,
        },
      };
      const result = await usedCarCollection.updateOne(
        filter,
        updatedCar,
        options
      );
      res.send(result);
    });

    // delete a car
    app.delete('/car/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await carsCollection.deleteOne(query);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db('admin').command({ ping: 1 });
    console.log(
      'Pinged your deployment. You successfully connected to MongoDB!'
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('Stride Server is running');
});
app.listen(port, () => {
  console.log(`Stride server is running on Port: ${port}`);
});
