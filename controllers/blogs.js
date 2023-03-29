const jwt = require('jsonwebtoken');
const blogsRouter = require('express').Router();
const Blog = require('../models/blog');
const Comment = require('../models/comment');
const User = require('../models/user')
const logger = require('../utils/logger');

const getTokenFrom = request => {
  const authorization = request.get('authorization')
  if (authorization && authorization.startsWith('Bearer ')) {
    return authorization.replace('Bearer ', '')
  }
  return null
}

blogsRouter.get('/', (request, response) => {
  response.send(`<h1>TITLE</h1>`);
})

blogsRouter.get('/api/blogs', (request, response) => {
Blog
.find({})
.populate('user', {username: 1, name: 1})
.then(blogs => {
  response.json(blogs)
})
})


blogsRouter.delete('/api/blogs/:id', async (request, response, next) => {
  try {
    await Blog.findByIdAndRemove(request.params.id)
			response.status(204).end();
  } catch(exception) {
    next(exception);
  }
})

blogsRouter.put('/api/blogs/:id', async (request, response, next) => {
  const { title, author, url, likes, comments } = request.body;
  try {
    const savedBlog = await Blog.findByIdAndUpdate(request.params.id, {title, author, url, likes, comments}, { new: true, runValidators: true, context: "query" })
      response.status(201).json(savedBlog);
  } catch(exception) {
    next(exception);
  }
})

blogsRouter.post('/api/blogs', async (request, response, next) => {
const body = request.body;
if (!body.author ) {
return response.status(400).json({ 
  error: "content missing from user request" 
});
}

const decodedToken = jwt.verify(getTokenFrom(request), process.env.SECRET)
if (!decodedToken.id) {
  return response.status(401).json({ error: 'token invalid' })
}
const user = body.user || await User.findById(decodedToken.id);

const blog = new Blog({
title: body.title,
author: body.author,
url: body.url,
likes: body.likes,
user: user.id,
comments: body.comments
});

try{
const savedBlog = await blog.save();
user.blogs = user.blogs.concat(savedBlog._id);
await user.save();
response.json(savedBlog)
} catch(error) {
error => next(error);
}
})

module.exports = blogsRouter;