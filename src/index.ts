import express, { Application, Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import {
  MongoClient,
  ServerApiVersion,
  Collection,
  Document,
  ObjectId,
} from "mongodb";

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
app.get(
  "/projects",
  async (
    req: Request<{}, {}, {}, GetProjectsQuery>,
    res: Response,
  ): Promise<void> => {
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
        error: error instanceof Error ? error.message : error,
      });
    }
  },
);
app.get(
  "/projects/:id",
  async (req: Request<{ id: string }>, res: Response): Promise<void> => {
    try {
      const id = req.params.id;

      // Check for valid hex formatting bindings
      if (!ObjectId.isValid(id)) {
        res.status(400).send({
          message: "Invalid hex memory reference schema index identifier.",
        });
        return;
      }

      const query = { _id: new ObjectId(id) };
      const result = await projectsColl.findOne(query);

      if (!result) {
        res.status(404).send({
          message:
            "Target project metrics block not found in cluster database arrays.",
        });
        return;
      }

      res.status(200).send(result);
    } catch (error) {
      res.status(500).send({
        message: "Internal TS engine details pipeline crash",
        error: error instanceof Error ? error.message : error,
      });
    }
  },
);
app.post(
  "/projects/:id/review",
  async (req: Request<{ id: string }>, res: Response): Promise<void> => {
    try {
      const id = req.params.id;
      const { username, rating, comment } = req.body;

      if (!ObjectId.isValid(id)) {
        res
          .status(400)
          .send({ message: "Invalid hex identifier memory index." });
        return;
      }

      if (!username || !rating || !comment) {
        res.status(400).send({
          message:
            "Missing explicit review metrics parameters validation logs.",
        });
        return;
      }

      const query = { _id: new ObjectId(id) };

      // Custom internal validation object allocation binding
      const newReview = {
        username,
        rating: Number(rating),
        comment,
        createdAt: new Date(),
      };

      // Updating document array structure via push action block configuration
      const result = await projectsColl.updateOne(query, {
        $push: { reviews: newReview } as any,
      });

      if (result.matchedCount === 0) {
        res.status(404).send({
          message:
            "Target metrics build not found inside cloud matrix index repository.",
        });
        return;
      }

      res.status(201).send({
        message:
          "Review stream pipeline recorded successfully inside database node cluster.",
        review: newReview,
      });
    } catch (error) {
      res.status(500).send({
        message: "Internal review data system process pipeline failure",
        error,
      });
    }
  },
);
app.post(
  "/create/project",
  async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        title,
        description,
        userId,
        tech,
        difficulty,
        author,
        rating,
        imageUrl,
        liveUrl,
        githubUrl,
      } = req.body;

      if (
        !title ||
        !userId ||
        !description ||
        !tech ||
        !difficulty ||
        !author ||
        !imageUrl ||
        !liveUrl
      ) {
        res
          .status(400)
          .send({ message: "All required fields must be provided." });
        return;
      }

      const newProject = {
        title,
        userId,
        description,
        tech: Array.isArray(tech)
          ? tech
          : tech.split(",").map((t: string) => t.trim()),
        difficulty,
        author,
        rating: rating ? Number(rating) : 5.0,
        imageUrl,
        liveUrl,
        githubUrl: githubUrl || "",
        createdAt: new Date(),
      };

      const result = await projectsColl.insertOne(newProject);
      res.status(201).send({
        message: "Project added successfully",
        projectId: result.insertedId,
      });
    } catch (error) {
      res.status(500).send({
        message: "Failed to add project to database",
        error: error instanceof Error ? error.message : error,
      });
    }
  },
);

app.delete(
  "/projects/:id",
  async (req: express.Request, res: express.Response): Promise<void> => {
    try {
      const { id } = req.params;

      if (!ObjectId.isValid(id)) {
        res.status(400).send({ message: "Invalid project ID format." });
        return;
      }

      const result = await projectsColl.deleteOne({ _id: new ObjectId(id) });

      if (result.deletedCount === 0) {
        res.status(404).send({ message: "Project not found." });
        return;
      }

      res.status(200).send({ message: "Project deleted successfully." });
    } catch (error) {
      res.status(500).send({
        message: "Failed to delete project",
        error: error instanceof Error ? error.message : error,
      });
    }
  },
);

app.patch(
  "/projects/:id",
  async (req: express.Request, res: express.Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { title, author, difficulty, liveUrl,imageUrl } = req.body;

      if (!ObjectId.isValid(id)) {
        res.status(400).send({ message: "Invalid project ID format." });
        return;
      }
      if (!title || !author || !difficulty || !liveUrl||!imageUrl) {
        res
          .status(400)
          .send({ message: "All fields are required for updates." });
        return;
      }

      const updatedProject = {
        title,
        author,
        difficulty,
        liveUrl,
        imageUrl
      };

      const result = await projectsColl.updateOne(
        { _id: new ObjectId(id) },
        { $set: updatedProject },
      );

      if (result.matchedCount === 0) {
        res.status(404).send({ message: "Project not found." });
        return;
      }

      res
        .status(200)
        .send({ message: "Project updated successfully.", updatedProject });
    } catch (error) {
      res.status(500).send({
        message: "Failed to update project",
        error: error instanceof Error ? error.message : error,
      });
    }
  },
);
app.listen(port, () => {
  console.log(`DevLaunch Server running on port ${port}`);
});
