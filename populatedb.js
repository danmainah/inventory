#! /usr/bin/env node

console.log('This script populates some items and categories to the database. Specified database as argument - e.g.: populatedb mongodb+srv://cooluser:coolpassword@cluster0.a9azn.mongodb.net/local_library?retryWrites=true');

// Get arguments passed on command line
var userArgs = process.argv.slice(2);
/*
if (!userArgs[0].startsWith('mongodb')) {
    console.log('ERROR: You need to specify a valid mongodb URL as the first argument');
    return
}
*/
var async = require('async')
var Item = require('./models/item')
var Category = require('./models/category')

//Set up mongoose connection
const mongoose = require('mongoose');
const mongoDB = 'mongodb+srv://odin2022:hL6dd4_25dCDxa@cluster0.yglyc.mongodb.net/?retryWrites=true&w=majority';
mongoose.connect(mongoDB, { useNewUrlParser: true , useUnifiedTopology: true});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

var categories = []
var items = []


function categoryCreate(name, description, cb) {
  categorydetail = {name:name , description: description }

  var category = new Category(categorydetail);
       
  category.save(function (err) {
    if (err) {
      cb(err, null)
      return
    }
    console.log('New Category: ' + category);
    categories.push(author)
    cb(null, category)
  }  );
}


function itemCreate(name, description, price, category, stockitems, cb) {
  itemdetail = { 
    name: name,
    description: description,
    category: category,
    price: price,
    stockitems: stockitems
  }
   
  var item = new Item(itemdetail);    
  item.save(function (err) {
    if (err) {
      cb(err, null)
      return
    }
    console.log('New Item: ' + item);
    items.push(item)
    cb(null, item)
  }  );
}


function createCategories(cb) {
    async.series([
        function(callback) {
          categoryCreate('Hp', ' HP, was an American multinational information technology company headquartered in Palo Alto, California. HP developed and provided a wide variety of hardware components, as well as software and related services to consumers, small and medium-sized businesses', callback);
        },
        function(callback) {
          categoryCreate('Dell', 'Dell is an American multinational technology company that develops, sells, repairs, and supports computers and related products and services, and is owned by its parent company of Dell Technologies', callback);
        },
        function(callback) {
          categoryCreate('Asus', 'ASUS is a leading company driven by innovation and commitment to quality for products that include notebooks, netbooks, motherboards, graphics cards', callback);
        },
        function(callback) {
          categoryCreate('Lenovo', 'Lenovo Group Limited, often shortened to Lenovo (/ləˈnoʊvoʊ/ lə-NOH-voh, Chinese: 联想; pinyin: Liánxiǎng), is an American Chinese[7] multinational technology company specializing in designing, manufacturing, and marketing consumer electronics, personal computers, software, business solutions, and related services. Products manufactured by the company include desktop computers, laptops, tablet computers, smartphones, workstations, servers, supercomputers, electronic storage devices,', callback);
        },
        function(callback) {
            categoryCreate('Apple', 'Apple Inc. is an American multinational technology company that specializes in consumer electronics, software and online services headquartered in Cupertino, California, United States', callback);
          },
        ],
        // optional callback
        cb);
}


function createItems(cb) {
    async.parallel([
        function(callback) {
          itemCreate('Hp Envy', 'HP Envy 13-ba0xxx 10th Gen Intel Core i7-1065G7 8GB RAM 256GB SSD 13.3" FHD LCD BrightView LED Display Backlit Keyboard Bluetooth Webcam WiFi Windows 10 Home', '1000', categories[0], 25, callback);
        },
        function(callback) {
          itemCreate('Asus Vivobook', 'Asus VivoBook Flip 14 x360 10th Gen Intel Core i7-10510U @1.8GHz 8GB RAM 512GB SSD 14" FHD Touch Screen Display Backlit Keyboard Intel UHD Graphics 620 Bluetooth Webcam WiFi Windows 11 TP412F ', '800', categories[1], 30, callback);
        },
        function(callback) {
          itemCreate("Lenovo ThinkBook", 'Lenovo ThinkBook 13s G2 ITL 11th Gen Intel Core i7-1165G7 @2.8GHz 16GB RAM 512GB SSD 13.3" WUXGA IPS Display Bluetooth Webcam WiFi Integrated Intel Iris Xe Graphics Windows 10 Pro Mineral Grey 1 Year Warranty', '1100', categories[2], 15, callback);
        },
        function(callback) {
          itemCreate("HP Spectre x360 15", "HP Spectre x360 15-eb1xxx 11th Gen Intel Core i7-1165G7 @2.8GHz 16GB RAM 1TB SSD Plus 32GB Intel Optane 15.6 Diagonal UHD OLED Touch Screen Display Webcam WiFi Backlit Keyboard Bluetooth Windows 11 Home 1 Year Warranty.", '1500', categories[1], 14, callback);
        },
        function(callback) {
          itemCreate("Dell Vostro","Dell Vostro 3400 Core I5-1135G7 11th Gen 4GB RAM 1TB HDD 14 Inch FHD Intel Iris Xe Graphics Ubuntu 1 Year Warranty", 450, categories[1], 11, callback);
        },
        function(callback) {
          itemCreate('HP Omen 16', 'HP Omen 16-b0080TX 11th Gen Intel Core i7-11800H up to 4.6GHz 16GB RAM 512GB SSD 16.1" Diagonal QHD IPS Display Intel Turbo Boost Technology Dedicated 6GB NVIDIA GeForce RTX 3060 Ti Graphics Thunderbolt Bluetooth HD Webcam WiFi Bang&Olufsen Windows 10 Home 1 Year Warranty', '2000', categories[4], 6, callback);
        },
        function(callback) {
          itemCreate('MacBook Pro 14.2', 'Apple MacBook Pro 14.2" Liquid Retina XDR Display 16GB RAM 512GB SSD M1 Pro Chip 8C CPU 14C GPU ProMotion Thunderbolt 4 Touch ID Late 2021 Model With M1 Chip MKGP3 Space Gray', 2000, categories[4], 4, callback)
        }
        ],
        // optional callback
        cb);
}





async.series([
    createCategories,
    createItems
],
// Optional callback
function(err, results) {
    if (err) {
        console.log('FINAL ERR: '+err);
    }
    else {
        console.log('Items: '+items);
        
    }
    // All done, disconnect from database
    mongoose.connection.close();
});
