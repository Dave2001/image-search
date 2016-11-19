var mongo = require('mongodb').MongoClient;
var mongoURI = 'mongodb://localhost:27017/test';
var history=null;
var express = require('express');
var request = require("request");
var app = express();
var buffer=[]; 

app.get('/api/imagesearch/:data', function (req, res) {

// save search in database
var sval = decodeURIComponent(req.params.data);
var searchtime = new Date();
history.insert({searchval: sval, searchtime: searchtime});

//set the flicker URL
var url= "https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=0d08ca345352448bb6a030a2fafab5ba&format=json&nojsoncallback=1&per_page=10&tags=" + req.params.data;    

if(req.query.offset>0){
 url+="&page="+req.query.offset;    
}    
console.log(url); 

request({
    url: url,
    json: true
}, function (error, response, body) {

    if (!error && response.statusCode === 200) {
        //we have the json from flicker
        //display the parts we want
  
        res.json(body.photos.photo.map(function (el) {
			return {
				alt:  el.title,
				url: "http://www.flickr.com/photos/" + el.owner + "/" + el.id
			}
		}));
    }
})
})


app.get('/api/latest/imagesearch', function (req, res) {
  //query mongo
  history.find().limit(10).sort({searchtime:-1}).toArray(function(err, results) {
    if (err) throw err
    else
    {
    //set response to a json with the values of the results
    res.json(results.map(function (el) {
			return {
				query: el.searchval,
				searchtime: el.searchtime
			};
		}));
    }
  });
})

//connect to the db
mongo.connect( mongoURI, function (err, mongodb) {
  if(err) {
   console.log("Error connecting to mongoDB")   
  }
  else
  {
    //set collection
    history = mongodb.collection("search_history");
  	//add the listener
  	app.listen(8080, function () {
		console.log("Node running on port 8080");
	});
  }
});