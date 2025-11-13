const asyncHandler = require('express-async-handler');
const { validationResult } = require('express-validator');
const User = require('../models/collectorUser');
const { get } = require('mongoose');
//@desc get all users
//@route GET /api/v1/users
//@access public
const getCollectorUsers = asyncHandler(async(req, res) => {
  const users = await User.find();
  res.status(200).json(users);
})


const getCollectorUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if(!user){
    res.status(404);
     throw new Error('User not found');
  }
  res.status(200).json(user); 
})


// const createUser =asyncHandler( async(req, res) => {
//   //console.log(req.body);
//   const {name, email, password, role, phone,} = req.body;
//   if(!name || !email){
//     res.status(400).json({message:'Please provide name and email'});
//     return;
//   } 
//   const user = await User.create({name, email, password, role, phone});
//   console.log("User created:", user);
//   res.status(200).json(user);
// }
// )
const createCollectorUser = asyncHandler(async (req, res) => {
  // ✅ Validate fields from express-validator
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, email, password, role, phone } = req.body;

  // ✅ Check if email already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ message: 'Email already registered.' });
  }

  const user = await User.create({ name, email, password, role, phone });

  res.status(201).json({
    message: 'User created successfully',
    user: {
      id: user._id,
      name: user.name,
      password: user.password,
      email: user.email,
      role: user.role,
      phone: user.phone
    }
  });
});

const updateCollectorUser =asyncHandler( async(req, res) => {
  const user = await User.findById(req.params.id);
  if(!user){
    res.status(404);
    throw new Error('User not found');
  }
  const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, {new:true});
  if(!updatedUser){
    res.status(404);
    throw new Error('User not found');
  }
  res.status(200).json(updatedUser);
}
)



const deleteCollectorUser = asyncHandler(async(req, res) => {
  const user = await User.findById(req.params.id);
  console.log(user);
 if (!user) {
    return res.status(400).json({ message: 'Email already registered.' });
  }
  await User.remove();
  res.status(200).json(user);
})

module.exports = {createCollectorUser, getCollectorUsers, getCollectorUser, updateCollectorUser, deleteCollectorUser};