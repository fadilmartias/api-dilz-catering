import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import AdminRoute from './routes/Admin/Route.js'
import AuthRoute from './routes/Auth/Route.js'
import dotenv from "dotenv";
import cookieParser from 'cookie-parser'
import bodyParser from 'body-parser'
import { db } from "./config/database.js";


const app = express()
const port = 8080

// app config
dotenv.config();
app.disable('x-powered-by')
app.set('port', port);
app.use(helmet())
app.use(cors({
  origin: '*',  
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}))
app.use(cookieParser());
app.use(bodyParser.json());
app.use(express.json())

// routes
// app.use('/auth', AuthRoute)
app.use('/admin', AdminRoute)
app.use('/auth', AuthRoute)
app.get("/", (req, res) => {
  res.send("Api Siap2");
});
app.get("/db", async (req, res) => {
  let conn;
  try {
    conn = await db.getConnection();
    // Perform any database operations if needed

    // Respond with a success message
    res.status(200).json({ message: "Database connection successful" });
  } catch (error) {
    console.error("Error getting database connection:", error);
    res.status(500).json({ message: "Failed to connect to the database", error: error.message });
  } finally {
    if (conn) {
      conn.release(); // Close the connection
    }
  }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}, http://127.0.0.1:${port}`)
})