const db = require("../models")
const ToneAnalyzerV3 = require('watson-developer-cloud/tone-analyzer/v3');

const toneAnalyzer = new ToneAnalyzerV3({
  version: '2016-05-19',
  iam_apikey: 'NoDDc3PLy8G3e79x_i25IdBpDkEWB1ysafk9fESK4zG1',
  url: 'https://gateway.watsonplatform.net/tone-analyzer/api'
});

function calculatingEmotions(dbComments, es, ind = 0, cb){
  //Store score in Sentiment Model after calculating sentiment score
  if (ind === dbComments.length){
    let total = 0;
    for (var score in es){

       total += parseFloat(es[score])
    }
    es = {
      anger: (es.anger / total * 100).toFixed(2),
      disgust: (es.disgust / total * 100).toFixed(2),
      fear: (es.fear / total * 100).toFixed(2),
      joy: (es.joy / total * 100).toFixed(2),
      sadness: (es.sadness / total * 100).toFixed(2)
    }

    db.Sentiment.create({
      anger: es.anger,
      disgust: es.disgust,
      fear: es.fear,
      joy: es.joy,
      sadness: es.sadness
    })
    .then( ({ _id }) => {
           return cb(es, _id)}
    )
   .catch(err => console.log(err));  
  }
  //Calculate sentiment scores while iterating through comment Array
  else{
    const toneParams = {
      tone_input: { 'text': dbComments[ind] },
      content_type: 'application/json',
    };
    toneAnalyzer.tone(toneParams)
      .then(({document_tone}) => {
        let emotions = document_tone.tone_categories[0].tones
        es.anger += emotions[0].score;
        es.disgust += emotions[1].score;
        es.fear += emotions[2].score;
        es.joy += emotions[3].score;
        es.sadness += emotions[4].score
        ind++;
        calculatingEmotions(dbComments, es, ind, cb)
        })
        .catch(err => {
          console.log('error:', err)
          res.json(err);
        })
  }
}

module.exports = {
//Function will create a sentiment document for a particular tweet. First, it will pull the comments associated with that tweet. IBM Tone analyzer will add all the emotion scores for each comment. The sentiment will be added to the sentiment model and then to Tweet model.
    
  //parameters need to be passed: 1. username, 2. Tweet _id
  create(req, res){
      let username = "delta1234"
      let emotionScore = {
        anger: 0,
        disgust: 0,
        sadness: 0,
        joy: 0, 
        fear: 0
      }
      db.User.find({
        username : username})
        .populate("tweets")
        .then((dbUser) => {
          let tweetID = dbUser[0].tweets[0]._id
          db.Tweet.find({
            _id: tweetID
          })
          .populate("comments")
          .then((dbTweet) => {
            let commentObj = dbTweet[0].comments;
            let comments = []
            commentObj.forEach(element => {
              comments.push(element.comment_body)
            });
            calculatingEmotions(comments, emotionScore, 0, function(emotionScore, sentimentID){
              db.Tweet.update({_id: tweetID}, {
               $set: {
                 sentiment: sentimentID
               }
              }).then((data) => {
                //returning emotion scores

                res.json(emotionScore)
              })
              .catch(err => {
                res.json(err)
              });
            })
          })
        })
        .catch((err)=>{
          res.json(err)
        })     
    },

    //parameters need to be passed: 1. username, 2. Tweet _id

    getSentimentScore(req, res){
      let username = "delta1234"
    
      db.User.find({
        username : username})
        .populate("tweets")
        .then((dbUser) => {
          let tweetID = dbUser[0].tweets[0]._id
          db.Tweet.find({
            _id: tweetID
          })
          .populate("comments")
          .populate("sentiment")
          .then((dbTweet) => {
               res.json(dbTweet[0].sentiment[0])

          })
        })
        .catch((err)=>{
          console.log(err)
        })     

    }
}