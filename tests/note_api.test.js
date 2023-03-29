const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app');
// const blog = require('../models/blog');
const helper = require('./test_helper');

const api = supertest(app);

const Blog = require('../models/blog')
const bcrypt = require('bcrypt')
const User = require('../models/user')


describe('when there is initially one user in db', () => {
  beforeEach(async () => {
    await User.deleteMany({})

    const passwordHash = await bcrypt.hash('sekret', 10)
    const user = new User({ username: 'root', passwordHash })

    await user.save()
  })

  test('creation succeeds with a fresh username', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'mluukkai',
      name: 'Matti Luukkainen',
      password: 'salainen',
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(usersAtStart.length + 1)

    const usernames = usersAtEnd.map(u => u.username)
    expect(usernames).toContain(newUser.username)
  })

  // test('creation fails with proper statuscode and message if username already taken', async () => {
  //   const usersAtStart = await helper.usersInDb()

  //   const newUser = {
  //     username: 'root',
  //     name: 'Superuser',
  //     password: 'salainen',
  //   }

  //   const result = await api
  //     .post('/api/users')
  //     .send(newUser)
  //     .expect(400)
  //     .expect('Content-Type', /application\/json/)

  //   expect(result.body.error).toContain('expected `username` to be unique')

  //   const usersAtEnd = await helper.usersInDb()
  //   expect(usersAtEnd).toEqual(usersAtStart)
  // })
})

const initialBlogs = [
  {
    title: 'note1',
    author: '1',
    url: '1',
    likes: 1
  },
  {
    title: 'note2',
    author: '2',
    url: '2',
    likes: 2
  },
]

beforeEach(async () => {
  await Blog.deleteMany({});
  let blogObject = new Blog(initialBlogs[0]);
  await blogObject.save();
  blogObject = new Blog(initialBlogs[1]);
  await blogObject.save();
}, 100000)

test('notes are returned as json', async () => {
  await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/)
}, 100000)

test('there are two notes', async () => {
  const response = await api.get('/api/blogs')

  expect(response.body).toHaveLength(2)
}, 100000)

test('the first note is about HTTP methods', async () => {
  const response = await api.get('/api/blogs')

  const contents = response.body.map(r => r.title)
  expect(contents).toContain(
    'note1'
  )
}, 100000)

test('there is a new flavor idea', async () => {
  const response = await api.get('/api/blogs');
  expect(response.body[0].id).toBeDefined();
}, 100000);

test('a valid note can be added', async () => {
  const newBlog = {
    title: 'async/await simplifies making async calls',
    author: 'true',
    url: '1',
    likes: 1
  }

  await api
    .post('/api/blogs')
    .send(newBlog)
    // .expect(201)
    // .expect('Content-Type', /application\/json/)

  const response = await api.get('/api/blogs')

  // const titles = response.body.map(r => r.title)

  expect(response.body).toHaveLength(initialBlogs.length + 1)
  // expect(titles).toContain(
  //   'async/await simplifies making async calls'
  // )
})

describe('deletions', () => {
  test.only('delete then check length', async () => {
    const blogs = await Blog.find({});
    let formatted = blogs.map(blog => blog.toJSON());
    let last = formatted[1];
    let id = last.id;
    await api.delete(`/api/blogs/${id}`);
    const blogsAtEnd = await Blog.find({});

    expect(blogsAtEnd).toHaveLength(
      initialBlogs.length - 1
    )
  })
})

describe('updates', () => {
  test.only('update then check content', async () => {
    const updatedBlog = {'title': 'test', 'author': 'test', 'url': 'test', 'likes': 1};
    const blogs = await Blog.find({});
    let formatted = blogs.map(blog => blog.toJSON());
    let last = formatted[1];
    let id = last.id;
    await api
    .put(`/api/blogs/${id}`)
    .send(updatedBlog)
    // await api.put(`/api/blogs/${id}`, {'title': 'test', 'author': 'test', 'url': 'test', 'likes': 1})
    // const blogsAtEnd = await Blog.find({})
    const response = await api.get('/api/blogs')

    // expect(blogsAtEnd).toHaveLength(initialBlogs.length);
    expect(response.body).toHaveLength(initialBlogs.length);

    // const titles = blogsAtEnd.map(r => r.title);
    const titles = response.body.map(r => r.title);
    expect(titles).toContain(
        'test'
    )
  })
})

afterAll(async () => {
  await mongoose.connection.close()
})