var express = require('express');
var router = express.Router();
const passport = require('passport');
const model = require('../model/model');
const moment = require('moment');
// const restc = require('restc');


// router.use(restc.express());

/* GET home page. */
router.get('/', function (req, res, next) {
  req.flash('info', 'Welcome');
  res.render('index', {
    title: 'Express'
  });
});

router.get('/login', function (req, res, next) {
  res.render('login', {
    title: 'Login'
  })
});

router.post('/login', passport.authenticate('local', {
  successRedirect: '/users',
  failureRedirect: '/',
  failureFlash: true
}));

router.all('/users', isLoggedIn);
router.get('/users', function (req, res, next) {
  res.render('user', {
    title: 'User List',
    username: req.user.username
  })
});

router.get('/logout', function (req, res) {
  res.logout();
  res.redirect('/');
});

router.get('/project', function (req, res) {
  var Project = model.Project;
  Project.find(function (err, projects) {
    if (err) {
      req.flash('error', 'something wrong with database.');
      res.redirect('/');
    }

    if (typeof (req.user) == "undefined") {
      return res.render('project', {
        projects: projects,
        username: "anonymous"
      })
    }
    return res.render('project', {
      projects: projects,
      username: req.user.username
    })
  })
});

router.get('/weekly', function (req, res) {
  if (req.isAuthenticated()) {
    var Weekly = model.Weekly;
    // console.log(Weekly);
    var username = req.user.username;
    // console.log(username);
    var wherestr = {
      'name': username
    };
    Weekly.find(wherestr,function (err, weeklys) {
      if (err) {
        return res.redirect('/');
      } else {
        // console.log(weeklys);
        return res.render('weekly', {
          title: "weekly",
          weeklys: weeklys,
          username: username
        })
      }
    })
  } else {
    return res.redirect('/');
  }
})

router.post('/weekly', function (req, res) {
  if(req.isAuthenticated()){
    var name = req.user.username;
    var week = moment().dayOfYear()/7;
    var involve = req.body.involve;
    var done = req.body.done;
    var plan = req.body.plan;
    var description = req.body.description;
    var updated = moment().dayOfYear();
    var insertData = {
      week: week,
      name: name,
      involve: involve,
      done: done,
      plan: plan,
      description: description,
      updated: updated
    };
    console.log(insertData);
    var Weekly = model.Weekly;
    var thisweekEntity = new Weekly(insertData);
    thisweekEntity.save();
  }

  return res.redirect('/weekly');
})

router.get('/device', function (req, res) {
  res.render('device');
})

router.get('/addWeekly', function (req, res) {
  if(req.isAuthenticated()){
    return res.render('addWeekly',{
      title: "addWeekly",
      username: req.user.username
    });
  }

  return res.redirect('/');
})

router.delete('/delWeekly',function(req, res){
  var id = req.id;
  console.log(id);
  var Weekly = model.Weekly;
  Weekly.findByIdAndRemove({_id:id});
})

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next()
  }
  req.flash('You need to login!')
  res.redirect('/login');
}

module.exports = router;