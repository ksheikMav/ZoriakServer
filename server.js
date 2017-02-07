var express = require('express');
var app = express();
var mongojs = require('mongojs');
var bodyParser = require('body-parser');
//user documents
var users = mongojs('mongodb://zoriak:test@ds111718.mlab.com:11718/zoriakdb', ['Users'], ['Recordings']);
//recordings documents
var recordings = mongojs('mongodb://zoriak:test@ds111718.mlab.com:11718/zoriakdb', ['Recordings']);
var iranianRecordings = mongojs('mongodb://zoriak:test@ds111718.mlab.com:11718/zoriakdb', ['iran'] )

app.use(bodyParser.json());
var ObjectId = mongojs.ObjectId;

//route to index page..
app.get('/', function(req,res) {
	res.sendFile('login.html', { root: './client/' });

});


//handles all functionality for users..
app.get('/Users', function(req,res){
	users.Users.find(function(err,Users){
		res.json(Users);
	});
});

//inserting a user into the database..
app.post('/Users', function(req,res){
	//code to check whether a given MRN is in the db or not.. reject the insertion if so
	var mrn = req.body.MRN;
	users.Users.findOne({"MRN": mrn}, function(err, user){
		if(user != null) {
			res.json("MRN already used.. please choose a different one");
		}
		else {
			users.Users.insert(req.body, function(err, user) {
				console.log(user);
				console.log("Inserting a user into the database..");
				res.json("User Successfully Uploaded!");

			});
		}
	});
});
//will show each recording for a given user..copy the mongo generated mongo id...
app.get('/Users/:id', function(req,res){
  var id = req.params.id;
	recordings.Recordings.find({"user-id": id}, function(err, recordings){
		if(recordings.length == 0) {
			res.json("No Recordings Found..")
		}
		else { 
			res.json(recordings);
		}

	});
});
//delete every recording for a given user..
app.delete('/Users/:id', function(req, res) {
	var id = req.params.id;
	users.Users.remove({_id: ObjectId(id)});
	console.log("Removing user from the database..")
	res.json("User Successfully Removed!")
});
//table similar to the database that we have right now.. shows every recording generated by the app
app.get('/Recordings', function(req, res) {
	recordings.Recordings.find(function(err, Recordings) {
		res.json(Recordings);
	});
});
app.post('/Recordings', function(req,res){
  recordings.Recordings.insert(req.body, function(err, Recordings) {
  	if(err) {
  		res.send(err);
  	}
  	else { 
  		console.log("Inserting a new recording into the database..");
  		res.json("Recording Successfully Uploaded!")
  	}

  });
});
app.delete('/Recordings/:id', function(req,res) {
	var id = req.params.id;
	recordings.Recordings.remove({_id: ObjectId(id)});
	console.log("Removing a recording from the database..")
	res.json("Recording Successfully Deleted!")


});
app.get('*', function(req,res){
	res.sendStatus(404);

});


//used for testing neda's recordings...
app.post('/iran', function(req, res) {
	console.log("we're here..");
	iranianRecordings.iran.insert(req.body, function(err, iran) {
		console.log("incoming recording from iran..");
		res.json("Recording Sucessfully Uploaded..");

	})

});
app.get(('/iranianUploads'), function(req,res) {
	iranianRecordings.iran.find(function(err, neda) {
		res.json(neda);

	});

});

console.log('Running Server...');
app.listen(process.env.PORT || 5000)