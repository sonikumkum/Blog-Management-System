# Blogily - Blog Website with MongoDB CRUD Operations

A simple and attractive blog website built with Node.js, Express, MongoDB, and EJS. This project demonstrates full CRUD operations with user authentication.

## Features

- 🔐 **User Authentication**: Login and Signup functionality
- 📝 **Blog Management**: Create, Read, Update, Delete blog posts
- 🔍 **Search Functionality**: Search blogs by title, content, or author
- 🎨 **Modern UI**: Beautiful and responsive design
- 📱 **Mobile Friendly**: Responsive design for all devices
- 🔒 **Secure**: Password hashing and session management

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose
- **Frontend**: EJS templating, CSS3
- **Authentication**: Express-session, bcryptjs
- **Styling**: Custom CSS with modern design

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (running locally on port 27017)
- npm or yarn

## Installation

1. **Clone or download the project files**

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start MongoDB**:
   Make sure MongoDB is running on your system. If you have MongoDB installed locally, start it with:
   ```bash
   mongod
   ```

4. **Run the application**:
   ```bash
   npm start
   ```
   
   Or for development with auto-restart:
   ```bash
   npm run dev
   ```

5. **Open your browser** and navigate to:
   ```
   http://localhost:3000
   ```

## Usage

### Getting Started

1. **Sign Up**: Create a new account by clicking "Sign Up"
2. **Login**: Use your credentials to login
3. **Create Blog**: Click "Create Blog" to write your first post
4. **Search**: Use the search bar to find specific blogs
5. **Edit/Delete**: Manage your own blog posts

### Features Overview

- **Home Page**: View all blog posts in an attractive grid layout
- **Navigation**: Easy access to all features via the top navigation bar
- **Search**: Search across blog titles, content, and authors
- **User Management**: Secure authentication with password hashing
- **CRUD Operations**: Full create, read, update, delete functionality for blogs

## Project Structure

```
blogily/
├── server.js          # Main server file
├── package.json       # Dependencies and scripts
├── views/            # EJS templates
│   ├── index.ejs     # Home page
│   ├── login.ejs     # Login page
│   ├── signup.ejs    # Signup page
│   ├── create.ejs    # Create blog page
│   └── edit.ejs      # Edit blog page
├── public/           # Static files
│   └── css/
│       └── style.css # Main stylesheet
└── README.md         # This file
```

## Database Schema

### User Collection
```javascript
{
  username: String (unique),
  email: String (unique),
  password: String (hashed)
}
```

### Blog Collection
```javascript
{
  title: String,
  content: String,
  author: String,
  createdAt: Date,
  updatedAt: Date
}
```

## Customization

### Changing the Database
To use a different MongoDB connection, modify the connection string in `server.js`:
```javascript
mongoose.connect('mongodb://localhost:27017/blogdb', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});
```

### Styling
The website uses a modern gradient design. You can customize colors and styles in `public/css/style.css`.

### Adding Features
The modular structure makes it easy to add new features:
- Add new routes in `server.js`
- Create new EJS templates in `views/`
- Extend the CSS for new components

## Security Features

- Password hashing with bcryptjs
- Session-based authentication
- Input validation
- CSRF protection ready (can be added)

## Contributing

Feel free to fork this project and submit pull requests for improvements!

## License

This project is open source and available under the MIT License.
