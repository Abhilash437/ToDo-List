// const express = require('express');
// const bodyPraser = require('body-parser');
//
// const app = express();
// var items = ["Buy Food"];
// app.set('view engine', 'ejs');
// app.use(bodyPraser.urlencoded({extended:true}));
// app.get("/",function(req,res){
//
//   var today = new Date();
//   // var day = "";
//   // var date = today.getDay();
//   // switch(date){
//   //   case 1:
//   //     day = "Monday";
//   //     break;
//   //   case 2:
//   //     day = "Tuesday";
//   //     break;
//   //   case 3:
//   //     day = "Wednesday";
//   //     break;
//   //   case 4:
//   //     day = "Thursday";
//   //     break;
//   //   case 5:
//   //     day = "Friday";
//   //     break;
//   //   case 6:
//   //     day = "Saturday";
//   //     break;
//   //   case 0:
//   //     day = "Sunday";
//   // }
//   //
//   // res.render('list', {kindOfDay: day});
//
//   var options = {
//     weekday: 'long',
//     day: 'numeric',
//     month: 'long'
//   }
//
//   var day = today.toLocaleDateString('en-US',options);
//   res.render('list', {kindOfDay: day, newListItem:items});
//
// });
//
// app.post("/",function(req,res){
//   // console.log(res);
//   var item = req.body.toDoItem;
//   items.push(item);
//   res.redirect("/");
// })
//
// app.listen(3000,function(){
//   console.log("Server is running on port 3000");
// })

const express = require('express');
const bodyPraser = require('body-parser');
//const date = require(__dirname+"/date.js");
const mongoose = require('mongoose');
const _ = require('lodash');
const app = express();
app.set('view engine', 'ejs');
app.use(express.static("public"))

app.use(bodyPraser.urlencoded({extended:true}));

mongoose.connect('mongodb+srv://Abhilash:Abhilash11@atlascluster.fshfq.mongodb.net/todolistDB');

const itemschema = new mongoose.Schema({
  name: String,
});

const Item = mongoose.model("Item",itemschema);

// const item1 = new Item({
//   name: "Welcome to your ToDo List",
// })

const item2 = new Item({
  name: "Click + button to add",
})

const item3 = new Item({
  name: "Click on checkbox to delete",
})

const defaultItems = [item2,item3];

const listschema = new mongoose.Schema({
  name: String,
  items: [itemschema]
})

const List = mongoose.model("List",listschema);

// Item.insertMany([item1,item2,item3],(err)=>{
//   if(err)
//   console.log(err);
//   else
//   console.log("Successfully added");
// });


app.get("/",(req,res)=>{
  //let day = date();
  Item.find({},(err,foundItems)=>{
    console.log(foundItems);
    if(foundItems.length === 0){
      Item.insertMany(defaultItems,(err)=>{
        if(err)
        console.log(err);
        else
        console.log("Successfully added");
      });
      res.redirect("/");
    }else{
    res.render("list",{listTitle:"Today", newListItem:foundItems});
    }
  });
})

app.post("/",(req,res)=>{
  let itemName = req.body.toDoItem;
  let listName = req.body.list;
  const itemDB = new Item({
    name: itemName
  })
  if(listName === "Today"){
    res.redirect("/");
    itemDB.save();
  }else{
    List.findOne({name:listName},(err,list)=>{
      if(!err){
        list.items.push(itemDB);
        list.save();
        res.redirect("/"+listName);
      }
    })
  }

});

app.post("/deletedItems",(req,res)=>{
  console.log(req.body.checkbox);
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;
  if(listName==="Today"){
    Item.findByIdAndRemove(checkedItemId,(err)=>{
      if(err)console.log(err);
      else console.log("Successfully deleted");
    });
    res.redirect("/");
  }else{
    List.findOneAndUpdate({name:listName},{$pull: {items: {_id:checkedItemId}}},(err)=>{
      if(err)
        console.log(err);
      else
        console.log("Successfully deleted");
      res.redirect("/"+listName);
    })
  }
})

app.get("/:customListName",(req,res)=>{
  let customListName = req.params.customListName;
  customListName = _.capitalize(customListName);
  List.findOne({name:customListName},(err,list)=>{
    if(!err){
      if(!list){
        console.log("Not found its a new one");
        const list = new List({
          name: customListName,
          items: defaultItems
        })
        list.save();
        res.redirect("/"+customListName);
      }else{
        console.log(customListName);
        res.render("list",{listTitle:list.name, newListItem:list.items});
      }
    }else
      console.log(err);
  })
})

app.get('/about',(req,res)=>{
  res.render('about');
})

app.listen(process.env.PORT || 8000,()=>{
  console.log("Server is running on port 8000");
})
