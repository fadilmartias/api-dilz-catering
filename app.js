import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import AdminRoute from './routes/Admin/Route.js'
import AuthRoute from './routes/Auth/Route.js'
import dotenv from "dotenv";
import cookieParser from 'cookie-parser'
import bodyParser from 'body-parser'

const app = express()
const port = 5000

// app config
dotenv.config();
app.disable('x-powered-by')
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
  res.send("Api Siap");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}, http://127.0.0.1:${port}`)
})