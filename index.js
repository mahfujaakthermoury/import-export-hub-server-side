const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const port = 3000;

const app = express();
app.use(cors());
app.use(express.json())


const uri = "mongodb+srv://import_export:P7diRksOr9QCTsdH@clusterhub.3pf2lfb.mongodb.net/?appName=ClusterHub";

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    await client.connect();

    const database = client.db('exportProduct');
    const exportProducts = database.collection('products')

    //Post or save product to DB
    app.post('/products', async (req, res) => {
      const data = req.body;
      console.log(data);
      const result = await exportProducts.insertOne(data);
      res.send(result)
    })

    // Get products from DB
    app.get('/products', async (req, res) => {
      const result = await exportProducts.find().toArray();
      res.send(result);
    })

    app.get('/products/:id', async (req, res) => {
      const { id } = req.params
      console.log(id);

      const query = { _id: new ObjectId(id) }
      const result = await exportProducts.findOne(query)
      res.send(result)
    })

    app.get('/my-export', async (req, res) => {
      const { email } = req.query

      const query = { email: email }
      const result = await exportProducts.find(query).toArray()
      res.send(result)
    })

    app.put('/update/:id', async (req, res) => {
      const data = req.body;
      const { id } = req.params
      const query = { _id: new ObjectId(id) }

      const updateExport = {
        $set: data
      }
      const result = await exportProducts.updateOne(query, updateExport)
      res.send(result)
    })

    app.delete('/delete/:id', async (req, res) => {
      const { id } = req.params
      const query = { _id: new ObjectId(id) }
      const result = await exportProducts.deleteOne(query)
      res.send(result)
    })

    app.put('/update/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { importQuantity } = req.body;

    if (!importQuantity || importQuantity <= 0) {
      return res.send({ error: 'Invalid import quantity' });
    }

    // Get current product
    const product = await exportProducts.findOne({ _id: new ObjectId(id) });
    if (!product) return res.status(404).send({ error: 'Product not found' });
    if (product.quantity < importQuantity) {
      return res.status(400).send({ error: 'Import quantity exceeds available stock' });
    }

    // Update quantity using $inc
    const result = await exportProducts.updateOne(
      { _id: new ObjectId(id) },
      { $inc: { quantity: -importQuantity } } // <-- Only this line decreases the quantity
    );

    res.send({ success: true, modifiedCount: result.modifiedCount });
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: 'Server error' });
  }
});


  await client.db("admin").command({ ping: 1 });
  console.log("Pinged your deployment. You successfully connected to MongoDB!");
} finally {
  //await client.close(); (Make Comment allways)
}
}
run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('Hello, Developer')
})

app.listen(port, () => {
  console.log(`Server is running on ${port}`);

})
