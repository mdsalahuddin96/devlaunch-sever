import express, { Application, Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import {
  MongoClient,
  ServerApiVersion,
  Collection,
  Document,
  ObjectId,
} from "mongodb";

const { createRemoteJWKSet, jwtVerify } = require("jose-cjs");

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
  page?: string;
}
interface DashboardQuery {
  userId?: string;
}

const verifyToken = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    res.status(401).send({
      success: false,
      message: "Unauthorized Access",
    });
    return;
  }
  const token = authHeader.split(" ")[1];
  if (!token) {
    res.status(401).send({
      success: false,
      message: "Access token missing.",
    });
    return;
  }
  try {
    const JWKS = createRemoteJWKSet(
      new URL(`${process.env.CLIENT_URL}/api/auth/jwks`),
    );
    const { payload } = await jwtVerify(token, JWKS);
    next();
  } catch (error) {
    console.error("Token validation failed:", error);
    return res.status(403).json({
      success: false,
      message: "Forbidden to access",
    });
  }
};

// Pure ESM Interface with strict route parameter casting
app.get(
  "/projects",
  async (
    req: Request<{}, {}, {}, GetProjectsQuery>,
    res: Response,
  ): Promise<void> => {
    try {
      const { search, tech, difficulty, page } = req.query;
      let query: Record<string, any> = {};
      const currentPage = parseInt(page || "1", 10) || 1;
      const limit = 12;
      const skipItem = (currentPage - 1) * limit;

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
      
      const totalProject = await projectsColl.countDocuments(query);
      const totalPages = Math.ceil(totalProject / limit);
      
      const projects = await projectsColl
        .find(query)
        .skip(skipItem)
        .limit(limit)
        .toArray();
        
      res.status(200).send({ projects, currentPage, totalProject, totalPages });
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
  verifyToken,
  async (req: Request<{ id: string }>, res: Response): Promise<void> => {
    try {
      const id = req.params.id;
      // Check for valid hex formatting bindings
      if (!ObjectId.isValid(id)) {
        res.status(401).send({
          message: "Invalid hex memory reference schema index identifier.",
        });
        return;
      }

      const query = { _id: new ObjectId(id) };
      const result = await projectsColl.findOne(query);

      if (!result) {
        res.status(403).send({
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
// manage page user project
app.get(
  "/user/project/:id",verifyToken,
  async (req: Request<{ id: string }>, res: Response): Promise<void> => {
    try {
      const id = req.params.id;

      // Check for valid hex formatting bindings
      if (!ObjectId.isValid(id)) {
        res.status(401).send({
          message: "Invalid hex memory reference schema index identifier.",
        });
        return;
      }

      const query = { userId: id };
      const result = await projectsColl.find(query).toArray();

      if (!result) {
        res.status(403).send({
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
  verifyToken,
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
  verifyToken,
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
  verifyToken,
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
  verifyToken,
  async (req: express.Request, res: express.Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { title, author, difficulty, liveUrl, imageUrl } = req.body;

      if (!ObjectId.isValid(id)) {
        res.status(400).send({ message: "Invalid project ID format." });
        return;
      }
      if (!title || !author || !difficulty || !liveUrl || !imageUrl) {
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
        imageUrl,
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
// Dashboard Statistic
app.get(
  "/api/dashboard/stats",
  verifyToken,
  async (
    req: Request<{}, {}, {}, DashboardQuery>,
    res: Response,
  ): Promise<void> => {
    try {
      const { userId } = req.query;
      if (!userId || !ObjectId.isValid(userId)) {
        res.status(400).send({
          message: "Invalid hex memory reference schema user identifier.",
        });
        return;
      }
      const query = { userId: userId };
      const userProjects = await projectsColl.find(query).toArray();
      if (!userProjects || userProjects.length === 0) {
        res.status(200).send({
          success: true,
          stats: { totalProjects: 0, totalReviews: 0, avgRating: 0 },
          recentReviews: [],
          techDistribution: [],
        });
        return;
      }
      const totalProjects = userProjects.length;
      let totalReviewsCount = 0;
      let sumOfRatings = 0;
      let allReviews: any[] = [];
      const techCounts: Record<string, number> = {};
      const weeklyUploads: Record<string, number> = {
        "Week 1": 0,
        "Week 2": 0,
        "Week 3": 0,
        "Week 4": 0,
      };
      userProjects.forEach((project: any) => {
        if (project.reviews && Array.isArray(project.reviews)) {
          totalReviewsCount += project.reviews.length;
          project.reviews.forEach((rev: any) => {
            sumOfRatings += rev.rating;
            allReviews.push({
              projectTitle: project.title,
              username: rev.username,
              rating: rev.rating,
              comment: rev.comment,
              createdAt: rev.createdAt?.$date || rev.createdAt,
            });
          });
        }
        if (project.tech && Array.isArray(project.tech)) {
          project.tech.forEach((t: string) => {
            techCounts[t] = (techCounts[t] || 0) + 1;
          });
        }
        const date = new Date(project.createdAt);
        const day = date.getDate();
        let week = "Week 4";
        if (day <= 7) week = "Week 1";
        else if (day <= 14) week = "Week 2";
        else if (day <= 21) week = "Week 3";
        weeklyUploads[week] = (weeklyUploads[week] ?? 0) + 1;
      });

      const avgRating =
        totalReviewsCount > 0
          ? (sumOfRatings / totalReviewsCount).toFixed(1)
          : 0;
      const recentReviews = allReviews
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        )
        .slice(0, 3);
      const techDistribution = Object.keys(techCounts).map((tech) => ({
        name: tech,
        value: techCounts[tech],
      }));
      const activityTrendData = Object.keys(weeklyUploads).map((week) => ({
        name: week,
        uploads: weeklyUploads[week],
        interactions:
          (weeklyUploads[week] ?? 0) + Math.round(totalReviewsCount / 4),
      }));
      res.status(200).send({
        success: true,
        stats: {
          totalProjects,
          totalReviews: totalReviewsCount,
          avgRating: Number(avgRating),
        },
        recentReviews,
        techDistribution,
        activityTrendData,
      });
    } catch (error) {
      res.status(500).send({
        message: "Internal TS engine dashboard metrics pipeline crash",
        error: error instanceof Error ? error.message : error,
      });
    }
  },
);
app.listen(port, () => {
  console.log(`DevLaunch Server running on port ${port}`);
});
