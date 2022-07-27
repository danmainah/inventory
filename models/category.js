var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var CategorySchema = new Schema({
  name: { type: String, required: true, maxLength: 100 },
  description: { type: String, required: true, maxLength: 1000 }
});

// Virtual for author "full" name.
CategorySchema.virtual('categoryname').get(function() {
  return this.name;
});

// Virtual for this author instance URL.
CategorySchema.virtual('url').get(function() {
  return '/category/' + this._id;
});

// Export model.
module.exports = mongoose.model('Category', CategorySchema);