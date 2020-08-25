const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
const ejs =require("ejs");
const app = express();

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));
app.set('view engine', 'ejs');

mongoose.connect('mongodb://localhost/itemDataBase', {useNewUrlParser: true,useUnifiedTopology: true,useFindAndModify:true });

const itemSchema = new mongoose.Schema({
    name:String
})

const Item = mongoose.model("Item",itemSchema);

const listSchema =new mongoose.Schema({
    listName:String,
    items:[itemSchema]
})

const List =mongoose.model("List",listSchema);

app.get("/",(req,res)=>{
    Item.find((err,items)=>{
        if(err)
        console.log(err);
        else
        res.render("temp.ejs",{list:"Today",Items:items});
    })
})

app.post("/",(req,res)=>{
    const listName =_.capitalize(req.body.list);
    const item=new Item({
        name:req.body.item
    })
    if(req.body.list==="Today")
    {
        item.save();
        res.redirect("/");
    }
    else
    {
        List.findOne({listName:listName},(err,foundList)=>{
            if(err)
            console.log(err);
            else
            {
                foundList.items.push(item);
                foundList.save();
                res.redirect("/"+listName);
            }
        })
    }
})

app.get("/:listName",(req,res)=>{
   const listName=_.capitalize(req.params.listName)
   List.findOne({listName:listName},(err,list)=>{
    if(err)
       console.log(err);
    else
    if(!list)
    {
        const list =new List({
            listName:listName,
            items:[]
        })
        list.save();
        res.redirect("/"+listName);
    }
    else
    res.render("temp.ejs",{list:listName,Items:list.items});
   })
})

app.post("/delete",(req,res)=>{
    
    const listName =req.body.listName;

    if(listName==="Today")
    {
        Item.findByIdAndRemove({_id:req.body.itemId},(err)=>{
            if(err)
            console.log(err);
        });
        res.redirect("/");
    }
    else
    {
        List.findOneAndUpdate({listName:listName},{$pull:{items:{_id:req.body.itemId}}},(err)=>{
            if(!err)
            res.redirect("/"+listName)
        })
    }

})


app.listen("3000",()=>{
    console.log("server is running at port 3000");
})