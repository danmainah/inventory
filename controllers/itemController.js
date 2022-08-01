const Category = require('../models/category7');
const Item = require('../models/item');
const { body,validationResult } = require('express-validator');
const async = require('async');

exports.index = function(req, res) {

    async.parallel({
        item_count: function(callback) {
            Item.countDocuments({}, callback); // Pass an empty object as match condition to find all documents of this collection
        },
        category_count: function(callback) {
            Category.countDocuments({}, callback);
        }
    }, function(err, results) {
        res.render('index', { title: 'Inventory', error: err, data: results });
    });
};

// Display list of all Items.
exports.item_list = function(req, res, next) {

    Item.find({}, 'name category')
      .sort({name : 1})
      .populate('category')
      .exec(function (err, list_items) {
        if (err) { return next(err); }
        //Successful, so render
        res.render('item_list', { title: 'Product List', item_list: list_items });
      });
  
  };
  
  // Display detail page for a specific item.
exports.item_detail = function(req, res, next) {

    async.parallel({
        item: function(callback) {

            Item.findById(req.params.id)
              .populate('category')
              .exec(callback);
        }
    }, function(err, results) {
        if (err) { return next(err); }
        if (results.item==null) { // No results.
            var err = new Error('Book not found');
            err.status = 404;
            return next(err);
        }
        // Successful, so render.
        res.render('item_detail', { title: results.item.name, item: results.item } );
    });

};

// Display item create form on GET.
exports.item_create_get = function(req, res, next) {

    // Get all categories, which we can use for adding to our book.
    async.parallel({
        categories(callback) {
            Category.find(callback);
        },
    }, function(err, results) {
        if (err) { return next(err); }
        res.render('item_form', { title: 'Create Product', categories: results.categories });
    });

};

// Handle item create on POST.
exports.item_create_post = [

    // Validate and sanitize fields.
    body('name', 'Name must not be empty.').trim().isLength({ min: 1 }).escape(),
    body('category', 'Category must not be empty.').trim().isLength({ min: 1 }).escape(),
    body('description', 'Description must not be empty.').trim().isLength({ min: 1 }).escape(),
    body('price', 'Price must not be empty').trim().isLength({ min: 1 }).escape(),
    body('stockItems', 'StockItems must not be empty').trim().isLength({ min: 1 }).escape(),
    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create a Book object with escaped and trimmed data.
        var item = new Item(
          { name: req.body.name,
            category: req.body.category,
            description: req.body.description,
            price: req.body.price,
            stockItems: req.body.stockItems
           });

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/error messages.

            // Get all ccategories for form.
            async.parallel({
                categories(callback) {
                    Category.find(callback);
                },
            }, function(err, results) {
                if (err) { return next(err); }

                // Mark our selected categories as checked.
                for (let i = 0; i < results.categories.length; i++) {
                    if (item.category.indexOf(results.categories[i]._id) > -1) {
                        results.categories[i].checked='true';
                    }
                }
                res.render('item_form', { title: 'Create Product',categories:results.categories, item: item, errors: errors.array() });
            });
            return;
        }
        else {
            // Data from form is valid. Save item.
            item.save(function (err) {
                if (err) { return next(err); }
                   //successful - redirect to new book record.
                   res.redirect(item.url);
                });
        }
    }
];

// Display item delete form on GET.
exports.item_delete_get = function(req, res, next) {

    async.parallel({
        item(callback) {
            Item.findById(req.params.id).exec(callback)
        },
    }, function(err, results) {
        if (err) { return next(err); }
        if (results.item==null) { // No results.
            res.redirect('/items');
        }
        // Successful, so render.
        res.render('item_delete', { title: 'Delete Product', item: results.item } );
    });

};

// Handle item delete on POST.
exports.item_delete_post = function(req, res, next) {

    async.parallel({
        item(callback) {
          Item.findById(req.body.itemid).exec(callback)
        },

    }, function(err, results) {
        if (err) { return next(err); }
        // Success
        Item.findByIdAndRemove(req.body.itemid, function deleteItem(err) {
            if (err) { return next(err); }
            // Success - go to books list
            res.redirect('/items')
        })
    });
};

// Display item update form on GET.
exports.item_update_get = function(req, res, next) {

    // Get item and  categories for form.
    async.parallel({
        item(callback) {
            Item.findById(req.params.id).populate('category').exec(callback);
        },
        categories(callback) {
            Category.find(callback);
        },
        }, function(err, results) {
            if (err) { return next(err); }
            if (results.item==null) { // No results.
                var err = new Error('Product not found');
                err.status = 404;
                return next(err);
            }
            // Success.
            res.render('item_form', { title: 'Update Product', categories: results.categories,  item: results.item });
        });

};

// Handle item update on POST.
exports.item_update_post = [
    // Validate and sanitize fields.
    body('name', 'Name must not be empty.').trim().isLength({ min: 1 }).escape(),
    body('category', 'Category must not be empty.').trim().isLength({ min: 1 }).escape(),
    body('description', 'Description must not be empty.').trim().isLength({ min: 1 }).escape(),
    body('price', 'Price must not be empty').trim().isLength({ min: 1 }).escape(),
    body('stockItems', 'StockItems must not be empty').trim().isLength({ min: 1 }).escape(),

    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create a Book object with escaped/trimmed data and old id.
        var item = new Item(
          { name: req.body.name,
            category: req.body.category,
            description: req.body.description,
            price: req.body.price,
           });

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/error messages.

            // Get all categories for form.
            async.parallel({
                categories(callback) {
                    Category.find(callback);
                },
            }, function(err, results) {
                if (err) { return next(err); }
                res.render('item_form', { title: 'Update Product',categories: results.categories, item: item, errors: errors.array() });
            });
            return;
        }
        else {
            // Data from form is valid. Update the record.
            Book.findByIdAndUpdate(req.params.id, item, {}, function (err,theitem) {
                if (err) { return next(err); }
                   // Successful - redirect to item detail page.
                   res.redirect(theitem.url);
                });
        }
    }
];