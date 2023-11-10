const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require('axios');

var bodyparser = require('body-parser')

var jsonparser  =  bodyparser.json()

var urlencodedParser = bodyparser.urlencoded({extended:false})


public_users.post("/register",urlencodedParser, (req,res) => {
  const username = req.body.username;
  const password = req.body.password;
  if (username && password) {
      if (!isValid(username)) {
          users.push({"username":username,"password":password});
          return res.status(200).json({message:`User ${username} is registered`});
      }
      else {
          return res.status(400).json({message:`User ${username} already registered`});
      }
  }
  else {
      return res.status(404).json({message: " You Must provide username and password"});
  }
});

function getBooks() {
  return new Promise((resolve, reject) => {
      resolve(books);
  });
}

// Get the book list available in the shop
public_users.get('/', function (req, res) {
  getBooks().then((boks) => res.send(JSON.stringify(boks)));
});


function getByISBN(isbn) {
  return new Promise((resolve, reject) => {
      let isbnNum = parseInt(isbn);
      if (books[isbnNum]) {
          resolve(books[isbnNum]);
      } else {
          reject({status:404, message:`ISBN ${isbn} not found`});
      }
  })
}
// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
  getByISBN(req.params.isbn)
  .then(
      result => res.send(result),
      error => res.status(error.status).json({message: error.message})
  );
});
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  const author = req.params.author;
  getBooks()
  .then((bookEntries) => Object.values(bookEntries))
  .then((books) => books.filter((book) => book.author === author))
  .then((filteredBooks) => res.send(filteredBooks));
});


// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  const title = req.params.title;
  getBooks()
  .then((bookEntries) => Object.values(bookEntries))
  .then((books) => books.filter((book) => book.title === title))
  .then((filteredBooks) => res.send(filteredBooks));
});

//  Get book review
public_users.get('/review/:isbn',async function (req, res) {
  const value = req.params.isbn
  if(books[value])
  {
    await res.send(JSON.stringify(books[value].reviews))
  }
  else{
    return await res.status(400).json({message: "book not found"});
    
  }
});

module.exports.general = public_users;
