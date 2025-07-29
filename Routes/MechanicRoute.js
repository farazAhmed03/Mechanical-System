
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
router.post('/add',  addMechanic);
router.get('/', getAllMechanics);
router.get('/:id', getSingleMechanic);
router.put('/:id', updateMechanic);
router.delete('/:id', deleteMechanic);


module.exports = router;
