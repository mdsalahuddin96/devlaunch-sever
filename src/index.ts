import express, { Application, Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { MongoClient, ServerApiVersion, Collection, Document } from "mongodb";

// Configuration processing
dotenv.config();

const port: number | string = process.env.PORT || 5000;
const app: Application = express();

app.use(express.json());
app.use(cors());

const uri: string = process.env.MONGODB_URI as string;
const client: MongoClient = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

// Explicit TS Types Allocation Matrix for MongoDB Collection
let projectsColl: Collection<Document>;

async function run(): Promise<void> {
  try {
    await client.connect();
    const db = client.db("devlaunch");
    projectsColl = db.collection("projects");
  } catch (error) {
    console.error("Database Connection Error:", error);
  }
}
run().catch(console.dir);

// Custom Interfaces for Request Queries Type Casting
interface GetProjectsQuery {
  search?: string;
  tech?: string;
  difficulty?: string;
}

// Pure ESM Interface with strict route parameter casting
app.get("/projects", async (req: Request<{}, {}, {}, GetProjectsQuery>, res: Response): Promise<void> => {
  try {
    const { search, tech, difficulty } = req.query;
    let query: Record<string, any> = {};

    // 1. Text Search Regex Evaluation
    if (search) {
      query.title = { $regex: search, $options: "i" };
    }

    // 2. Double Filtering Engine: Tech Stack Alignment Matrix
    if (tech && tech !== "All") {
      query.tech = tech; 
    }

    if (difficulty && difficulty !== "All") {
      query.difficulty = difficulty;
    }

    const result = await projectsColl.find(query).toArray();
    res.status(200).send(result);
  } catch (error) {
    res.status(500).send({ 
      message: "Internal TS server matrix failure", 
      error: error instanceof Error ? error.message : error 
    });
  }
});

app.listen(port, () => {
  console.log(`DevLaunch Server running on port ${port}`);
});