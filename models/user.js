const mongoose = require("mongoose")
const Schema = mongoose.Schema;
const uniqueValidator = require("mongoose-unique-validator");
var bcrypt = require("bcryptjs");

// User model
const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },

    password: {
        type: String,
        required: true,
        minlength: 6
    },
	
    
    // This will store the connected twitter account
    twitter: {

      id: String,

      token: String,

      tokenSecret: String,

      displayName: String,

      handle: String,

      photo: String

    },

    // A list of tweets that the user has pulled and wants information on
    tweets: [
      {
        type: Schema.Types.ObjectId,
        ref: "Tweet"
      }
    ]
});

userSchema.plugin(uniqueValidator)

userSchema.methods.comparePassword = function(password){
    let user = this
    return bcrypt.compareSync(password, user.password)
}


userSchema.pre("save", function(next){
    var user = this;

    if (!user.isModified('password')) {
        return next();
      }

      bcrypt.genSalt(10, (err, salt) => {
        console.log("salting 10")
        if (err) {
          console.log(err)
          return next(err);
        }
        bcrypt.hash(user.password, salt, (error, hash) => {
          console.log("hashing password")

          if (error) {
            return next(error);
          }
          user.password = hash;
          next();
        });
      });
});

const User = mongoose.model("User", userSchema);

module.exports = User;

