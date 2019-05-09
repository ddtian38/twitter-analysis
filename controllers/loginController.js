const db = require("../models")

module.exports = {
    create(req, res){
        db.User.create({
            username: req.body.username,
            password: req.body.password,
            email: req.body.email,
            twitter_username: req.body.twitter_username

        }).then(function(data) {

            console.log("redirecting to login route")
            res.redirect(307, "/api/user/login")

        }).catch(function(err) {
            res.json(err);

        });
    }
}