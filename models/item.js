const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const ItemSchema = new Schema(
  {
    name: {type: String, required: true},
    category: {type: Schema.Types.ObjectId, ref: 'Category', required: true},
    description: {type: String, required: true},
    price: {type: Number, required: true},
    stockitems: {type: Number, required: true }
  }
);

// Virtual for book's URL
ItemSchema
.virtual('url')
.get(function () {
  return '/item/' + this._id;
});

//Export model
module.exports = mongoose.model('Item', ItemSchema);