import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken'
import express from 'express';
import cors from 'cors';
import { rateLimit } from 'express-rate-limit'
import cookieParser from 'cookie-parser';
import { getAllReviews, getSingleReviews, getUserReviews, createNewReview, createNewUser, checkIfUserNameExists, getUserPassword, getUserId, getLatestEntries, getCalculatedAverage, updateReview, deleteReview } from './prismatest.js';
const app = express();
const router = express.Router();
app.use(cors({credentials: true, origin: ['https://super-dieffenbachia-8a48cd.netlify.app', 'http://127.0.0.1:3000']}));
app.use(cookieParser());
app.use(express.json());
app.set('trust proxy', 1);
dotenv.config();
const port = process.env.PORT
const jwtSecretKey = process.env.JWT_SECRET_KEY
const jwtRefreshSecretKey = process.env.JWT_REFRESH_SECRET_KEY
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 150
})
app.use(limiter)

let now;
let lastChangedAt;

function updateLastChangedAt(){
    now = new Date();
    lastChangedAt  = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
}

function initialiseCachingHeaders(){
    updateLastChangedAt();
    console.log(now);
}

initialiseCachingHeaders();

app.use((req, res, next) => {

    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Last-modified', now);
    next();
})

function checkProvidedAccessToken(token){
    return jwt.verify(token, jwtSecretKey);
}

function checkProvidedRefreshToken(token){
    jwt.verify(token, jwtRefreshSecretKey);
}

app.get('/getdata', async (req, res) => {

    const authToken = req.headers.authorization;

    if(authToken === undefined){
        return res.status(401).send("Provide Token");
    }

    try {
        checkProvidedAccessToken(authToken)
    } catch (error) {
        return res.sendStatus(401);
    }

    if (new Date(req.headers['if-modified-since']) <= now) {
       // console.log('If-Modified-Since match, sending 304');
       return res.sendStatus(304);
      }

    try {
        const resultData = await getAllReviews();
        res.send(resultData);
    } catch (error) {
        res.sendStatus(500);
    }
    
});  

app.get('/userreviews/:user_id', async (req, res) => {

    const authToken = req.headers.authorization;

    if(authToken === undefined){
        return res.status(401).send("Provide Token");
    }

    try {
        checkProvidedAccessToken(authToken)
    } catch (error) {
        return res.sendStatus(401);
    }

    if (new Date(req.headers['if-modified-since']) <= lastChangedAt) {
        // console.log('If-Modified-Since match, sending 304');
        return res.sendStatus(304);
    }
    
    try {
        const resultData = await getUserReviews(parseInt(req.params["user_id"]));
        res.send(resultData)
    } catch (error) {
        res.sendStatus(500);
    }
});  

app.get('/getentry/:id', async (req, res) => {

    const authToken = req.headers.authorization;

    if(authToken === undefined){
        return res.status(401).send("Provide Token");
    }

    try {
        checkProvidedAccessToken(authToken)
    } catch (error) {
        return res.sendStatus(401);
    }

    if (new Date(req.headers['if-modified-since']) <= lastChangedAt) {
        // console.log('If-Modified-Since match, sending 304');
        return res.sendStatus(304);
       }

    try {
        const resultData = await getSingleReviews(parseInt(req.params["id"]));
        res.send(resultData)
    } catch (error) {
        res.sendStatus(500);
    }
        
}); 

app.post('/newentry', async (req, res) => {

    const authToken = req.headers.authorization;

    if(authToken === undefined){
        return res.status(401).send("Provide Token");
    }

    try {
        checkProvidedAccessToken(authToken)
    } catch (error) {
        return res.sendStatus(401);
    }

    try {
        const resultData = await createNewReview(req.body);
        updateLastChangedAt();
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
            return res.status(403).json({message : "Wrong password"});
        }else{
            let loginData = {
                name,
                signInTime: Date.now()
            }
            const userId = await getUserId(name);
            const token = jwt.sign(loginData, jwtSecretKey, {expiresIn: 10 * 5});
            const refreshToken = jwt.sign(loginData, jwtRefreshSecretKey);
            res.cookie("refreshtoken", refreshToken, {httpOnly: true, expires: new Date(Date.now() + 900000), secure: true, sameSite: 'none', });
            return res.status(200).json({ message: "Succesfully logged in.", "token" : token, "userId": userId.user_id});
        }
    })
});

app.post('/refreshtoken', (req, res) => {
    const {userName} = req.body;

    const authToken = req.cookies;
    
    if(authToken.refreshtoken === undefined){
        return res.status(401).send("Provide Token");
    }

    try {
        checkProvidedRefreshToken(authToken.refreshtoken);
    } catch (error) {
        return res.sendStatus(401);
    }
    let loginData = {
        userName,
        signInTime: Date.now()
    }

        const accessToken = jwt.sign(loginData, jwtSecretKey, {expiresIn: 10 * 5});
        const refreshToken = jwt.sign(loginData, jwtRefreshSecretKey);

        res.status(200).json({message: "Token refreshed.", token: accessToken});
})

app.get('/latestentries', async (req, res) => {

    const authToken = req.headers.authorization;

    if(authToken === undefined){
        return res.status(401).send("Provide Token");
    }

    try {
        checkProvidedAccessToken(authToken)
    } catch (error) {
        return res.sendStatus(401);
    }

    if (new Date(req.headers['if-modified-since']) <= lastChangedAt) {
        // console.log('If-Modified-Since match, sending 304');
        return res.sendStatus(304);
       }

    try {
        const resultData = await getLatestEntries();
        return res.send(resultData)
    } catch (error) {
        res.sendStatus(500);
    }
});

app.get('/calculated', async (req, res) => {
    

    const authToken = req.headers.authorization;

    if(authToken === undefined){
        return res.status(401).send("Provide Token");
    }

    try {
        checkProvidedAccessToken(authToken)
    } catch (error) {
        return res.sendStatus(401);
    }

    if (new Date(req.headers['if-modified-since']) <= lastChangedAt) {
        // console.log('If-Modified-Since match, sending 304');
        return res.sendStatus(304);
       }
    
    try {
        const resultData = await getCalculatedAverage();
        res.send(resultData)
    } catch (error) {
        res.sendStatus(500);
    }
});

app.post("/logout", (req, res) => {
    res.clearCookie("refreshToken");
    //res.clearCookie("userId")
    return res.json({
        message: "User logged out"
    })
})

app.put('/update', async (req, res) => {
    const authToken = req.headers.authorization;
    const body = req.body;

    if(authToken === undefined){
        return res.status(401).send("Provide Token");
    }

    try {
        checkProvidedAccessToken(authToken)
    } catch (error) {
        return res.sendStatus(401);
    }

    if(body.picture_url === undefined){
        try {
            const result = await updateReview('data', body);
            updateLastChangedAt()
            return res.status(200).send({message: "Changes saved.", data : result})
        } catch (error) {
            return res.status(500).send({message: "Internal error occured. Changes might not be saved."})
        }
       r
    }else if(!(body.beerName && body.longReview) && !(body.picture_url === undefined)){
        try {
            const dataResult = await updateReview('picture', body);
            updateLastChangedAt()
            return res.status(200).send({message: "New picture saved.", data : dataResult});
        } catch (error) {
            console.log(error)
            return res.status(500).send({message: "Internal error occured. Changes might not be saved."})
        }
    }else{
         res.sendStatus(500)
    }
    
})

app.put('/delete', async (req, res) => {
    const authToken = req.headers.authorization;
    const body = req.body;

    if(authToken === undefined){
        return res.status(401).send("Provide Token");
    }

    try {
        checkProvidedAccessToken(authToken)
    } catch (error) {
        return res.sendStatus(401);
    }

    try {
        const deleteResult = await deleteReview(body.reviewId)
        updateLastChangedAt()
        return res.status(200).send({message: "Review deleted.", data: deleteResult});
    } catch (error) {
        console.log(error)
        return res.sendStatus(500)
    }
})

app.get('/test', (req,res) => {
    res.sendStatus(304);
})

app.listen(port, () => {
    console.log(`Example app listening at http://127.0.0.1:${port}`)
});