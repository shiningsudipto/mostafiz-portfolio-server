const express = require('express');
const cors = require('cors');
require('dotenv').config();
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = 5000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.json("Fizz balling");
});


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_SECRET}@cluster0.kh5m3gl.mongodb.net/?retryWrites=true&w=majority`;

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
        // Connect the client to the server	(optional starting in v4.7)
        // await client.connect();

        const projectsCollection = client.db('fizz').collection('projects');
        const blogsCollection = client.db('fizz').collection('blogs');

        app.get('/allProjects', async (req, res) => {
            const result = await projectsCollection.find().toArray();
            res.json(result);
        })

        app.get('/projectById/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await projectsCollection.findOne(query);
            res.json(result);
        })

        app.post('/addProject', async (req, res) => {
            const newProject = req.body;
            const result = await projectsCollection.insertOne(newProject);
            res.json(result);
        })

        app.put('/updateProject/:id', async (req, res) => {
            const id = req.params.id;
            const updatedProject = req.body;
            const filter = { _id: new ObjectId(id) };
            const options = { upsert: true };
            const project = {
                $set: {
                    projectName: updatedProject.projectName,
                    technology: [updatedProject.technology],
                    keyFeatures: [updatedProject.keyFeatures],
                    pattern: updatedProject.pattern,
                    architectureApproach: updatedProject.architectureApproach,
                    description: updatedProject.description,
                    githubLink: updatedProject.githubLink,
                    imageLink: updatedProject.imageLink,
                }
            }
            const result = await projectsCollection.updateOne(filter, project, options);
            res.json(result);
        })

        app.post('/addBlog', async (req, res) => {
            const newProject = req.body;
            const result = await blogsCollection.insertOne(newProject);
            res.json(result);
        })

        app.get('/allBlogs', async (req, res) => {
            const result = await blogsCollection.find().toArray();
            res.json(result);
        })


        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.listen(port, () => {
    console.log(`server is running on port ${port}`)
});