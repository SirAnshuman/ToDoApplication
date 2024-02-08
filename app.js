const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const { SchemaType, default: mongoose } = require('mongoose');

app.use( bodyParser.urlencoded({extended: true}));
app.set('view engine', 'ejs');
app.use( express.static("public"));

mongoose.connect("mongodb://0.0.0.0:27017/todolist", {useNewUrlParser: true})
.then( ()=> console.log("Succesfully Connected to MongoDB"))
.catch((err) => console.log(err) );

const itemSchema = new mongoose.Schema({
    name: String,
})

const Item = mongoose.model("Item", itemSchema);

const item1 = new Item({
    name: "Buy Groceries"
});

const item2 = new Item({
    name: "Buy Milk"
});

const item3 = new Item({
    name: "Finish Homework"
});

const defaultItems = [item1, item2, item3];

const listSchema = {
    name: String,
    items: [itemSchema]
}

const List = mongoose.model("List", listSchema);

Item.find()
.then((data)=>{
    if( data.length == 0 ){
        Item.insertMany( defaultItems)
        .then( ()=> console.log("Succesfully Inserted All"))
        .catch((err) => console.log(err) );
    }
})
.catch((err) => console.log(err) );

var items = ["Buy Milk","Finish Homework"];
var workItems = ["Finish PPT","Submit Report"];

app.get( "/", function(req, res){
    Item.find()
    .then((data)=>{
        res.render("lists", {
            day: "Today",
            todayTasks: data
        });
    })
})

app.get( "/:listName", function(req, res){
    
    var listTitle = req.params.listName;
    List.findOne( {name: listTitle} )
    .then( (data)=> {
        res.render("lists", {
            day: listTitle,
            todayTasks: data.items
        });
    })
    .catch((err) =>{
        const list = new List({
            name: listTitle,
            items: []
        })
        list.save();
        res.redirect("/" + listTitle);
    });
  })


app.post( "/", function(req, res){
    const content = req.body.task;
    const list = req.body.button;

    const newItem = new Item({
        name: content
    })
    
    if( list == "Today"){
        newItem.save();
        res.redirect("/");
    }
    else{
        List.findOne( {name: list} )
        .then( (data)=> {

        data.items.push(newItem);
        data.save();
        res.redirect("/" + list);
        })
    }
})

app.post( "/delete", function(req, res){

    const listTitle = req.body.listname;
    const rem = req.body.remove;

    if( listTitle == "Today"){
        Item.deleteOne( { _id: req.body.remove})
        .then( ()=> console.log("Succesfully Deleted"))
        .catch((err) => console.log(err) );

        setTimeout(function() {
            res.redirect("/");
        }, 500); 
    }

    else{
        List.findOneAndUpdate({name: listTitle}, { $pull:{ items:{_id: rem}}})
        .then( console.log("Deleted"))

    setTimeout(function() {
        res.redirect("/" + listTitle);
      }, 500); 
    }
})


app.listen(3000, function(){
    console.log("Server Initialized");
})