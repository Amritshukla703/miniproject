

const express = require('express');
const app = express();
const userModel= require("./models/user"); 
const postModel= require("./models/post");
const cookieparser = require('cookie-parser');

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
const bcrypt=require('bcrypt');
const jwt = require('jsonwebtoken');

app.get('/', (req, res) => {
    // console.log("hey");
    res.render("index");

    // res.send("hey")
});

app.post('/register',async(req,res) =>{
    let {name , username , age , email , password}=req.body;
    let user= await userModel.findOne({email});
    if(user) return res.send(500).send("user already registerd");

    bcrypt.gensalt(10,(err,salt)=>{
        bcrypt.hash(password,salt,async(err,hash)=>{
          let user= await userModel.create({
                name,
                username,
                age,
                email,
                password
            });

            let token=jwt.sign({email:email,userid:user._id},"shhhh");
            res.cookie("token",token);
            res.send("registered");

        })
    })

})

app.listen(2000, () => {
    console.log("Server is running on port 2000");
});
