/*
*
*
*       Complete the API routing below
*       
*       
*/

'use strict';

var expect = require('chai').expect;
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId;
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
const MONGODB_CONNECTION_STRING = process.env.MONGO_URI;
mongoose.connect(MONGODB_CONNECTION_STRING);

var bookSchema = new Schema({
  title: {type: String, required: true},
  comments : [{type: String, default: ''}]
});
var Book = mongoose.model('Book', bookSchema);

module.exports = function (app) {

  app.route('/api/books')
    .get(function (req, res){
      Book.find({}, (err, doc) => {
        if(err) {
          console.log('Database connection error');
        }
        let resultArr = [];
        let thisObj = {};
        if(doc.length == 0) {
          thisObj = {
            _id: '',
            title: '',
            commentcount: 0
          }
          resultArr.push(thisObj);
        }
        else {
          doc.forEach((item) => {
            thisObj = {
              _id: item._id || '',
              title: item.title || '',
              commentcount: item.comments.length || 0
            };
            resultArr.push(thisObj);
          });
        }
        res.json(resultArr);
      });
    })
    
    .post(function (req, res){
      var title = req.body.title;
      if(title) {
        let book = new Book({title: title});
        book.save((err, doc) => {
          if(err) {
            console.log('Database error: ' + err);
          }
          else {
            res.json({title: doc.title, _id: doc._id, comments: []});
          }
        });
      }
      else {
        res.send('Please enter a book title');
      }
    })
    
    .delete(function(req, res){
      Book.deleteMany({}, (err, doc) => {
        if(err) {
          console.log('Database error: ' + err);
        }
        else {
          res.send('Complete delete successful');
        }
      });
    });

  app.route('/api/books/:id')
    .get(function (req, res){
      var bookid = req.params.id;
      if(bookid) {
        Book.findOne({_id: bookid}, (err, doc) => {
          if(err) {
            console.log('Database error: ' + err);
          }
          else if(doc == null) {
            res.send("This _id doesn't exist in the database");
          }
          else {
            res.json({title: doc.title, _id: doc._id, comments: doc.comments});
          }
        });
      }
      else {
        res.send('Please enter an _id');
      }
    })
    
    .post(function(req, res){
      var bookid = req.params.id;
      var comment = req.body.comment;
      if(!bookid && !comment) {
        res.send('Please enter an _id and a comment');
      }
      else if(!bookid && comment) {
        res.send('Please enter an _id ');
      }
      else if(bookid && !comment) {
        res.send('Please enter a comment for this _id');
      }
      else {
        Book.findOneAndUpdate({_id: bookid}, {$push: {comments: comment}}, (err, doc) => {
          if(err) {
            console.log('Database error: ' + err);
          }
          else if(doc == null) {
            res.send("This _id doesn't exist in the database");
          }
          else {
            Book.findOne({_id: bookid}, (err, doc) => {
              if(err) {
                console.log('Database error: ' + err);
              }
              else if(doc.length == 0) {
                res.send("This _id doesn't exist in the database");
              }
              else {
                res.json({title: doc.title, _id: doc._id, comments: doc.comments});
              }
            });
          }
        });
      }
    })
    
    .delete(function(req, res){
      var bookid = req.params.id;
      if(bookid) {
        Book.deleteOne({_id: bookid}, (err, doc) => {
          if(err) {
            console.log('Database error: ' + err);
          }
          else if(doc == null) {
            res.send("This _id doesn't exist in the database");
          }
          else {
            res.send('Delete successful');
          }
        })
      }
      else {
        res.send('Please enter an _id');
      }
    });
};
