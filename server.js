const express=require("express");
const app=express();
const bcrypt=require("bcrypt")
const mongo=require("mongodb");
const mongoclient=mongo.MongoClient;
const bodyparser=require("body-parser");
app.use(bodyparser.json());
const cors=require("cors");
app.use(cors());
const jwt = require("jsonwebtoken");
require("dotenv").config();
const nodemailer = require("nodemailer");
const url=process.env.MONGO_URL;
app.post("/create-invoice",async(req,res)=>{
    const client=await mongoclient.connect(url);
    const db=client.db("assignment");
    const data= await db.collection("invocies").insertOne(req.body);
    if(data){
        res.json({
            message:"Data Inserted"
        })
        client.close();
    }else{
        res.json({
            message:"Data Not Inserted"
        })
        client.close()
    }
})
app.get("/all-invoice-details",async(req,res)=>{
    const client=await mongoclient.connect(url,{useUnifiedTopology:true});
    const db=client.db("assignment");
    const data= await db.collection("invocies").find().sort({doi:-1}).toArray();
    if(data){
        res.json(data)
        client.close();
    }else{
        res.json({ message:"No Data Found"})
        client.close()
    }
})
app.get("/all-invoice-details/:id",async(req,res)=>{
    const client=await mongoclient.connect(url,{useUnifiedTopology:true});
    const db=client.db("assignment");
    var Id=mongo.ObjectID(req.params.id)
    const data= await db.collection("invocies").findOne({_id:Id});
    if(data){
        res.json(data)
        client.close();
    }else{
        res.json({ message:"No Data Found"})
        client.close()
    }
})
app.put("/update-invoice",async(req,res)=>{
    const client=await mongoclient.connect(url,{useUnifiedTopology:true});
    const db=client.db("assignment");
    var Id=mongo.ObjectID(req.body.id)
    const data= await db.collection("invocies").findOneAndUpdate({_id:Id},{$set:{businessaddress:req.body.businessaddress,bphno:req.body.bphno,clientaddress:req.body.clientaddress,cphno:req.body.cphno,itemname1:req.body.itemname1,itemname2:req.body.itemname2,itemname3:req.body.itemname3,itemdes1:req.body.itemdes1,itemdes2:req.body.itemdes2,itemdes3:req.body.itemdes3,itemprice1:req.body.itemprice1,itemprice2:req.body.itemprice2,itemprice3:req.body.itemprice3,itemquantity1:req.body.itemquantity1,itemquantity2:req.body.itemquantity2,itemquantity3:req.body.itemquantity3,price1:req.body.price1,price2:req.body.price2,price3:req.body.price3}})
    if(data){
        res.json({
            message:"Data Updated"
        })
        client.close();
    }else{
        res.json({
            message:"Data not  Updated"
        })
        client.close();
    }
})
app.delete("/delete-invoice/:id",async(req,res)=>{
    const client=await mongoclient.connect(url,{useUnifiedTopology:true});
    const db=client.db("assignment");
    var Id=mongo.ObjectID(req.params.id)
    const data= await db.collection("invocies").deleteOne({_id:Id});
    if(data){
        res.json({
            message:"Data Deleted"
        })
        client.close();
    }else{
        res.json({
            message:"Data Not Deleted"
        })
        client.close();
    }
})

app.post("/adduser",async(req,res)=>{
    try {
        const client=await mongoclient.connect(url,{useUnifiedTopology:true});
        const db=client.db("assignment");
        const checkdata=await db.collection("invoice_users").findOne({email:req.body.email})
        
        if(!checkdata){
            const data= await db.collection("invoice_users").insertOne(req.body);
            if(data){
            res.json({
                message:"Data Inserted"
            })
    
            var transporter = nodemailer.createTransport({
                    service: "gmail",
                    auth: {
                      user: "vijay.ganeshp95@gmail.com",
                      pass: process.env.MAIL_PASS,
                    },
                  });
                  var mailoptions = {
                    from: `vijay.ganeshp95@gmail.com`,
                    to: `${req.body.email}`,
                    subject: `Secret Mail from nodejs`,
                    html: `<div>Please click the below link to activate your account and Change Your Password.This link will be valid for 24hrs only
                            <a href="http://localhost:3000/passwordupdate">Click Here</a></div>`,
                  };
                  transporter.sendMail(mailoptions, (err, info) => {
                    if (err) {
                      console.log(err);
                    } else {
                      console.log("email sent" + info.response);
                    }
                  });
                
                  client.close();
                }
        else{
            res.json({
                message:"Data not inserted"
            })
            client.close();
        }
    }else{
        res.json({
            message:"User Already Present"
        })
        client.close();
    }    
    } catch (error) {
        console.log(error)
        
    }
    
})

app.put("/setpassword/:email",async(req,res)=>{

const client=await mongoclient.connect(url,{useUnifiedTopology:true});
    const db=client.db("assignment");
    const checkdata=await db.collection("invoice_users").findOne({email:req.params.email})
    if(checkdata){
        var salt=await bcrypt.genSalt(10);
        console.log(req.body)
        var hashedpassword=await bcrypt.hash(req.body.password,salt)
        const data=await db.collection("invoice_users").updateOne({email:req.params.email},{$set:{password:hashedpassword,activated:true}});
        if(data){
            res.json({
                message:"Data Updated"
            })
            client.close();
        }else{
            res.json({
                message:"Data not Updated"
            })
            client.close();  
        }
    }else{
        res.json({
            message:"User Not Found"
        })
        client.close(); 
    }

})

app.get("/getallusers",async(req,res)=>{
    const client=await mongoclient.connect(url,{useUnifiedTopology:true});
    const db=client.db("assignment");
    const data= await db.collection("invoice_users").find().toArray();
    if(data){
        res.json(data)
        client.close();
    }else{
        res.json({ message:"No Data Found"})
        client.close()
    }

})

app.post("/login",async(req,res)=>{
    const client=await mongoclient.connect(url,{useUnifiedTopology:true});
    const db=client.db("assignment");
    const data= await db.collection("invoice_users").findOne({email:req.body.email,activated:true});
    if(data){
        let output=await bcrypt.compare(req.body.password,data.password);
        if(output){
            var token=jwt.sign({email:req.body.email},process.env.JWT_SECRET,{expiresIn:300})
            res.json({
                message:"Login Successful",
                email:req.body.email,
                role:data.role,
                token
            })
            client.close();
        }else{
            res.json({
                message:"Username and Password mismatches"
            })
            client.close();
        }
    }else{
        res.json({
            message:"Account not activated"
        })
        client.close();
    }
})

app.post("/forgetpassword",async(req,res)=>{
    var client=await mongoclient.connect(url);
    var db=client.db("assignment");
    var checkdata=await db.collection("invoice_users").find({email:req.body.email}).count();
    if(checkdata===1){
        var transporter=nodemailer.createTransport({
            service:"gmail",
            auth:{
                user:"vijay.ganeshp95@gmail.com",
                pass:process.env.MAIL_PASS
            }
        })
        var mailoptions = {
            from: `vijay.ganeshp95@gmail.com`,
            to: `vijay.ganeshp95@gmail.com`,
            subject: `Password Reset Link `,
            html: `<div>Please click the below link to Reset Your Password.
                    <a href="http://localhost:3000/changepassword">Click here</a></div>`,
          };
          transporter.sendMail(mailoptions, (err, info) => {
            if (err) {
              console.log(err);
            } else {
              console.log("email sent" + info.response);
            }
          });
          res.json({
              message:"Email Sent"
          })
          client.close();
    }else{
        res.json({
            message:"User not Present"
        })
        client.close();
    }
})

app.put("/changepassword/:email",async(req,res)=>{
    var client=await mongoclient.connect(url,{ useUnifiedTopology: true });
    var db= client.db("assignment");
    var checkdata=await db.collection("reactusers").find({email:req.params.email})
    if(checkdata){
        var salt=await bcrypt.genSalt(10);
        var hashedpass= await bcrypt.hash(req.body.password,salt);
        var data=await db.collection("invoice_users").updateOne({email:req.params.email},{$set:{password:hashedpass}});
        res.json({
            message:"Password Updated"
        })
        client.close();
    }else{
        res.json({
            message:"Something Went Wrong"
        })
        client.close();
    }
})

function authorize(req, res, next) {
    if (req.headers.authorization) {
      jwt.verify(
        req.headers.authorization,
        process.env.JWT_SECRET,
        (err, decode) => {
          if (decode) {
            if (req.params.email == decode.email) next();
            else {
              res.json({
                message: "Not Authorized",
              });
            }
          } else {
            res.json({
              message: "Token not valid",
            });
          }
        }
      );
    } else {
      res.json({
        message: "Token not present",
      });
    }
  }

  var port=process.env.PORT||5000
app.listen(port);
