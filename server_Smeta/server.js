var express = require('express')
var bodyParser = require('body-parser')
var cors = require('cors')
var app = express()
const authRouter = require('./Router/auth')
const password = require('./Router/password')
const dotenv = require("dotenv")
const cookieParser = require('cookie-parser');
dotenv.config()
app.use(bodyParser.urlencoded({ extended: false }))
app.use(cors())
app.use(bodyParser.json())

app.use(cookieParser());
app.use("/auth",authRouter)  
app.use("/pass",password)  
app.listen(5000,()=>{
    console.log("server is running")
})