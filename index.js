const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();


const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());



const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_User}:${process.env.DB_Pass}@cluster0.245gucn.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {

   


   const usersCollection = await client.db('iiucResources').collection("users");
   const courseCollection = await client.db('iiucResources').collection("cseCourse");


    //users
    app.get('/users',async(req, res)=>{
      const result = await usersCollection.find().toArray();
      res.send(result);
    })

    app.get('/users/:email',async(req, res)=>{
      const {email} = req.params;
      const query = {email}
      const result = await usersCollection.findOne(query);
      res.send(result);
    })

     
    app.post('/users',async(req, res)=>{
      const user = req.body;
      const query = {email: user.email}
      const exist = await usersCollection.findOne(query);
      if(exist){
        return res.send({message:'user already exists',insertId: null})
      }
      const result = await usersCollection.insertOne(user);
      res.send(result);
    })

    app.patch('/users/:email', async (req, res) => {
      const { email } = req.params;
      const {  resource } = req.body;
       

      try {
          const filter = { email };
          const update = { $push: { ["myContribution"]: resource } };
          const result = await usersCollection.updateOne(filter, update);
          console.log(result)
          if (result.matchedCount === 0) {
              return res.status(404).send({ message: 'user not found' });
          }
  
          
          res.send({ message: 'Resource added successfully', result });
      } catch (err) {
          res.status(500).send({ message: 'Internal server error', error: err });
      }
  });
  



    //course Update CSE
    app.patch('/courses/:courseCode', async (req, res) => {
      const { courseCode } = req.params;
      const { contentType, resource } = req.body;
    
  
      if (!['Playlist', 'Note', 'questionBank', 'other'].includes(contentType)) {
          return res.status(400).send({ message: 'Invalid Content Name' });
      }
  
      try {
          const filter = { courseCode };
          const update = { $push: { [contentType]: resource } };
          const result = await courseCollection.updateOne(filter, update);
  
          if (result.matchedCount === 0) {
              return res.status(404).send({ message: 'Course not found' });
          }
  
          
          res.send({ message: 'Resource added successfully', result });
      } catch (err) {
          res.status(500).send({ message: 'Internal server error', error: err });
      }
  });
  
   
  app.get('/cseCourses',async(req, res) => {
    const result= await courseCollection.find().toArray();
   res.send(result);
  })


 
    await client.connect();
    await client.db("admin").command({ ping: 1 });

  } finally {
    // await client.close();
  }
}
run().catch(console.dir);
app.get('/', (req, res) => {
  res.send('Note Nest Server is running!!')
})

app.listen(port, () => {
  console.log(`Note Nest listening on port ${port}`)
})