const express= require('express')
const router= express.Router()
const usersController= require('../controller/usersController')


//get all
router.get('/getAll',usersController.getAll)
//get one
router.get('/getByInput',usersController.getByInput)
//create one
router.post('/newUser',usersController.createUser)
//update one
router.patch('/updateUser/:id',usersController.updateUser)
//delete one
router.delete('/delUser',usersController.deleteUser)


module.exports=router