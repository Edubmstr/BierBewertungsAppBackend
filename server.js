import dotenv from 'dotenv';
import mysql from 'mysql2';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken'
import express from 'express';
import cors from 'cors';
import { getAllReviews, getSingleReviews, getUserReviews, createNewReview, createNewUser, checkIfUserNameExists, getUserPassword, getUserId } from './prismatest.js';
const app = express();
const router = express.Router();
app.use(cors());
app.use(express.json());
dotenv.config();
const port = process.env.PORT 
const jwtSecretKey = process.env.JWT_SECRET_KEY

//var adapter = new FileSync("./database.json");
//var db = low(adapter);

const pool = mysql.createPool(
    process.env.DATABASE_URL
);

app.get('/getdata', async (req, res) => {

    try {
        const resultData = await getAllReviews();
        res.send(resultData); 
    } catch (error) {
        res.sendStatus(500);
    }
    
});  

app.post('/userreviews', async (req, res) => {
    
    try {
        const resultData = await getUserReviews(req.body.user_id);
        res.send(resultData)
    } catch (error) {
        res.sendStatus(500);
    }
});  

app.post('/getentry', async (req, res) => {

    try {
        const resultData = await getSingleReviews(req.body.id);
        res.send(resultData)
    } catch (error) {
        res.sendStatus(500);
    }
        
}); 

app.post('/newentry', async (req, res) => {
    try {
        const resultData = await createNewReview(req.body);
        res.send(resultData);
    } catch (error) {
        res.sendStatus(500);
    }
});

app.post('/newuser', async (req,res) => {
    const { name, password, checkPassword } = req.body;

    try {
        if (!(await checkIfUserNameExists(name))){
           return res.status(500).json({message: "User already exists"});
        }
    } catch (error) {
        return res.sendStatus(500);
    }

    if(password === checkPassword){
        //check if user already exists in db
        bcrypt.hash(password, 10, async function(err, hash){
            try {
                await createNewUser({ "name" : name, "password" : hash});
            } catch (error) {
                return res.sendStatus(500);
            }
        });
    }else {
       return res.status(400).send({message : "Passwords do not match"});
    }
    res.sendStatus(200);
});

app.post('/validateuser', async (req,res) => {
    const { name, password } = req.body;
    let hashedPassword = null;

    try {
        if (await checkIfUserNameExists(name)){
            return res.status(500).json({message: "No user with corresponding username found"});
        }
    } catch (error) {
       return res.sendStatus(500);
    }

    try {
        hashedPassword = await getUserPassword(name);
    } catch (error) {
       return res.sendStatus(500);
    }

    bcrypt.compare(password, hashedPassword, async function(err, result){
        if (!result){
            return res.status(403).json({message : "Not authorized"});
        }else{
            let loginData = {
                name,
                signInTime: Date.now()
            }
            const userId = await getUserId(name);
            const token = jwt.sign(loginData, jwtSecretKey);
            res.status(200).json({ message: "Succesfully logged in.", "token" : token, "userId": userId.user_id});
        }
    })
});

app.post('/verifytoken', (req, res) => {
    const tokenHeaderKey = "jwt-token";
    const authToken = req.headers.authorization;
    try {
        const verified = jwt.verify(authToken, jwtSecretKey);
        if (verified) {
          return res
            .status(200)
            .json({ status: "logged in", message: "success" });
        } else {
          // Access Denied
          return res.status(401).json({ status: "invalid auth", message: "error" });
        }
      } catch (error) {
        // Access Denied
        return res.status(401).json({ status: "invalid auth", message: "error" });
      }
})

app.listen(port, () => {
    console.log(`Example app listening at http://127.0.0.1:${port}`)
});

