require('dotenv').config();
const mongoose = require("mongoose");

const url =process.env.TEST_MONGODB_URI;

mongoose.set("strictQuery",false);
mongoose.connect(url);

const blogSchema = new mongoose.Schema({
	name: String,
	number: Number,
});

blogSchema.set("toJSON", {
	transform: (document, returnedObject) => {
		returnedObject.id = returnedObject._id.toString();
		delete returnedObject._id;
		delete returnedObject.__v;
	}
});

const Blog = mongoose.model("Blog", blogSchema);

const blog1 = new Blog({
	name: 'note1',
	number: 1,
});

const blog2 = new Blog({
	name: 'note2',
	number: 2,
});

blog1.save().then(result => {
  console.log('blog saved!')
  mongoose.connection.close()
})

blog2.save().then(result => {
  console.log('blog saved!')
  mongoose.connection.close()
})
