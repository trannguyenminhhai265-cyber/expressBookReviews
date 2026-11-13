const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

const BASE_URL = "http://localhost:5000";

// Register a new user
public_users.post("/register", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }
  if (!isValid(username)) {
    return res.status(409).json({ message: "User already exists!" });
  }
  users.push({ username, password });
  return res.status(200).json({ message: "User successfully registered. Now you can login" });
});

// Get the book list available in the shop
public_users.get('/', function (req, res) {
  return res.status(200).send(JSON.stringify(books, null, 4));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
  const book = books[req.params.isbn];
  if (book) {
    return res.status(200).send(JSON.stringify(book, null, 4));
  }
  return res.status(404).json({ message: "Book not found" });
});

// Get book details based on author
public_users.get('/author/:author', function (req, res) {
  const author = req.params.author.toLowerCase();
  const result = Object.keys(books)
    .filter((isbn) => books[isbn].author.toLowerCase() === author)
    .map((isbn) => ({ isbn, title: books[isbn].title, reviews: books[isbn].reviews }));
  if (result.length > 0) {
    return res.status(200).send(JSON.stringify({ booksbyauthor: result }, null, 4));
  }
  return res.status(404).json({ message: "No books found for this author" });
});

// Get all books based on title
public_users.get('/title/:title', function (req, res) {
  const title = req.params.title.toLowerCase();
  const result = Object.keys(books)
    .filter((isbn) => books[isbn].title.toLowerCase() === title)
    .map((isbn) => ({ isbn, author: books[isbn].author, reviews: books[isbn].reviews }));
  if (result.length > 0) {
    return res.status(200).send(JSON.stringify({ booksbytitle: result }, null, 4));
  }
  return res.status(404).json({ message: "No books found with this title" });
});

// Get book review
public_users.get('/review/:isbn', function (req, res) {
  const book = books[req.params.isbn];
  if (book) {
    return res.status(200).send(JSON.stringify(book.reviews, null, 4));
  }
  return res.status(404).json({ message: "Book not found" });
});

/* ------------------------------------------------------------------
 * Tasks 10-13: retrieve books using async/await and Promises with Axios.
 * These functions call the endpoints above over HTTP.
 * Run with the server started:  node router/general.js
 * ------------------------------------------------------------------ */

// Task 10: Get all books – async/await with Axios
const getAllBooks = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/`);
    return response.data;
  } catch (error) {
    throw new Error(`Error fetching all books: ${error.message}`);
  }
};

// Task 11: Get book details by ISBN – Promise callbacks with Axios
const getBookByISBN = (isbn) => {
  return axios
    .get(`${BASE_URL}/isbn/${encodeURIComponent(isbn)}`)
    .then((response) => response.data)
    .catch((error) => {
      throw new Error(`Error fetching book with ISBN ${isbn}: ${error.message}`);
    });
};

// Task 12: Get book details by author – async/await with Axios
const getBooksByAuthor = async (author) => {
  try {
    const response = await axios.get(`${BASE_URL}/author/${encodeURIComponent(author)}`);
    return response.data;
  } catch (error) {
    throw new Error(`Error fetching books by author ${author}: ${error.message}`);
  }
};

// Task 13: Get book details by title – async/await with Axios
const getBooksByTitle = async (title) => {
  try {
    const response = await axios.get(`${BASE_URL}/title/${encodeURIComponent(title)}`);
    return response.data;
  } catch (error) {
    throw new Error(`Error fetching books with title ${title}: ${error.message}`);
  }
};

// Demo: run `node router/general.js` while the server is running
if (require.main === module) {
  (async () => {
    try {
      console.log("All books:", await getAllBooks());
      console.log("Book with ISBN 1:", await getBookByISBN(1));
      console.log("Books by Jane Austen:", await getBooksByAuthor("Jane Austen"));
      console.log("Books titled 'Things Fall Apart':", await getBooksByTitle("Things Fall Apart"));
    } catch (err) {
      console.error(err.message);
    }
  })();
}

module.exports.general = public_users;
module.exports.getAllBooks = getAllBooks;
module.exports.getBookByISBN = getBookByISBN;
module.exports.getBooksByAuthor = getBooksByAuthor;
module.exports.getBooksByTitle = getBooksByTitle;
