require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express');
const cors = require('cors');
const port = 3000;

const app = express();
app.use(cors());
app.use(express.json())


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@clusterhub.3pf2lfb.mongodb.net/?appName=ClusterHub`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {

    const database = client.db('exportProduct');
    const exportProducts = database.collection('products')
    const importOrders = database.collection("orders");

    //Post product to DB
    app.post('/products', async (req, res) => {
      const data = req.body;
      console.log(data);
      const result = await exportProducts.insertOne({...data, quantity: Number(req.body.quantity)});
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


    // update product quantity after import
    app.patch("/quantity-update/:id", async (req, res) => {
      const id = req.params.id;
      const quantity = Number(req.body.quantity);

      const product = await exportProducts.findOne({ _id: new ObjectId(id) });

      if (quantity > product.quantity) {
        return res.status(400).send({ message: "Out of stock" });
      }

      const result = await exportProducts.updateOne(
        { _id: new ObjectId(id) },
        { $inc: { quantity: -quantity } }
      );

      res.send(result);
    });


    //post import order
    app.post('/orders', async (req, res) => {
      const data = req.body
      console.log(data);
      const result = await importOrders.insertOne(data)
      res.send(result)
    })

    app.get('/orders', async (req, res) => {
      const { email } = req.query
      const query = { email: email }
      const result = await importOrders.find(query).toArray()
      res.send(result)
    })

    app.delete('/imports-delete/:id', async (req, res) => {
      const { id } = req.params
      const query = { _id: new ObjectId(id) }
      const result = await importOrders.deleteOne(query)
      res.send(result)
    });



    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    //await client.close(); 
  }
}
run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('Hello, Developer')
})

app.listen(port, () => {
  console.log(`Server is running on ${port}`);

})
