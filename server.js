const express = require('express');
const app = express();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const passport = require("passport");
const session = require("express-session");
const sessionSecret = process.env.SESSION_CONF || require('./config/sessionConfig').secret;
const path = require('path');

// Require routes
const users = require('./routes/api/Users');
const companies = require('./routes/api/Companies');
const faqs = require('./routes/api/Faqs');
const jobs = require('./routes/api/Jobs');
const onboardings = require('./routes/api/Onboardings');
const projects = require('./routes/api/Projects');
const responsibilities = require('./routes/api/Responsibilities');
const tasks = require('./routes/api/Tasks');
const aws = require('aws-sdk');

// BodyParser Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Passport Config
require('./config/passport')(passport);

// DB Config
const db = process.env.PROD_DB || require('./config/dbKeys').mongoURI;

// Connect to MongoDB
mongoose.connect(db, { 
    useNewUrlParser: true, 
    useUnifiedTopology: true, 
    useFindAndModify: false,
    useCreateIndex: true
})
.then(() => console.log('MongoDB Connected...'))
.catch(err => console.log(err));

// Initialize sessions
app.use(session({
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: { httpOnly: false },
    expires: new Date(Date.now() + 3600000)
}));

// Initialize passport
app.use(passport.initialize());
// Initialize passport session
app.use(passport.session());

// Routes
app.use('/api/users', users);
app.use('/api/companies', companies);
app.use('/api/faqs', faqs);
app.use('/api/jobs', jobs);
app.use('/api/onboarding', onboardings);
app.use('/api/projects', projects);
app.use('/api/responsibilities', responsibilities);
app.use('/api/tasks', tasks);

app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    next();
});

//Serve static assets if we are in production
if(process.env.NODE_ENV === 'production'){
    //Set static folder
    app.use(express.static('client/build')); 
    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
    });
}

// Serve on specified port
const port = require('./config/env').serverPORT;
app.listen(port, () => console.log(`Server started on port ${port}`));