const dotenv = require('dotenv').config()
const Users=require('../models/usersModel')
const Redis = require('redis')

const redisClient= Redis.createClient({
  host:process.env.REDIS_URL,
  port:process.env.REDIS_PORT,
  password:process.env.REDIS_PASS,
  user:process.env.REDIS_USER,
  db:0
})
redisClient.on('error', function (err) {
  console.log('could not establish a connection with redis. ' + err);
});
redisClient.on('connect', function (err) {
  console.log('connected to redis successfully');
});

const getAll = async (req,res)=>{
  redisClient.get("getAll",async (error,userData) =>{
    if (error) res.status(400).json({message:"data not found"})

    if(userData){
      console.log("cache hit")
      res.status(200).json({message:"list user",data:JSON.parse(userData)})
    }else{
      console.log("cache miss")
      const users=await Users.find()
        redisClient.set( "getAll", JSON.stringify(users) ,() =>{
          res.status(200).json({message:"user list",users});
        })
    }
  })
}

const getByInput = async (req,res)=>{
  const user=await getUser(req)

  if(user.length>0){
    res.status(200).json({message:"user found",user})
  }else{
    res.status(400).json({message:"user not found"})
  }
}

const createUser = async (req,res)=>{
  const isUserExist=await getUser(req)

  if (isUserExist.length > 0 ){
    res.status(400).json({message:"user already exist, please check your input"})
  }else{
    try{
      const userInsert = new Users(req.body)
      const newUser=await userInsert.save();

      const users=await Users.find()
        redisClient.set( "getAll", JSON.stringify(users) ,() =>{
          res.status(201).json({message:"successfully added new user",addedUser:newUser})
        })
    }catch(error){
      res.status(400).json({message:"failed to insert data, please check your input",errMsg:error.message})
    }
  }
  
}

const deleteUser = async (req,res)=>{
  try{
    let result = await Users.deleteOne({_id:req.body.id});
    if(result.deletedCount > 0 ){
      res.status(201).json({message:"successfully deleted data",deletedData:req.body.id})
    }else{
      res.status(400).json({message:"no data to be deleted, please check your input",input:req.body})
    }
  }catch(error){
    res.status(500).json({message:error.message})
  }
}

const updateUser=async (req,res)=>{
  try{
    let updated=await Users.findOneAndUpdate({_id:req.params.id},req.body,{new:true})
    res.status(201).json({message:"updated data",data:updated})
  }catch(error){
    res.status(400).json({message:"failed to update",input:req.body})
  }
}

async function getUser(req){
  const user = new Users(req.body)
  const isUserExist=await Users.find( { $or: [
    {_id:req.body.id},
    {userName:user.userName},
    {accountNumber:user.accountNumber},
    {emailAddress:user.emailAddress},
    {identityNumber:user.identityNumber}
  ] 
  })
  return isUserExist; 
}
module.exports ={
  getAll,createUser,getByInput,deleteUser,updateUser
}