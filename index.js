const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

// midlewar

app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.as0kbdg.mongodb.net/?retryWrites=true&w=majority`;

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
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const animalToyCollection = client
      .db("animalToysDB")
      .collection("animalToy");

    const indexKeys = { toyName: 1 };
    const indexOptions = { name: "toyName" };
    const result = await animalToyCollection.createIndex(
      indexKeys,
      indexOptions
    );

    //  get all data
    app.get("/alltoysData", async (req, res) => {
      const result = await animalToyCollection.find().toArray();
      res.send(result);
    });

    app.get("/toySearchByName/:text", async (req, res) => {
      const searchText = req.params.text;
      console.log(searchText);

      const qurey = { toyName: { $regex: searchText, $options: "i" } };

      const result = await animalToyCollection.find(qurey).toArray();
      res.send(result);
    });

    // get data by category
    app.get("/category/:name", async (req, res) => {
      const categoryName = req.params.name;
      const qurey = { category: categoryName };

      const result = await animalToyCollection.find(qurey).toArray();
      res.send(result);
    });

    // get data by id
    app.get("/toydetails/:id", async (req, res) => {
      const id = req.params.id;
      const qurey = { _id: new ObjectId(id) };
      const result = await animalToyCollection.findOne(qurey);
      res.send(result);
    });

    // get my toys data by email
    app.get("/mytoys", async (req, res) => {
      let query = {};
      if (req.query.email) {
        query = { sellerEmail: req.query.email };
      }

      const result = await animalToyCollection.find(query).toArray();
      res.send(result);
    });



    // get my toys data by asc dsc
    app.get('/mytoysAscDsc', async(req, res) => {

      
      let sortData = req.query.sort 

      if(sortData === "ASCENDING"){
        const result = await animalToyCollection.find({ sellerEmail: req.query.email }).sort({Price: -1 }).toArray();
        res.send(result);
      }
     else{
      const result = await animalToyCollection.find({ sellerEmail: req.query.email }).sort({Price: 1 }).toArray();
      res.send(result);
     }
      
    })




    // post toy
    app.post("/animaltoy", async (req, res) => {
      const body = req.body;
      const result = await animalToyCollection.insertOne(body);
      res.send(result);
    });

    // update toy
    app.put("/update/:id", async (req, res) => {
      const id = req.params.id;
      const body = req.body;

      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updateData = {
        $set: {
          ...body,
        },
      };
      const result = await animalToyCollection.updateOne(
        filter,
        updateData,
        options
      );
      res.send(result);
    });

    // delete toy by id
    app.delete("/deletetoy/:id", async (req, res) => {
      const id = req.params.id;

      const qurey = { _id: new ObjectId(id) };
      const result = await animalToyCollection.deleteOne(qurey);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Animal toys is running");
});

app.listen(port, () => {
  console.log(`Animal toys is running on ${port}`);
});
