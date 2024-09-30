// import the MongoClient class from the mongodb module
import { MongoClient } from "mongodb";

// get the connection string from the environment variable
// if it's not set, use an empty string
const connectionString = process.env.ATLAS_URI || "";

// create a new MongoClient instance with the connection string

const client = new MongoClient(connectionString);

// try to connect to the database
try {
  await client.connect();
} catch (e) {
  console.error(e);
}

let db;

// get a reference to the "sample_training" database
db = client.db("Chatroom");

export default db;
