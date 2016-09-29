module.exports = function(app, fs, connection,util,db_query,formidable)
{
    app.get('/',function(req,res){
      var sess = req.session;
      var error = req.query.error;
      if(error) {
       res.render('views/loginFormExer.html',{
        error : error
       });
      } else {
       res.render('views/loginFormExer.html');
      }
    });

    app.get('/test',function(req,res){
     res.render('views/test.html');
    });
    app.post('/login',function(req,res){
      var sess = req.session;
      var username = req.body.id;
      var password = req.body.password;
      var query = util.format(db_query.query.select.loginQuery,username,password);
      connection.query(query ,function(err,rows){
        if(rows.length == 1){
          sess.name = rows[0].UserID;
          res.render('views/login',{
            id : rows[0].UserID
          });
        }else{
          res.redirect('/?error=loginError');
        }

      });
    });

    app.get('/registerPage',function(req,res){
      res.render('views/register.html');
    });

    app.post('/register',function(req,res){
      var userId = req.body.id;
      var password = req.body.password;
      var userName = 'test';
      var query = util.format(db_query.query.insert.userAddQuery,userId,password,userName);
      connection.query(query,function(err,rows){
          res.redirect('/');
      });
    });

    app.get('/idCheck',function(req,res){
      var userId = req.query.id;
      var query = util.format(db_query.query.select.idCheckQuery,userId);
      connection.query(query,function(err,rows){
        var result = {}
        if(rows.length == 1){
          result.overlap = 1;
          res.json(result);
        }else{
          result.overlap = 0;
          res.json(result);
        }

      });
    });

    app.get('/logout', function(req, res){
        sess = req.session;
        if(sess.username){
            req.session.destroy(function(err){
                if(err){
                    console.log(err);
                }else{
                    res.redirect('/');
                }
            })
        }else{
            res.redirect('/');
        }
    })


    app.get('/loadpage',function(req,res){
      var pagename = req.query.pagename;
      console.log(pagename);
      res.render('views/'+pagename);
    });


    app.post('/upload',function(req,res){
      var fstream;
      req.pipe(req.busboy);
      req.busboy.on('file', function (fieldname, file, filename) {
          var dt = new Date();
          var d = dt.toFormat('YYYYMMDDHH24MISS');
          var reName = d+filename;
          console.log("Uploading: " + reName);
          fstream = fs.createWriteStream('./public/upload/' + reName);
          file.pipe(fstream);
          fstream.on('close', function () {
            res.render('views/loadImg', {
              imgPath : reName
           });
          });
      });
    })
    app.get('/index3',function(req,res){
      sess = req.session;
      fs.readFile( __dirname + "/../data/" + "user.json", 'utf8', function (err, data) {
        var users = JSON.parse(data);
        res.render('index3', {
             title: "MY HOMEPAGE",
             name: sess.name,
             username: sess.username,
             active : 'home',
             list : users
         });
      });

    });

    //mysql test page
    app.get('/index4',function(req,res){
      var query = connection.query('select * from testtable where serial < 100',function(err,rows){
          for(var i=0;i<rows.length;i++){
            console.log(rows[i]);
          }
      });
    });


    app.get('/login2',function(req,res){
      //get방식 데이터 받는방법
      // console.log(req.query);
      // console.log(req.query.error);
      // console.log(req.query.error2);
      sess = req.session;
      res.render('login', {
             title: "MY HOMEPAGE",
             name: sess.name,
             username: sess.username,
             active : 'login'
         })
    });
    app.get('/list', function (req, res) {
      fs.readFile( __dirname + "/../data/" + "user.json", 'utf8', function (err, data) {
          console.log( data );
          res.end( data );
      });
   });

   app.get('/getUser/:username', function(req, res){
     fs.readFile( __dirname + "/../data/user.json", 'utf8', function (err, data) {
          var users = JSON.parse(data);
          // LOOP THRU USERS; SEARCH USERNAME
          var result = {};
          for(key in users){
            if(key == req.params.username){
                result["user_data"] = users[key];
                break;
            }
      		}
          res.json(result);
     });
  });

/*
  // app.get('/login/:username/:password', function(req, res){
  app.post('/login', function(req, res){
        var sess;
        sess = req.session;

        fs.readFile(__dirname + "/../data/user.json", "utf8", function(err, data){
            var users = JSON.parse(data);
            //post방식 데이터 받는방법
            var username = req.body.username;
            var password = req.body.password;
            var result = {};
            if(!users[username]){
                // USERNAME NOT FOUND
                result["success"] = 0;
                result["error"] = "not found";
                // res.json(result);
                res.redirect('./index3');
                return;
            }

            if(users[username]["password"] == password){
                result["success"] = 1;
                sess.username = username;
                sess.name = users[username]["name"];
                console.log(sess.username);
                console.log(sess.name);
                // res.json(result);
                res.redirect('./index3');
            }else{
                result["success"] = 0;
                result["error"] = "incorrect";
                // res.json(result);
                res.redirect('./index3');
            }
        })
    });
    */

    app.get('/logout', function(req, res){
        sess = req.session;
        if(sess.username){
            req.session.destroy(function(err){
                if(err){
                    console.log(err);
                }else{
                    res.redirect('/');
                }
            })
        }else{
            res.redirect('/');
        }
    })


  app.post('/addUser/:username', function(req, res){

        var result = {};
        var username = req.params.username;
        console.log(req.body);
        // CHECK REQ VALIDITY
        if(!req.body["password"] || !req.body["name"]){
            result["success"] = 0;
            result["error"] = "invalid request";
            res.json(result);
            return;
        }


        // LOAD DATA & CHECK DUPLICATION
        fs.readFile( __dirname + "/../data/user.json", 'utf8',  function(err, data){
            var users = JSON.parse(data);
            if(users[username]){
                // DUPLICATION FOUND
                result["success"] = 0;
                result["error"] = "duplicate";
                res.json(result);
                return;
            }

            // ADD TO DATA
            users[username] = req.body;
            // SAVE DATA
            fs.writeFile(__dirname + "/../data/user.json",
                         JSON.stringify(users, null, '\t'), "utf8", function(err, data){
                result = {"success": 1};
                res.json(result);
            })
        })
    });


}
