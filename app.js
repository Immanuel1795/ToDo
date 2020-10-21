
const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const _ = require ("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));



mongoose.connect("mongodb://localhost:27017/ToDoListDataBasee",{useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false});

const day = date.getDate();

const itemsSchema = {
    name: String
};

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
    name: "Finibus Bonorum"
});

const item2 = new Item({
    name: "Sed Ut Perspiciatis"
});

const item3 = new Item({
    name: "Voluptatem Accusantium"
});

const defaultItems = [item1, item2, item3];

const listSchema = {
    name: String,
    items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);


app.get("/", function(req, res) {

const day = date.getDate();
  
  Item.find({}, function(err, foundItems){
      if(foundItems.length === 0){
          Item.insertMany(defaultItems, function(err){
              if(err){
                  console.log(err);
              }
          });
          res.redirect("/");
      }else{
          
          res.render("list", {listTitle: day, newListItems: foundItems});
      }
  })
  

});

app.post("/", function(req, res){

    const itemName = req.body.newItem;
    const listName = req.body.list;
    
    const item = new Item({
        name: itemName
    });
    
    if(listName === day){
        item.save();
        res.redirect("/");
    } else {
        List.findOne({name: listName}, function(err, foundList){
           foundList.items.push(item);
           foundList.save();
           res.redirect("/" + listName);
        });
    }
    
    

});

app.get("/:customListName", function(req, res){
        
    const customList = _.capitalize(req.params.customListName);
    
    List.findOne({name: customList}, function(err, foundList){
       if(!err){
           if(!foundList){
           const list = new List({
           name:  customList,
           items: defaultItems
           });
           list.save();
            res.redirect("/" + customList);
        }else{
           res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
       }       
       } 
 
    });
    
   
});

app.post("/delete", function(req, res){
    const checkedItemId = req.body.checkbox;
    const listName = req.body.listName;
    
    if( listName === day){
    Item.findByIdAndRemove(checkedItemId, function(err){
       if (!err){
           res.redirect("/");
       } 
    });
    }else {
        List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, function (err){
         if(!err){
           res.redirect("/" + listName);
       }                 
       });
    }
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});

