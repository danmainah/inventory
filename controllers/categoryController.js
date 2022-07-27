const Category = require('../models/category');
const async = require('async');
const Item = require('../models/item');
const { body,validationResult } = require('express-validator');


// Display list of all Authors.
exports.category_list = function(req, res, next) {

    Category.find()
      .sort([['name', 'ascending']])
      .exec(function (err, list_categories) {
        if (err) { return next(err); }
        //Successful, so render
        res.render('category_list', { title: 'Category List', category_list: list_categories });
      });
  
  };
  
// Display detail page for a specific Author.
exports.category_detail = function(req, res, next) {

    async.parallel({
        category: function(callback) {
            Category.findById(req.params.id)
              .exec(callback)
        },
        categories_items: function(callback) {
          Item.find({ 'category': req.params.id },'title summary')
          .exec(callback)
        },
    }, function(err, results) {
        if (err) { return next(err); } // Error in API usage.
        if (results.category==null) { // No results.
            var err = new Error('Category not found');
            err.status = 404;
            return next(err);
        }
        // Successful, so render.
        res.render('category_detail', { title: 'Category Detail', category: results.category, category_items: results.categories_items } );
    });

};

// Display Author create form on GET.
exports.category_create_get = function(req, res, next) {
    res.render('category_form', { title: 'Create Category'});
};


// Handle Author create on POST.
exports.category_create_post = [

    // Validate and sanitize fields.
    body('name').trim().isLength({ min: 1 }).escape().withMessage('Name must be specified.')
        .isAlphanumeric().withMessage('First name has non-alphanumeric characters.'),
    body('description').trim().isLength({ min: 1 }).escape().withMessage('Description must be specified.')
        .isAlphanumeric().withMessage('Family name has non-alphanumeric characters.'),
    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/errors messages.
            res.render('category_form', { title: 'Create Category', category: req.body, errors: errors.array() });
            return;
        }
        else {
            // Data from form is valid.

            // Create an Author object with escaped and trimmed data.
            var category = new Category(
                {
                    name: req.body.name,
                    description: req.body.description
                });
            category.save(function (err) {
                if (err) { return next(err); }
                // Successful - redirect to new author record.
                res.redirect(category.url);
            });
        }
    }
];

// Display Author delete form on GET.
exports.category_delete_get = function(req, res, next) {

    async.parallel({
        category(callback) {
            Category.findById(req.params.id).exec(callback)
        },
        categories_items(callback) {
            Item.find({ 'category': req.params.id }).exec(callback)
        },
    }, function(err, results) {
        if (err) { return next(err); }
        if (results.category==null) { // No results.
            res.redirect('/categories');
        }
        // Successful, so render.
        res.render('category_delete', { title: 'Delete Category', category: results.category, category_items: results.categories_items } );
    });

};

// Handle Category delete on POST.
exports.category_delete_post = function(req, res, next) {

    async.parallel({
        category(callback) {
          Category.findById(req.body.categoryid).exec(callback)
        },
        categories_items(callback) {
          Item.find({ 'category': req.body.categoryid }).exec(callback)
        },
    }, function(err, results) {
        if (err) { return next(err); }
        // Success
        if (results.authors_books.length > 0) {
            // Category has items. Render in same way as for GET route.
            res.render('category_delete', { title: 'Delete Category', category: results.category, category_items: results.categories_items } );
            return;
        }
        else {
            // Category has no items. Delete object and redirect to the list of categories.
            Category.findByIdAndRemove(req.body.categoryid, function deleteCategory(err) {
                if (err) { return next(err); }
                // Success - go to category list
                res.redirect('/categories')
            })
        }
    });
};

// Display Category update form on GET.
exports.category_update_get = function (req, res, next) {

    Category.findById(req.params.id, function (err, category) {
        if (err) { return next(err); }
        if (category == null) { // No results.
            var err = new Error('Category not found');
            err.status = 404;
            return next(err);
        }
        // Success.
        res.render('category_form', { title: 'Update Category', category: category });

    });
};

// Handle Category update on POST.
exports.category_update_post = [

    // Validate and santize fields.
    body('name').trim().isLength({ min: 1 }).escape().withMessage('Name must be specified.')
        .isAlphanumeric().withMessage('Name has non-alphanumeric characters.'),
    body('description').trim().isLength({ min: 1 }).escape().withMessage('Description must be specified.')
        .isAlphanumeric().withMessage('Description has non-alphanumeric characters.'),
    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create Author object with escaped and trimmed data (and the old id!)
        var category = new Category(
            {
                name: req.body.name,
                description: req.body.description,
                _id: req.params.id
            }
        );

        if (!errors.isEmpty()) {
            // There are errors. Render the form again with sanitized values and error messages.
            res.render('category_form', { title: 'Update Category', category: category, errors: errors.array() });
            return;
        }
        else {
            // Data from form is valid. Update the record.
            Category.findByIdAndUpdate(req.params.id, category, {}, function (err, thecategory) {
                if (err) { return next(err); }
                // Successful - redirect to category detail page.
                res.redirect(thecategory.url);
            });
        }
    }
];