const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;
// Middleware
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(methodOverride(function (req, res) {
    if (req.body && typeof req.body === 'object' && '_method' in req.body) {
        // look in urlencoded POST bodies and delete it
        var method = req.body._method;
        delete req.body._method;
        return method;
    }
}));
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: false
}));
// MongoDB Connection
mongoose.connect('mongodb://localhost:27017/blogdb', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});
// User Schema
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});
const User = mongoose.model('User', userSchema);
// Blog Schema
const blogSchema = new mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    author: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    // Reactions
    likes: { type: [String], default: [] }, // store usernames who liked
    dislikes: { type: [String], default: [] } // store usernames who disliked
});
const Blog = mongoose.model('Blog', blogSchema);
// Middleware to check if user is logged in
const requireAuth = (req, res, next) => {
    if (req.session.userId) {
        next();
    } else {
        res.redirect('/login');
    }
};
// Routes
// Home page
app.get('/', async (req, res) => {
    try {
        const blogs = await Blog.find().sort({ createdAt: -1 });
        res.render('index', { blogs, user: req.session.user, searchQuery: null });
    } catch (error) {
        console.error(error);
        res.render('index', { blogs: [], user: req.session.user, searchQuery: null });
    }
});
// Login page
app.get('/login', (req, res) => {
    res.render('login', { error: null });
});
// Login post
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    
    try {
        const user = await User.findOne({ username });
        if (user && await bcrypt.compare(password, user.password)) {
            req.session.userId = user._id;
            req.session.user = { username: user.username, email: user.email };
            res.redirect('/');
        } else {
            res.render('login', { error: 'Invalid username or password' });
        }
    } catch (error) {
        console.error(error);
        res.render('login', { error: 'An error occurred' });
    }
});
// Signup page
app.get('/signup', (req, res) => {
    res.render('signup', { error: null });
});
// Signup post
app.post('/signup', async (req, res) => {
    const { username, email, password } = req.body; 
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ username, email, password: hashedPassword });
        await user.save();
        req.session.userId = user._id;
        req.session.user = { username: user.username, email: user.email };
        res.redirect('/');
    } catch (error) {
        console.error(error);
        res.render('signup', { error: 'Username or email already exists' });
    }
});
// Logout
app.post('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});
// Create blog
app.get('/create', requireAuth, (req, res) => {
    res.render('create', { user: req.session.user });
});
app.post('/create', requireAuth, async (req, res) => {
    const { title, content } = req.body; 
    try {
        const blog = new Blog({
            title,
            content,
            author: req.session.user.username
        });
        await blog.save();
        res.redirect('/');
    } catch (error) {
        console.error(error);
        res.render('create', { error: 'Failed to create blog', user: req.session.user });
    }
});

// Like a blog (toggle)
app.post('/blogs/:id/like', requireAuth, async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);
        if (!blog) return res.redirect('/');

        const username = req.session.user.username;
        const hasLiked = blog.likes.includes(username);
        const hasDisliked = blog.dislikes.includes(username);

        if (hasLiked) {
            blog.likes = blog.likes.filter(u => u !== username);
        } else {
            blog.likes.push(username);
            if (hasDisliked) {
                blog.dislikes = blog.dislikes.filter(u => u !== username);
            }
        }
        blog.updatedAt = new Date();
        await blog.save();
        res.redirect('back');
    } catch (error) {
        console.error('Error liking blog:', error);
        res.redirect('/');
    }
});

// Dislike a blog (toggle)
app.post('/blogs/:id/dislike', requireAuth, async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);
        if (!blog) return res.redirect('/');

        const username = req.session.user.username;
        const hasLiked = blog.likes.includes(username);
        const hasDisliked = blog.dislikes.includes(username);

        if (hasDisliked) {
            blog.dislikes = blog.dislikes.filter(u => u !== username);
        } else {
            blog.dislikes.push(username);
            if (hasLiked) {
                blog.likes = blog.likes.filter(u => u !== username);
            }
        }
        blog.updatedAt = new Date();
        await blog.save();
        res.redirect('back');
    } catch (error) {
        console.error('Error disliking blog:', error);
        res.redirect('/');
    }
});
// Edit blog
app.get('/edit/:id', requireAuth, async (req, res) => {
    try {
        console.log('GET edit request for blog ID:', req.params.id);
        console.log('Current user:', req.session.user.username);
        
        const blog = await Blog.findById(req.params.id);
        if (blog && blog.author === req.session.user.username) {
            console.log('Rendering edit page for blog:', blog.title);
            res.render('edit', { blog, user: req.session.user });
        } else {
            console.log('Blog not found or user not authorized');
            res.redirect('/');
        }
    } catch (error) {
        console.error('Error in GET edit:', error);
        res.redirect('/');
    }
});
app.put('/edit/:id', requireAuth, async (req, res) => {
    try {
        console.log('PUT request received for blog ID:', req.params.id);
        console.log('Request body:', req.body);
        
        const blog = await Blog.findById(req.params.id);
        if (blog && blog.author === req.session.user.username) {
            console.log('Updating blog:', blog.title);
            blog.title = req.body.title;
            blog.content = req.body.content;
            blog.updatedAt = new Date();
            await blog.save();
            console.log('Blog updated successfully');
        } else {
            console.log('Blog not found or user not authorized');
        }
        res.redirect('/');
    } catch (error) {
        console.error('Error updating blog:', error);
        res.redirect('/');
    }
});
// POST route for edit (fallback in case method-override doesn't work)
app.post('/edit/:id', requireAuth, async (req, res) => {
    try {
        console.log('POST request received for blog ID:', req.params.id);
        console.log('Request body:', req.body);
        
        const blog = await Blog.findById(req.params.id);
        if (blog && blog.author === req.session.user.username) {
            console.log('Updating blog:', blog.title);
            blog.title = req.body.title;
            blog.content = req.body.content;
            blog.updatedAt = new Date();
            await blog.save();
            console.log('Blog updated successfully');
        } else {
            console.log('Blog not found or user not authorized');
        }
        res.redirect('/');
    } catch (error) {
        console.error('Error updating blog:', error);
        res.redirect('/');
    }
});

// Delete blog
app.delete('/delete/:id', requireAuth, async (req, res) => {
    try {
        console.log('DELETE request received for blog ID:', req.params.id);
        console.log('Current user:', req.session.user.username);
        
        const blog = await Blog.findById(req.params.id);
        if (blog && blog.author === req.session.user.username) {
            console.log('Deleting blog:', blog.title);
            await Blog.findByIdAndDelete(req.params.id);
            console.log('Blog deleted successfully');
        } else {
            console.log('Blog not found or user not authorized for deletion');
        }
        res.redirect('/');
    } catch (error) {
        console.error('Error deleting blog:', error);
        res.redirect('/');
    }
});

// POST route for delete (fallback in case method-override doesn't work)
app.post('/delete/:id', requireAuth, async (req, res) => {
    try {
        console.log('POST DELETE request received for blog ID:', req.params.id);
        console.log('Current user:', req.session.user.username);
        
        const blog = await Blog.findById(req.params.id);
        if (blog && blog.author === req.session.user.username) {
            console.log('Deleting blog:', blog.title);
            await Blog.findByIdAndDelete(req.params.id);
            console.log('Blog deleted successfully');
        } else {
            console.log('Blog not found or user not authorized for deletion');
        }
        res.redirect('/');
    } catch (error) {
        console.error('Error deleting blog:', error);
        res.redirect('/');
    }
});

// Search functionality
app.get('/search', async (req, res) => {
    const query = req.query.q;
    try {
        const blogs = await Blog.find({
            $or: [
                { title: { $regex: query, $options: 'i' } },
                { content: { $regex: query, $options: 'i' } },
                { author: { $regex: query, $options: 'i' } }
            ]
        }).sort({ createdAt: -1 });
        res.render('index', { blogs, user: req.session.user, searchQuery: query });
    } catch (error) {
        console.error(error);
        res.render('index', { blogs: [], user: req.session.user, searchQuery: query });
    }
});
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
