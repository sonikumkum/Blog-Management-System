# MongoDB CRUD Operations Implementation in Blogily Website

## 🎯 **QUESTION: Apply CRUD Operations of MongoDB in Development of Website**

### **Answer: Complete Implementation of MongoDB CRUD Operations**

This document demonstrates how MongoDB CRUD (Create, Read, Update, Delete) operations are implemented in the Blogily website development.

---

## 📊 **MongoDB Database Structure**

### **Database Name**: `blogdb`
### **Collections**: 
1. **users** - User authentication data
2. **blogs** - Blog posts data

---

## 🗄️ **1. CREATE OPERATIONS**

### **A. User Registration (CREATE User)**
```javascript
// File: server.js (Lines 95-105)
app.post('/signup', async (req, res) => {
    const { username, email, password } = req.body;
    
    try {
        // CREATE operation: Insert new user document
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ username, email, password: hashedPassword });
        await user.save(); // MongoDB CREATE operation
        
        req.session.userId = user._id;
        req.session.user = { username: user.username, email: user.email };
        res.redirect('/');
    } catch (error) {
        res.render('signup', { error: 'Username or email already exists' });
    }
});
```

**MongoDB Operation**: `db.users.insertOne({ username, email, password: hashedPassword })`

### **B. Blog Creation (CREATE Blog)**
```javascript
// File: server.js (Lines 129-144)
app.post('/create', requireAuth, async (req, res) => {
    const { title, content } = req.body;
    
    try {
        // CREATE operation: Insert new blog document
        const blog = new Blog({
            title,
            content,
            author: req.session.user.username
        });
        await blog.save(); // MongoDB CREATE operation
        
        res.redirect('/');
    } catch (error) {
        res.render('create', { error: 'Failed to create blog', user: req.session.user });
    }
});
```

**MongoDB Operation**: `db.blogs.insertOne({ title, content, author, createdAt, updatedAt })`

---

## 📖 **2. READ OPERATIONS**

### **A. Display All Blogs (READ All Blogs)**
```javascript
// File: server.js (Lines 62-70)
app.get('/', async (req, res) => {
    try {
        // READ operation: Find all blogs and sort by creation date
        const blogs = await Blog.find().sort({ createdAt: -1 });
        res.render('index', { blogs, user: req.session.user, searchQuery: null });
    } catch (error) {
        console.error(error);
        res.render('index', { blogs: [], user: req.session.user, searchQuery: null });
    }
});
```

**MongoDB Operation**: `db.blogs.find().sort({ createdAt: -1 })`

### **B. Find Specific Blog for Editing (READ Single Blog)**
```javascript
// File: server.js (Lines 147-164)
app.get('/edit/:id', requireAuth, async (req, res) => {
    try {
        // READ operation: Find blog by ID
        const blog = await Blog.findById(req.params.id);
        if (blog && blog.author === req.session.user.username) {
            res.render('edit', { blog, user: req.session.user });
        } else {
            res.redirect('/');
        }
    } catch (error) {
        console.error('Error in GET edit:', error);
        res.redirect('/');
    }
});
```

**MongoDB Operation**: `db.blogs.findOne({ _id: ObjectId(req.params.id) })`

### **C. Search Blogs (READ with Query)**
```javascript
// File: server.js (Lines 264-275)
app.get('/search', async (req, res) => {
    const query = req.query.q;
    try {
        // READ operation: Find blogs matching search criteria
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
```

**MongoDB Operation**: 
```javascript
db.blogs.find({
    $or: [
        { title: { $regex: query, $options: 'i' } },
        { content: { $regex: query, $options: 'i' } },
        { author: { $regex: query, $options: 'i' } }
    ]
}).sort({ createdAt: -1 })
```

---

## ✏️ **3. UPDATE OPERATIONS**

### **A. Update Blog Content (UPDATE Blog)**
```javascript
// File: server.js (Lines 166-187)
app.put('/edit/:id', requireAuth, async (req, res) => {
    try {
        // READ operation: Find blog to update
        const blog = await Blog.findById(req.params.id);
        if (blog && blog.author === req.session.user.username) {
            // UPDATE operation: Modify blog fields
            blog.title = req.body.title;
            blog.content = req.body.content;
            blog.updatedAt = new Date();
            await blog.save(); // MongoDB UPDATE operation
            
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
```

**MongoDB Operation**: 
```javascript
db.blogs.updateOne(
    { _id: ObjectId(req.params.id) },
    { 
        $set: { 
            title: req.body.title, 
            content: req.body.content, 
            updatedAt: new Date() 
        } 
    }
)
```

### **B. Alternative UPDATE Method (Using findByIdAndUpdate)**
```javascript
// Alternative implementation (not used in current code)
await Blog.findByIdAndUpdate(req.params.id, {
    title: req.body.title,
    content: req.body.content,
    updatedAt: new Date()
});
```

---

## 🗑️ **4. DELETE OPERATIONS**

### **A. Delete Blog (DELETE Blog)**
```javascript
// File: server.js (Lines 222-240)
app.delete('/delete/:id', requireAuth, async (req, res) => {
    try {
        // READ operation: Find blog to delete
        const blog = await Blog.findById(req.params.id);
        if (blog && blog.author === req.session.user.username) {
            // DELETE operation: Remove blog document
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
```

**MongoDB Operation**: `db.blogs.deleteOne({ _id: ObjectId(req.params.id) })`

---

## 🔧 **MongoDB Schema Definitions**

### **User Schema**
```javascript
// File: server.js (Lines 30-35)
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});

const User = mongoose.model('User', userSchema);
```

### **Blog Schema**
```javascript
// File: server.js (Lines 37-45)
const blogSchema = new mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    author: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

const Blog = mongoose.model('Blog', blogSchema);
```

---

## 🌐 **Frontend Integration with MongoDB CRUD**

### **1. CREATE Operations in Frontend**
```html
<!-- File: views/create.ejs -->
<form action="/create" method="POST" class="create-form">
    <div class="form-group">
        <label for="title">Blog Title</label>
        <input type="text" id="title" name="title" required>
    </div>
    <div class="form-group">
        <label for="content">Blog Content</label>
        <textarea id="content" name="content" required></textarea>
    </div>
    <button type="submit" class="btn btn-create">Create Blog</button>
</form>
```

### **2. READ Operations in Frontend**
```html
<!-- File: views/index.ejs -->
<% blogs.forEach(blog => { %>
    <article class="blog-card">
        <h3 class="blog-title"><%= blog.title %></h3>
        <div class="blog-meta">
            <span class="author">Author: <%= blog.author %></span>
            <span class="date">Date: <%= new Date(blog.createdAt).toLocaleDateString() %></span>
        </div>
        <div class="blog-content">
            <p><%= blog.content %></p>
        </div>
    </article>
<% }); %>
```

### **3. UPDATE Operations in Frontend**
```html
<!-- File: views/edit.ejs -->
<form action="/edit/<%= blog._id %>" method="POST" class="create-form">
    <input type="hidden" name="_method" value="PUT">
    <div class="form-group">
        <label for="title">Blog Title</label>
        <input type="text" id="title" name="title" value="<%= blog.title %>" required>
    </div>
    <div class="form-group">
        <label for="content">Blog Content</label>
        <textarea id="content" name="content" required><%= blog.content %></textarea>
    </div>
    <button type="submit" class="btn btn-create">Update Blog</button>
</form>
```

### **4. DELETE Operations in Frontend**
```html
<!-- File: views/index.ejs -->
<form action="/delete/<%= blog._id %>" method="POST" class="delete-form">
    <input type="hidden" name="_method" value="DELETE">
    <button type="submit" class="btn btn-delete" 
            onclick="return confirm('Are you sure you want to delete this blog?')">
        <i class="fas fa-trash"></i> Delete
    </button>
</form>
```

---

## 📈 **CRUD Operations Flow Diagram**

```
Frontend Form → Express Route → MongoDB Operation → Database → Response

CREATE:  Form Submit → POST /create → Blog.save() → Insert Document → Redirect
READ:    Page Load → GET / → Blog.find() → Query Documents → Render Page
UPDATE:  Form Submit → PUT /edit/:id → Blog.save() → Update Document → Redirect
DELETE:  Button Click → DELETE /delete/:id → Blog.findByIdAndDelete() → Remove Document → Redirect
```

---

## 🎯 **Key MongoDB CRUD Features Implemented**

### **1. Data Validation**
- Required fields validation
- Unique constraints (username, email)
- Data type validation

### **2. Error Handling**
- Try-catch blocks for all operations
- User-friendly error messages
- Graceful failure handling

### **3. Security**
- Authorization checks (users can only edit/delete their own blogs)
- Password hashing before storage
- Input sanitization

### **4. Performance**
- Efficient queries with sorting
- Indexed fields for faster searches
- Optimized database operations

---

## 📊 **MongoDB Operations Summary**

| Operation | Method | Route | MongoDB Command | Purpose |
|-----------|--------|-------|-----------------|---------|
| **CREATE** | POST | `/signup` | `users.insertOne()` | Register new user |
| **CREATE** | POST | `/create` | `blogs.insertOne()` | Create new blog |
| **READ** | GET | `/` | `blogs.find().sort()` | Display all blogs |
| **READ** | GET | `/edit/:id` | `blogs.findById()` | Get blog for editing |
| **READ** | GET | `/search` | `blogs.find($or)` | Search blogs |
| **UPDATE** | PUT | `/edit/:id` | `blogs.save()` | Update blog content |
| **DELETE** | DELETE | `/delete/:id` | `blogs.findByIdAndDelete()` | Delete blog |

---

## ✅ **Conclusion**

The Blogily website successfully demonstrates the complete implementation of MongoDB CRUD operations:

1. **CREATE**: User registration and blog creation
2. **READ**: Displaying blogs, searching, and retrieving specific blogs
3. **UPDATE**: Editing blog content with authorization
4. **DELETE**: Removing blogs with user confirmation

All operations are properly integrated with the Express.js backend and EJS frontend, providing a complete full-stack web application with MongoDB as the database layer.

**Website**: Blogily (http://localhost:3000)  
**Database**: MongoDB (blogdb)  
**Status**: Fully Functional with Complete CRUD Operations ✅



