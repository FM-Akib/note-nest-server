const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();


const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());



const { MongoClient, ServerApiVersion,ObjectId } = require('mongodb');
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
   const clubsCollection = await client.db('iiucResources').collection("clubs");
   const componentsCollection = await client.db('iiucResources').collection("components");


   const courseCollectionEee = await client.db('iiucResources').collection("eeeCourse");
   const courseCollectionPharma = await client.db('iiucResources').collection("pharmaCourse");



    //users============================================================================================================
    // all user data
    app.get('/users',async(req, res)=>{
      const result = await usersCollection.find().toArray();
      res.send(result);
    })

    //  getting a user data
    app.get('/users/:email',async(req, res)=>{
      const {email} = req.params;
      const query = {email}
      const result = await usersCollection.findOne(query);
      res.send(result);
    })

    //  register a user
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


    // adding user contribution 
    app.patch('/users/:email', async (req, res) => {
      const { email } = req.params;
      const {  resource } = req.body;
       

      try {
          const filter = { email };
          const update = { $push: { ["myContribution"]: resource } };
          const result = await usersCollection.updateOne(filter, update);
          // console.log(result)
          if (result.matchedCount === 0) {
              return res.status(404).send({ message: 'user not found' });
          }
  
          
          res.send({ message: 'Resource added successfully', result });
      } catch (err) {
          res.status(500).send({ message: 'Internal server error', error: err });
      }
  });
  


  
  //  a user edit his/her contribution data
  
  app.patch('/users/:email/contribution/:id', async (req, res) => {
    const email = req.params.email;
    const contributionId = req.params.id;
    const { resource } = req.body;
   
    try {
      const result = await usersCollection.updateOne(
        { email: email, "myContribution.id": contributionId },
        { $set: { "myContribution.$": resource } }
      );
  
      if (result.modifiedCount === 0) {
        return res.status(404).send({ message: 'Contribution not found or already updated' });
      }
  
      res.send({ message: 'Updated successfully', result });
    } catch (error) {
      console.error('Error updating:', error);
      res.status(500).send({ message: 'An error occurred', error });
    }
  });
  




  // a user insert bookmarked data
  app.patch('/users/bookmark/:email', async (req, res) => {
    const { email } = req.params;
    const {  resource } = req.body;
     

    try {
        const filter = { email };
        const update = { $push: { ["bookmarked"]: resource } };
        const result = await usersCollection.updateOne(filter, update);
        // console.log(result)
        if (result.matchedCount === 0) {
            return res.status(404).send({ message: 'user not found' });
        }

        
        res.send({ message: 'Bookmarked successfully', result });
    } catch (err) {
        res.status(500).send({ message: 'Internal server error', error: err });
    }
});


// delete user bookmark using id
app.delete('/users/:email/bookmarks/:id', async (req, res) => {
  const email = req.params.email;
  const bookmarkId = req.params.id;

  try {
      const result = await usersCollection.updateOne(
          { email: email },
          { $pull: { bookmarked: { id: bookmarkId } } }
      );

      if (result.modifiedCount === 0) {
          return res.status(404).send({ message: 'Bookmark not found or already deleted' });
      }

      res.send({ message: 'Bookmark deleted successfully',result });
  } catch (error) {
      console.error('Error deleting bookmark:', error);
      res.status(500).send({ message: 'An error occurred', error });
  }
});



//Project Components ===================================================================================================================

    //add project components to user profile
    app.patch('/users/components/:email', async (req, res) => {
      const { email } = req.params;
      const {  components } = req.body;
       

      try {
          const filter = { email };
          const update = { $push: { ["components"]: components } };
          const result = await usersCollection.updateOne(filter, update);
          // console.log(result)
          if (result.matchedCount === 0) {
              return res.status(404).send({ message: 'user not found' });
          }
  
          
          res.send({ message: 'Components added successfully', result });
      } catch (err) {
          res.status(500).send({ message: 'Internal server error', error: err });
      }
  }); 


//add project components to components database
  app.post('/components',async(req, res)=>{
    const {components} = req.body;
    const result = await componentsCollection.insertOne(components);
    res.send(result);
  })

//Get all componets 
  app.get('/components',async(req, res) => {
    const result= await componentsCollection.find().toArray();
    res.send(result);
  })



    
  //  a user edit his/her project components data
  
  app.patch('/users/:email/components/:id', async (req, res) => {
    const contributionId = req.params.id;
    const { resource } = req.body;
    const filter = {id: contributionId}
    const updated = {
      $set: {
        id: resource.id,
        title: resource.title,
        contact: resource.contact,
        price: resource.price,
        sale: resource.sale,
        projectImg: resource.projectImg,
        description: resource.description,
        authorName: resource.authorName,
        authorImg: resource.authorImg,
      }
    }
 console.log(updated)
    try {
      const result = await componentsCollection.updateOne(filter,updated);
  
      if (result.modifiedCount === 0) {
        return res.status(404).send({ message: 'Components not found or already updated' });
      }
  
      res.send({ message: 'Updated successfully', result });
    } catch (error) {
      console.error('Error updating:', error);
      res.status(500).send({ message: 'An error occurred', error });
    }
  });






//course Update CSE=================================================================================================================

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
  


  
   
//edit course details with users
app.patch('/courses/:courseCode/resources/:resourceId', async (req, res) => {
  const { courseCode, resourceId } = req.params;
  const {  contentType, resource } = req.body;

  if (!['Playlist', 'Note', 'questionBank', 'other'].includes(contentType)) {
      return res.status(400).send({ message: 'Invalid Content Name' });
  }

  try {
      const filter = {
          courseCode,
          [`${contentType}.id`]: resourceId,
          
      };
      const update = {
          $set: {
              [`${contentType}.$`]: resource
          }
      };
      const result = await courseCollection.updateOne(filter, update);

      if (result.matchedCount === 0) {
          return res.status(404).send({ message: 'Resource or course not found' });
      }

      res.send({ message: 'Resource updated successfully', result });
  } catch (err) {
      res.status(500).send({ message: 'Internal server error', error: err });
  }
});




  app.get('/cseCourses',async(req, res) => {
    const result= await courseCollection.find().toArray();
   res.send(result);
  })


  //EEE    ========================================================================================================================

  app.get('/eeeCourses',async(req, res) => {
    const result= await courseCollectionEee.find().toArray();
   res.send(result);
  })
   


  app.patch('/coursesEee/:courseCode', async (req, res) => {
    const { courseCode } = req.params;
    const { contentType, resource } = req.body;
  

    if (!['Playlist', 'Note', 'questionBank', 'other'].includes(contentType)) {
        return res.status(400).send({ message: 'Invalid Content Name' });
    }

    try {
        const filter = { courseCode };
        const update = { $push: { [contentType]: resource } };
        const result = await courseCollectionEee.updateOne(filter, update);

        if (result.matchedCount === 0) {
            return res.status(404).send({ message: 'Course not found' });
        }

        
        res.send({ message: 'Resource added successfully', result });
    } catch (err) {
        res.status(500).send({ message: 'Internal server error', error: err });
    }
});




 
//edit course details with users
app.patch('/coursesEee/:courseCode/resources/:resourceId', async (req, res) => {
const { courseCode, resourceId } = req.params;
const {  contentType, resource } = req.body;

if (!['Playlist', 'Note', 'questionBank', 'other'].includes(contentType)) {
    return res.status(400).send({ message: 'Invalid Content Name' });
}

try {
    const filter = {
        courseCode,
        [`${contentType}.id`]: resourceId,
        
    };
    const update = {
        $set: {
            [`${contentType}.$`]: resource
        }
    };
    const result = await courseCollectionEee.updateOne(filter, update);

    if (result.matchedCount === 0) {
        return res.status(404).send({ message: 'Resource or course not found' });
    }

    res.send({ message: 'Resource updated successfully', result });
} catch (err) {
    res.status(500).send({ message: 'Internal server error', error: err });
}
});








  // Pharmacy Department =========================================================================================================

   

  app.get('/pharmaCourses',async(req, res) => {
    const result= await courseCollectionPharma.find().toArray();
   res.send(result);
  })
   


  app.patch('/coursesPharma/:courseCode', async (req, res) => {
    const { courseCode } = req.params;
    const { contentType, resource } = req.body;
  

    if (!['Playlist', 'Note', 'questionBank', 'other'].includes(contentType)) {
        return res.status(400).send({ message: 'Invalid Content Name' });
    }

    try {
        const filter = { courseCode };
        const update = { $push: { [contentType]: resource } };
        const result = await courseCollectionPharma.updateOne(filter, update);

        if (result.matchedCount === 0) {
            return res.status(404).send({ message: 'Course not found' });
        }

        
        res.send({ message: 'Resource added successfully', result });
    } catch (err) {
        res.status(500).send({ message: 'Internal server error', error: err });
    }
});




 
//edit course details with users
app.patch('/coursesPharma/:courseCode/resources/:resourceId', async (req, res) => {
const { courseCode, resourceId } = req.params;
const {  contentType, resource } = req.body;

if (!['Playlist', 'Note', 'questionBank', 'other'].includes(contentType)) {
    return res.status(400).send({ message: 'Invalid Content Name' });
}

try {
    const filter = {
        courseCode,
        [`${contentType}.id`]: resourceId,
        
    };
    const update = {
        $set: {
            [`${contentType}.$`]: resource
        }
    };
    const result = await courseCollectionPharma.updateOne(filter, update);

    if (result.matchedCount === 0) {
        return res.status(404).send({ message: 'Resource or course not found' });
    }

    res.send({ message: 'Resource updated successfully', result });
} catch (err) {
    res.status(500).send({ message: 'Internal server error', error: err });
}
});









  // Clubs ========================================================================================================================

  app.get('/clubs',async(req, res) => {
    const result= await clubsCollection.find().toArray();
    res.send(result);
  })









//LIkes Integrated Here ===========================================================================================================

  
// Add this to your server routes
app.post('/courses/:courseCode/:contentType/:playlistId/like', async (req, res) => {
  const { courseCode,contentType, playlistId } = req.params;
  const userEmail = req.body.email;
  const authorEmail = req.body.authorEmail;
 
  try {
    const result = await courseCollection.updateOne(
      { 'courseCode': courseCode, [`${contentType}.id`]: playlistId },
      { 
        $addToSet: { [`${contentType}.$.likes`]: userEmail },
        $inc: { [`${contentType}.$.star`]: 1 }
      }
    );
  //user profile 
    const result2 = await usersCollection.updateOne(
      { 'email': authorEmail, ['myContribution.id']: playlistId },
      { 
        $addToSet: { 'myContribution.$.likes': userEmail },
        $inc: { 'myContribution.$.star': 1 }
      }
    );
    res.send({result,result2});


  } catch (error) {
    res.status(500).send({ message: 'An error occurred', error });
  }  
});

app.delete('/courses/:courseCode/:contentType/:playlistId/unlike', async (req, res) => {
  const { courseCode,contentType, playlistId } = req.params;
  const userEmail = req.body.email;
  const authorEmail = req.body.authorEmail;

  try {
    const result = await courseCollection.updateOne(
      { 'courseCode': courseCode, [`${contentType}.id`]: playlistId },
      { 
        $pull: { [`${contentType}.$.likes`]: userEmail },
        $inc: { [`${contentType}.$.star`]: -1 }
      }
    );
    
    const result2 = await usersCollection.updateOne(
      { 'email': authorEmail, ['myContribution.id']: playlistId  },
      { 
        $pull: { 'myContribution.$.likes': userEmail },
        $inc: { 'myContribution.$.star': -1 }
      }
    );


    res.send({result,result2});
  } catch (error) {
    res.status(500).send({ message: 'An error occurred', error });
  }
});






//LIkes Integrated Here EEE ===========================================================================================================

  
// Add this to your server routes
app.post('/coursesEEE/:courseCode/:contentType/:playlistId/like', async (req, res) => {
  const { courseCode,contentType, playlistId } = req.params;
  const userEmail = req.body.email;
  const authorEmail = req.body.authorEmail;
 
  try {
    const result = await courseCollectionEee.updateOne(
      { 'courseCode': courseCode, [`${contentType}.id`]: playlistId },
      { 
        $addToSet: { [`${contentType}.$.likes`]: userEmail },
        $inc: { [`${contentType}.$.star`]: 1 }
      }
    );
  //user profile 
    const result2 = await usersCollection.updateOne(
      { 'email': authorEmail, ['myContribution.id']: playlistId },
      { 
        $addToSet: { 'myContribution.$.likes': userEmail },
        $inc: { 'myContribution.$.star': 1 }
      }
    );
    res.send({result,result2});


  } catch (error) {
    res.status(500).send({ message: 'An error occurred', error });
  }  
});

app.delete('/coursesEEE/:courseCode/:contentType/:playlistId/unlike', async (req, res) => {
  const { courseCode,contentType, playlistId } = req.params;
  const userEmail = req.body.email;
  const authorEmail = req.body.authorEmail;

  try {
    const result = await courseCollectionEee.updateOne(
      { 'courseCode': courseCode, [`${contentType}.id`]: playlistId },
      { 
        $pull: { [`${contentType}.$.likes`]: userEmail },
        $inc: { [`${contentType}.$.star`]: -1 }
      }
    );
    
    const result2 = await usersCollection.updateOne(
      { 'email': authorEmail, ['myContribution.id']: playlistId  },
      { 
        $pull: { 'myContribution.$.likes': userEmail },
        $inc: { 'myContribution.$.star': -1 }
      }
    );


    res.send({result,result2});
  } catch (error) {
    res.status(500).send({ message: 'An error occurred', error });
  }
});









//LIkes Integrated Here Pharmacy ===========================================================================================================

  
// Add this to your server routes
app.post('/coursesPharma/:courseCode/:contentType/:playlistId/like', async (req, res) => {
  const { courseCode,contentType, playlistId } = req.params;
  const userEmail = req.body.email;
  const authorEmail = req.body.authorEmail;
 
  try {
    const result = await courseCollectionPharma.updateOne(
      { 'courseCode': courseCode, [`${contentType}.id`]: playlistId },
      { 
        $addToSet: { [`${contentType}.$.likes`]: userEmail },
        $inc: { [`${contentType}.$.star`]: 1 }
      }
    );
  //user profile 
    const result2 = await usersCollection.updateOne(
      { 'email': authorEmail, ['myContribution.id']: playlistId },
      { 
        $addToSet: { 'myContribution.$.likes': userEmail },
        $inc: { 'myContribution.$.star': 1 }
      }
    );
    res.send({result,result2});


  } catch (error) {
    res.status(500).send({ message: 'An error occurred', error });
  }  
});

app.delete('/coursesPharma/:courseCode/:contentType/:playlistId/unlike', async (req, res) => {
  const { courseCode,contentType, playlistId } = req.params;
  const userEmail = req.body.email;
  const authorEmail = req.body.authorEmail;

  try {
    const result = await courseCollectionPharma.updateOne(
      { 'courseCode': courseCode, [`${contentType}.id`]: playlistId },
      { 
        $pull: { [`${contentType}.$.likes`]: userEmail },
        $inc: { [`${contentType}.$.star`]: -1 }
      }
    );
    
    const result2 = await usersCollection.updateOne(
      { 'email': authorEmail, ['myContribution.id']: playlistId  },
      { 
        $pull: { 'myContribution.$.likes': userEmail },
        $inc: { 'myContribution.$.star': -1 }
      }
    );


    res.send({result,result2});
  } catch (error) {
    res.status(500).send({ message: 'An error occurred', error });
  }
});


















 
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