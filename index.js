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
    app.post('/products', async (req, res) =>{
      const data = req.body;
      console.log(data);
      const result = await exportProducts.insertOne(data);
      res.send(result ) 
    })

    // Get products from DB
    app.get('/products', async(req, res)=>{
      const result = await exportProducts.find().toArray();
      res.send(result);
    })

    app.get('/products/:id', async(req, res)=>{
      const id = req.params
      console.log(id);

      const query = {_id: new ObjectId(id)}
      const result = await exportProducts.findOne(query)
      res.send(result)
      
    })

    app.get('/my-export', async(req, res)=>{
      const {email} = req.query
     
      const query = {email: email}
      const result = await exportProducts.find(query).toArray()
      res.send(result)
      
    })

    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    //await client.close(); (Make Comment allways)
  }
}
run().catch(console.dir);

app.get('/',(req, res)=>{
    res.send('Hello, Developer')
})

app.listen(port, ()=>{
    console.log(`Server is running on ${port}`);
    
})
