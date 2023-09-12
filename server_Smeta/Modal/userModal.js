const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/smeta')

const userSchema = mongoose.Schema({
    username:{
        type: String,
        required:true,
        minlength:6,
        maxlength:20,
        unique:true
    },
    password:{
        type: String,
        required:true,
        minlength:6,
    },
    role : {
        type: String,
        default : 'user'
    },
    email : {
        type:String
    },
    refreshToken:{
        type:String,
        default: null
    },
    code: {
        type:String,
        default:null
    },
    language:{
        type:String,
        default:'vietnam'
    },
    phone :{
        type:Number
    },
    totleMoney:{
        type:Number,
        default:0
    },
    acction :{
        type:[]
    }
},{collection:'user'})

const userModal = mongoose.model("user",userSchema)
module.exports = userModal