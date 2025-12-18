const { MongoClient, ServerApiVersion } = require('mongodb');
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const port = 3000;

const app = express();
app.use(cors());


const uri = "mongodb+srv://import-export-hub:11Mp3D7F6GqEPmDX@clusterhub.3pf2lfb.mongodb.net/?appName=ClusterHub";

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
    console.log('Server is running on ${port}');
    
})
