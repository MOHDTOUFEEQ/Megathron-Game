import conf from '../conf/conf.js';
import { Client, Account, ID, Databases, Query } from "appwrite";

class AuthService {
    client = new Client();
    account;
    databases;

    constructor() {
        this.client
            .setEndpoint(conf.appwriteUrl)
            .setProject(conf.appwriteProjectId);
        this.account = new Account(this.client);
        this.databases = new Databases(this.client);
    }

    // Get the high score by username
    async getHighScoreByUsername(username) {
        try {
            const res = await this.databases.listDocuments(
                conf.appwriteDatabaseId,
                conf.appwriteCollectionId,
                [Query.equal("username", [username])]
            );

            if (res.documents.length > 0) {
                return res.documents[0].score;
            } else {
                throw new Error("User not found.");
            }
        } catch (error) {
            console.log("Error in getHighScoreByUsername:", error);
            throw error;
        }
    }

    // Update the user's score if the new score is higher
    async updateUserScore(username, newScore) {
        try {
            // Query the database for the user by username
            const query = Query.equal("username", [username]);
            const res = await this.databases.listDocuments(
                conf.appwriteDatabaseId,
                conf.appwriteCollectionId,
                [query]
            );

            // Check if user exists
            if (res.documents.length > 0) {
                // Retrieve the document ID
                const documentId = res.documents[0].$id;

                // Update the user's score with the documentId
                const updatedDoc = await this.databases.updateDocument(
                    conf.appwriteDatabaseId,
                    conf.appwriteCollectionId,
                    documentId,
                    {
                        score: newScore
                    }
                );

                // Return the updated score
                return updatedDoc.score;
            } else {
                throw new Error("User not found.");
            }
        } catch (error) {
            console.log("Error in updateUserScoreByUsername:", error);
            throw error;
        }
    }

    // Add a new user and score
    async addUserScore(username, score) {
        try {
            console.log("addUserScore called for:", username, score);
            
            // First check if user already exists
            const query = Query.equal("username", [username]);
            const existingUsers = await this.databases.listDocuments(
                conf.appwriteDatabaseId,
                conf.appwriteCollectionId,
                [query]
            );

            if (existingUsers.documents.length > 0) {
                console.log("User already exists, skipping addUserScore");
                return existingUsers.documents[0].score;
            }

            console.log("Creating new user:", username);
            // User doesn't exist, create new entry
            const newUserDoc = await this.databases.createDocument(
                conf.appwriteDatabaseId,
                conf.appwriteCollectionId,
                ID.unique(),
                {
                    username,
                    score
                }
            );

            return newUserDoc.score;
        } catch (error) {
            console.log("Error in addUserScore:", error);
            throw error;
        }
    }

    // Create a post profile for a user
    async createPostProfile(paramID, { username, score = 0 }) {
        try {
            return await this.databases.createDocument(
                conf.appwriteDatabaseId,
                conf.appwriteCollectionId,
                paramID,
                {
                    username: username,
                    score: score,
                }
            );
        } catch (error) {
            console.log("Error in createPostProfile:", error);
            throw error;
        }
    }

    // Get all user scores
    async getAllUserScores() {
        try {
            const response = await this.databases.listDocuments(
                conf.appwriteDatabaseId, // Your Database ID
                conf.appwriteCollectionId // Your Collection ID
            );
            return response.documents; // Returns the list of documents
        } catch (error) {
            console.log("Error fetching user scores:", error);
            throw new Error("Failed to fetch user scores.");
        }
    }
}

const authService = new AuthService();

export default authService;
