import dotenv from 'dotenv';
import mysql from 'mysql2';
import express from 'express';
import cors from 'cors';
const app = express();
const router = express.Router();
app.use(cors());
app.use(express.json());
dotenv.config();
const port = process.env.PORT 

const pool = mysql.createPool(
    process.env.DATABASE_URL
);

app.get('/getdata', (req, res) => {
    const result = pool.query('SELECT * FROM beerReviews', function(err, rows, fields){
        res.send(rows);
        });
});  

app.post('/newentry', (req,res) => {
    const result = pool.execute('INSERT INTO beerReviews (userName, rating, longReview, beerName, shortReview, category, brewery) VALUES ( ?, ?, ?, ?, ?, ?, ?)', 
    [req.body.userName, req.body.rating, req.body.longReview, req.body.beerName, req.body.shortReview, req.body.category, req.body.brewery], 
    function(err, rows, fields){
        res.send(rows);
    })
});

app.get('/getentry/:id', (req, res) => {
    const result = pool.execute('SELECT * FROM beerReviews WHERE review_id = ?',[req.params.id], function(err, rows, fields){
        res.send(rows);
        });
});  

app.listen(port, () => {
    console.log(`Example app listening at https://bierbewertungsappbackend-production.up.railway.app:${port}`)
});

