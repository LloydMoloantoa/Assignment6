const express = require('express');
const exphbs = require('express-handlebars');
const session = require('express-session');
const bcrypt = require('bcryptjs');
//Allows use of findInfo function from detectEntities 
const { findInfo } = require('./detectEntities')


// import sqlite modules
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const e = require('express');

const app = express();
const PORT = process.env.PORT || 3017;

// enable the req.body object - to allow us to use HTML forms
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// enable the static folder...
app.use(express.static('public'));

// add more middleware to allow for templating support
app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');

app.use(session({
	secret: 'keyboard cat',
	resave: false,
	saveUninitialized: true
}));

// database setup starts here
open({
	filename: './malt.db',
	driver: sqlite3.Database
}).then(async (db) => {

	// only setup the routes once the database connection has been established

	await db.migrate();

	app.get('/', async function (req, res) {
		//const counter = await db.get('select * from counter');
		const users = await db.all('select * from users');
		res.render('index', {
			//counter: counter ? counter.count : 0
			users
		});
	});

	app.post("/register", async function (req, res) {
		try {
			const fullname = req.body.fullname;
			const email = req.body.email;
			const password = req.body.password;

			const hash = await bcrypt.hash(password, 10);
			const insert_users = 'insert into users (fullname, email, hash) values (?, ?, ?)';
			await db.run(insert_users, fullname, email, hash);
			res.redirect('/');

		} catch (e) {
			console.log(e);
			res.status(500).send("incorrect information!");
			res.redirect('/');
		}
	});

	app.post("/", async function (req, res) {
		try {
			const fullname = req.body.fullname;
			const email = req.body.email;
			const password = req.body.password;

			const user = await db.get('select * from users where email = ?', email);
			if (user) {
				const vaildPass = await bcrypt.compare(password, user.hash);
				if (vaildPass) {
					console.log("in");
					res.redirect('/home');
				} else {
					res.redirect('/');
					console.log("out");
				}
			} else {
				console.log("user not fownd");
			}

		} catch (e) {
			console.log(e);
		}
	});

	app.get('/home', async function (req, res) {
		const users = await db.all('select * from users');
		res.render('home', {
			users
		});
	});

	app.post('/home', async function (req, res) {
		const email = req.body.email;
		const name = await db.get('select fullname from users where email = ?', email);
		const num = await db.get('select id from users where email = ?', email);
		var idnum = num.id;
		var fullname = name.fullname;

		req.session.user = idnum;

		var tog ="";
		if(idnum > 5){
			tog = "hidden";
		}

		res.render('home', {
			fullname,
			tog,
			idnum
		});  
	});

	app.post('/imageDetection', async function (req, res) {
		const email = req.body.email;
		const name = await db.get('select fullname from users where email = ?', email);
		var fullname = name.fullname;

		res.render('imageDetection', {
			fullname
		});
	});

	app.post('/home', function (req, res) {
		res.redirect("/home");
	});

	app.get("/", function (req, res) {
		res.render('/');
	});

	app.get("/logout", function (req, res) {
		res.redirect('/');
	});

	app.get('/imageDetection', async function (req, res) {
		const user = await db.get('select * from users where id = ?', Number(req.session.user));
		var fullname = user.fullname;
		var mail = user.email;

		res.render('imageDetection', {
			fullname,
			mail
		});
	});

	app.post('/chatLogAnalyzer', async function (req, res) {
		const email = req.body.email;
		const name = await db.get('select fullname from users where email = ?', email);
		var fullname = name.fullname;

		res.render('chatLogAnalyzer', {
			fullname
		});
	});

	
	app.post('/detectEntities', async function(req, res){
		//Get data from request body
		const data = req.body;
		//format data to string
		const theData = JSON.stringify(data);
		//Execute the function from detectEntities.js to find entities
		findInfo(theData);
		res.redirect("/chatLogAnalyzer")
	})	

	app.post('/home', function (req, res) {
		res.redirect("/home");
	});

	app.get("/", function (req, res) {
		res.render('/');
	});

	app.get("/logout", function (req, res) {
		res.redirect('/');
	});

	app.get('/chatLogAnalyzer', async function (req, res) {
		const user = await db.get('select * from users where id = ?', Number(req.session.user));
		var fullname = user.fullname;
		var mail = user.email;

		res.render('chatLogAnalyzer', {
			fullname,
			mail
		});
	});


	app.get('/dataview', async function (req, res) {
		const users = await db.all('select * from users');
		res.render('dataview', {
			users
		});
	});

	app.get('/pdf', function (req, res) {
		res.render("pdf");
	});

	app.get('/delete/:id', async function (req, res) {
		const users = await db.run('DELETE FROM users WHERE id = ?', req.params.id);
		res.redirect("/dataview");
	});

	// start  the server and start listening for HTTP request on the PORT number specified...
	app.listen(PORT, function () {
		console.log(`App started on port ${PORT}`)
	});

	// findInfo()

});