const express = require('express');
const mongoose = require('mongoose');
const ShortUrl = require('./models/shortUrl')
const app = express();

mongoose.connect('mongodb://0.0.0.0:27017/url-Shortner',{
       useNewUrlParser: true, 
       useUnifiedTopology : true,
})


app.set('view engine','ejs')
app.use(express.urlencoded({extended:false}))



// Search route
app.get('/', async (req, res) => {
       const searchText = req.query.q; // Get the search query from the request
       let shortUrls;
       if (searchText) {
           shortUrls = await ShortUrl.find({
               $or: [
                   { full: { $regex: searchText, $options: 'i' } }, // Case-insensitive search in the full URL
                   { short: { $regex: searchText, $options: 'i' } }, // Case-insensitive search in the short URL
               ],
           }).exec();
       } else {
           shortUrls = await ShortUrl.find().exec(); // Fetch all short URLs if no search query provided
       }
       res.render('indexx', { shortUrls });
       
   });
   
   // URL Shrink route
   app.post('/shortUrls', async (req, res) => {
       const { fullUrl } = req.body;
       const existingShortUrl = await ShortUrl.findOne({ full: fullUrl });
   
       if (existingShortUrl) {
           res.render('indexx', { shortUrls: await ShortUrl.find() });
       } else {
           await ShortUrl.create({ full: fullUrl });
           res.redirect('/');
       }
   });
    

   // Redirect route
app.get('/:shortUrl', async (req, res) => {
    const shortUrl = await ShortUrl.findOne({ short: req.params.shortUrl });
    if (!shortUrl) return res.sendStatus(404);
    shortUrl.clicks++;
    shortUrl.save();
    res.redirect(shortUrl.full);
  });
  
   


app.listen(process.env.PORT || 3000);