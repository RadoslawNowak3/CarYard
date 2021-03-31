var express = require('express');
var router = express.Router();
var dbConn  = require('../lib/db');

// display pictures
router.get('/', function(req, res, next) {
    let query = "SELECT * FROM `Zdjecia` ORDER BY ID_Zdjecia ASC";
    dbConn.query(query, (err, result) => {
        if (err) {
            res.redirect('/');
        }
        res.render('picture.ejs', {
            title: 'Image album'
            , pictures: result
        });
    });
});
// display add picture
router.get('/add', function(req, res, next) {
    res.render('addpicture.ejs', {
        imagelink: '',
        description: ''
    })
})

// post add picture
router.post('/add', function(req, res, next) {
    let imglink = req.body.imagelink;
    let imgdescription = req.body.description;
    let errors = false;
    let parsed = JSON.stringify(imglink)
    if(imglink.length === 0 || imgdescription.length === 0) {
        errors = true;
        req.flash('error', "Fields cannot be empty");
        res.render('addpicture.ejs', {
            imagelink: imglink,
            description: imgdescription
        })
    }
    else if(!(parsed.includes(".png") || parsed.includes(".jpg"))) {
        errors = true;
        console.log(parsed)
        console.log(!parsed.includes(".png"))
        console.log(!parsed.includes(".jpg"))
        req.flash('error', "Image must be in .png or .jpg form!");
        res.render('addpicture.ejs', {
            imagelink: imglink,
            description: imgdescription
        })
    }
    else if(!parsed.includes("https://") && !parsed.includes("http://")) {
        errors = true;
        req.flash('error', "Invalid link!");
        res.render('addpicture.ejs', {
            imagelink: imglink,
            description: imgdescription
        })
    }
    if(!errors) {
        let query = "INSERT INTO `Zdjecia` (Link, Opis) VALUES ('"+imglink +"', '"+ imgdescription+"')";
        console.log(query);
        dbConn.query(query, (err, result) => {
            if (err) {
                req.flash('error', err)
                res.render('addpicture.ejs', {
                    imagelink: imglink,
                    description: imgdescription
                })
                console.log(req.body);
            }
            else {
                req.flash('success', 'Picture successfully added');
                res.redirect('/pictures');
            }
        })
    }
});
// display picture + comments
router.get('/picture/(:id)', function(req, res, next) {
    let id = req.params.id;
    if(!isNaN(id))
    {
        dbConn.query('SELECT * FROM `Zdjecia` WHERE ID_Zdjecia = ' + id, function (err, rows, fields) {
            if (err) throw err
            if (rows.length <= 0) {
                req.flash('error', 'Picture not found with id = ' + id)
                res.redirect('/pictures')
            } else {
                dbConn.query('SELECT * FROM `Komentarze` WHERE ID_Zdjecia = ' + id, function (err, comms, fields) {
                    if (err) throw err
                    else {
                        res.render('pictures.ejs', {
                            title: 'Comment on picture',
                            picture: rows,
                            comments: comms
                        })
                    }
                })
            }
        })
    }
});

//post comment
router.post('/picture/(:id)', function(req, res, next) {
    let commentdesc = req.body.description;
    let id = req.params.id;
    if(commentdesc.length === 0) {
        errors = true;
        req.flash('error', "Comment field cannot be empty!");
        res.redirect('/pictures/picture/' + id)
    }
    if(!errors) {
        let query = "INSERT INTO `Komentarze` (Tresc, ID_Zdjecia) VALUES ('" + commentdesc + "', '" + id + "')";
        dbConn.query(query, (err, result) => {
            if (err) {
                req.flash('error', err)
                res.redirect('/pictures/picture/' + id)
            } else {
                req.flash('success', 'Comment successfully added');
                res.redirect('/pictures/picture/' + id)
            }
        })
    }
});

module.exports = router;