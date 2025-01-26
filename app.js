

// const express = require('express');
// const app = express();
// const userModel= require("./models/user"); 
// const postModel= require("./models/post");
// const cookieparser = require('cookie-parser');

// app.set('view engine', 'ejs');
// app.use(express.urlencoded({ extended: true }));
// const bcrypt=require('bcrypt');
// const jwt = require('jsonwebtoken');

// app.get('/', (req, res) => {
//     // console.log("hey");
//     res.render("index");

//     // res.send("hey")
// });
// app.get('/login', (req, res) => {
//     // console.log("hey");
//     res.render("login");

//     // res.send("hey")
// });
// app.post('/register',async(req,res) =>{
//     let {name , username , age , email , password}=req.body;
//     let user= await userModel.findOne({email});
//     if(user) return res.send(500).send("user already registerd");

//     bcrypt.genSalt(10,(err,salt)=>{
//         bcrypt.hash(password,salt,async(err,hash)=>{
//           let user= await userModel.create({
//                 name,
//                 username,
//                 age,
//                 email,
//                 password
//             });

//             let token=jwt.sign({email:email,userid:user._id},"shhhh");
//             res.cookie("token",token);
//             res.send("registered");

//         })
//     })

// })
// // app.post('/login',async(req,res) =>{
// //     let { email , password}=req.body;
// //     let user= await userModel.findOne({email});
// //     if(!user) return res.send(500).send("something went wrong");

// //     bcrypt.compare(password,user.password,function(err,result){
// //         if(result) res.status(200).send("you can login");
// //         else res.redirect("/login");
// //     })

// // })


// app.post('/login', async (req, res) => {
//     try {
//         const { email, password } = req.body;

//         // Check if user exists
//         const user = await userModel.findOne({ email });
//         if (!user) {
//             console.log("User not found");
//             return res.status(404).send("User not found");
//         }

//         // Compare passwords
//         bcrypt.compare(password, user.password, (err, result) => {
//             if (err) {
//                 console.error("Error comparing passwords:", err);
//                 return res.status(500).send("Server error");
//             }

//             if (result) {
//                 let token=jwt.sign({email:email,userid:user._id},"shhhh");
//                 res.cookie("token",token);
//                 console.log("Password match. Login successful!");
//                 return res.status(200).send("You can login");
//             } else {
//                 console.log("Incorrect password");
//                 return res.status(401).send("Incorrect password");
//             }
//         });
//     } catch (error) {
//         console.error("Error in login route:", error);
//         return res.status(500).send("Something went wrong");
//     }
// });
// app.get('/logout',async(req,res)=>{
//      res.cookie("token","");
//      res.redirect('/login');
// })

// app.listen(2000, () => {
//     console.log("Server is running on port 2000");
// });

const express = require('express');
const app = express();
const mongoose = require('mongoose');
const userModel = require("./models/user");
const postModel = require("./models/post");
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
mongoose.set('strictPopulate', false);

// Middleware setup
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes

// Homepage
app.get('/', (req, res) => {
    res.render("index");
});

// Login page
app.get('/login', (req, res) => {
    res.render("login");
});

// Register user
app.post('/register', async (req, res) => {
    try {
        const { name, username, age, email, password } = req.body;

        // Check if the user already exists
        let user = await userModel.findOne({ email });
        if (user) {
            return res.status(400).send("User already registered");
        }

        // Hash the password before saving it to the database
        const hashedPassword = await bcrypt.hash(password, 10);
        console.log("Hashed Password:", hashedPassword);
        // Create the user
        user = await userModel.create({
            name,
            username,
            age,
            email,
            password: hashedPassword, // Save the hashed password
        });

        // Generate JWT token
        const token = jwt.sign({ email: email, userid: user._id }, "shhhh");

        // Set the token as a cookie
        res.cookie("token", token);
        res.status(201).send("Registered successfully");
    } catch (error) {
        console.error("Error in register route:", error);
        res.status(500).send("Server error");
    }
});

// Login user
app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if user exists
        const user = await userModel.findOne({ email });
        if (!user) {
            console.log("User not found");
            return res.status(404).send("User not found");
        }

        // Compare the provided password with the hashed password in the database
        const isMatch = await bcrypt.compare(password, user.password);

        if (isMatch) {
            // Generate JWT token
            const token = jwt.sign({ email: email, userid: user._id }, "shhhh");

            // Set the token as a cookie
            res.cookie("token", token);
            console.log("Password match. Login successful!");
            return res.status(200).redirect("/profile");
        } else {
            console.log("Incorrect password");
            return res.status(401).send("Incorrect password");
        }
    } catch (error) {
        console.error("Error in login route:", error);
        return res.status(500).send("Server error");
    }
});

// Logout user
app.get('/logout', async (req, res) => {
    res.cookie("token", ""); // Clear the token cookie
    res.redirect('/login'); // Redirect to login page
});

// app.get('/profile', isLoggedIn ,async (req, res) => {
//     res.cookie("token", ""); // Clear the token cookie
//     let user= await userModel.findOne({ email:req.user.email }).lean();
//     if (!user.posts) {
//         user.posts = []; // Ensure posts is an array if not set
//     }
//     console.log(user);
//     res.render("profile",{user}); // Redirect to profile page
// });
 
app.get('/profile', isLoggedIn, async (req, res) => {
    try {
        let user = await userModel.findOne({ email: req.user.email }).populate("posts");
        if (!user.posts) {
            user.posts = []; // Ensure posts is an array if not set
        }
        user.populate("posts")
        console.log(user);
        
        res.render("profile", { user });
    } catch (error) {
        console.error("Error fetching profile:", error);
        res.status(500).send("Server error");
    }
});
app.post('/post', isLoggedIn, async (req, res) => {
    try {
        let user = await userModel.findOne({ email: req.user.email }).lean();
        let{content}=req.body;
       let post =await  postModel.create({
            user:user._id,
            content:content
        })
        user.posts.push(post._id);
        await user.save();
        res.redirect("/profile");
        // if (!user.posts) {
        //     user.posts = []; // Ensure posts is an array if not set
        // }
        // console.log(user);
        // res.render("profile", { user });
    } catch (error) {
        console.error("Error fetching profile:", error);
        res.status(500).send("Server error");
    }
});


// function isLoggedIn(req,res,next){
//     if(req.cookies.token ==="")res.redirect("/login");
//     else{
//         let data = jwt.verify(req.cookies.token,"shhh");
//         req.user=data;
//     }
//     next();
// }
// app.post('/posts', isLoggedIn, async (req, res) => {
//     // try {
//         // Fetch the logged-in user's details
//         let user = await userModel.findOne({ email: req.user.email });

//         // if (!user) {
//         //     return res.status(404).send("User not found");
//         // }

//         // Destructure content from the request body
//         const { content } = req.body;

//         // if (!content || content.trim() === "") {
//         //     return res.status(400).send("Post content cannot be empty");
//         // }

//         // Create a new post
//         let post = await postModel.create({
//             user: user._id, // Associate post with the user
//             content: content,
//         });

//         // Ensure user's posts array exists before pushing
//         if (!user.posts) {
//             user.posts = []; // Initialize the array if not already
//         }
//         user.posts.push(post._id); // Add the post to the user's posts array

//         // Save the updated user data
//         await user.save();

//         // Redirect to the profile page after successful post creation
//         res.redirect("/profile");
//     // } catch (error) {
//     //     console.error("Error creating post:", error.message);

//     //     // Respond with a 500 status code if there's a server error
//     //     res.status(500).send("Server error");
//     // }
// });

function isLoggedIn(req, res, next) {
    const token = req.cookies.token; // Retrieve the token from cookies

    if (!token || token === "") {
        // If token is missing or empty, redirect to the login page
        return res.redirect("/login");
    }

    try {
        // Verify the token
        const data = jwt.verify(token, "shhhh"); // Replace "shhhh" with your secret
        req.user = data; // Attach user data to the request object
        next(); // Proceed to the next middleware or route
    } catch (error) {
        console.error("Invalid token:", error.message);
        return res.redirect("/login"); // Redirect to login if token is invalid
    }
}

// Start the server
app.listen(2000, () => {
    console.log("Server is running on port 3000");
});
