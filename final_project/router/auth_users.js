const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();
let users = [];


const isValid = (username) => {
  let userswithsamename = users.filter((user) => {
    return user.username === username
  });
  if (userswithsamename.length > 0) {
    return true;
  } else {
    return false;
  }
}

const authenticatedUser = (username, password) => {
  let validusers = users.filter((user) => {
    return (user.username === username && user.password === password)
  });
  if (validusers.length > 0) {
    return true;
  } else {
    return false;
  }
}


// Login endpoint
regd_users.post("/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  // Check if username or password is missing
  if (!username || !password) {
    return res.status(404).json({ message: "Error logging in" });
  }

  // Authenticate user
  if (authenticatedUser(username, password)) {
    // Generate JWT access token
    let accessToken = jwt.sign({
      data: password
    }, 'access', { expiresIn: 60 * 60 });

    // Store access token and username in session
    req.session.authorization = {
      accessToken, username
    }
    return res.status(200).send("User successfully logged in");
  } else {
    return res.status(208).json({ message: "Invalid Login. Check username and password" });
    console.log(users)
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = parseInt(req.params.isbn);
  const book = books[isbn];
  const review = req.body.review;
  const username = req.session.authorization && req.session.authorization.username;
  if(!book){
    return res.status(404).json({message:"Book not found"});
  }
  if (!username) {
    return res.status(403).json({ message: "User not logged in" });
  }

  if (!review) {
    return res.status(400).json({ message: "Review content is required" });
  }

  if (!book.reviews) {
    book.reviews = {};
  }
  book.reviews[username] = review;
  return res.status(200).json({ message: "Review added/modified successfully", reviews: book.reviews });
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const book = books[isbn];
  const username = req.session.authorization && req.session.authorization.username;

  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }

  if (!req.session.authorization) {
    return res.status(403).json({ message: "User not logged in" });
  }

  if (!book.reviews || !book.reviews[username]) {
    return res.status(404).json({ message: "Review not found" });
  }

  delete book.reviews[username];
  return res.status(200).json({ message: "Review deleted successfully" });
});
module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
