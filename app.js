//jshint esversion:6

const { name } = require("ejs");
const express = require("express");
const mongoose= require("mongoose")
const _=require("lodash")
const dontev= require('dotenv').config()
const PORT = process.env.PORT || 3000

const app = express();

app.set('view engine', 'ejs');

app.use(express.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect(process.env.DB_HOST,{useNewUrlParser:true})

 
const itemsSchema = new mongoose.Schema({
  
  name:  String
});

const Item=mongoose.model("item",itemsSchema)

 const uno=new Item({name:"buy fishing equipment!"})
 const due=new Item({name:"meditate!"})
 const tre= new Item({name:"heal!"})

const defaultItems=[uno,due,tre] 

 // Item.insertMany(defaultItems).then( docs => {});

app.get("/", function(req, res) {


  Item.find({}).then(foundItems =>{
    if (foundItems.length===0){Item.insertMany(defaultItems).then( docs => {})
    res.redirect("/");}
    else { res.render("list", {listTitle: "today", newListItems:foundItems})}}
  
  );

  
});


const listSchema = new mongoose.Schema({
  
  name:  String,
  items : [itemsSchema]
});
app.post("/delete", function(req, res){
  const checkedItem = req.body.checkbox;
  const listName = req.body.listName;

 if(listName === "today"){
   Item.deleteOne({_id: checkedItem}).then(function () {
       console.log("Successfully deleted");
       res.redirect("/");
    })
    .catch(function (err) {
       console.log(err);
     });
 }else{
   let doc =  List.findOneAndUpdate({name:listName}, {$pull: {items: {_id: checkedItem}}}, {
       new: true
     }).then(function (foundList)
     {
       res.redirect("/" + listName);
     }).catch( err => console.log(err));
 }
})



const List=mongoose.model("list",listSchema)

app.get("/:what", function(req,res){
  const customListName= _.capitalize(req.params.what) 

  List.findOne({name: customListName}) 
  .then((foundList)=> 
  {
     if(!foundList)
     {
       //Creating a new list 
       const list = new List({
         name: customListName,
         items: defaultItems
      });
      list.save();
      res.redirect("/" + customListName);
     }
     else
     {
      
       res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
     }
  })
  .catch((err)=>{
    console.log(err);
  })
 }); 


 app.post("/", async(req, res)=>{

  const item = req.body.newItem;
  
  let listName = req.body.list

  const newItem= new Item({name:item})
  
  if (listName==="today"){
    newItem.save()
    res.redirect("/")
  }
  else{
     List.findOne({ name: listName }).exec().then(foundList => {
      
      console.log(  foundList )
     foundList.items.push(newItem)
     foundList.save()
      res.redirect("/" + listName)
   
  }).catch(err => { 
      console.log(err);
  });
  }
  
});



app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
