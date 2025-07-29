
const express = require('express');
const router = express.Router();
const {
  addMechanic,
  getAllMechanics,
  getSingleMechanic,
  updateMechanic,
  deleteMechanic,
} = require('../Controllers/MechanicController');
const auth = require ('../Middleware/authMiddleware');
const { isAdmin } = require('../Controllers/AuthController');

// Routes
router.post('/add', auth, isAdmin,  addMechanic);
router.get('/', auth, isAdmin, getAllMechanics);
router.get('/:id', auth, isAdmin, getSingleMechanic);
router.put('/:id', auth, isAdmin, updateMechanic);
router.delete('/:id', auth, isAdmin, deleteMechanic);


module.exports = router;
