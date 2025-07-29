const Mechanic = require('../Models/Mechanic');
const sendResponse = require('../Utils/Response');


// Add Mechanics
const addMechanic = async (req, res, next) => {
  try {
    const { name, category, experience, workshop, rating, location, image, type } = req.body;

    // Check required fields
    if (!name || !category || !experience || !workshop || !rating || !location || !type) {
      return sendResponse(res, 400, false, 'Please fill all required fields');
    }

    // Validate category and type
    const validCategories = ['Car', 'Bike'];
    const validTypes = ['Old', 'New'];

    if (!validCategories.includes(category)) {
      return sendResponse(res, 400, false, 'Invalid category. Choose Car, Bike');
    }

    if (!validTypes.includes(type)) {
      return sendResponse(res, 400, false, 'Invalid type. Choose Old or New.');
    }

    if(req.user.role !== 'admin') {
      return sendResponse(res, 403, false, 'Only admin can add mechanic');
    }

    // Save mechanic to DB
    const mechanic = await Mechanic.create({
      name,
      category,
      experience,
      workshop,
      rating,
      location,
      image,
      type,
    });

    return sendResponse(res, 201, true, 'Mechanic added successfully', mechanic);
  } catch (error) {
    console.error('Add Mechanic Error:', error.message);
    return sendResponse(res, 500, false, 'Internal server error');
  }
};


// Get All Mechanic
const getAllMechanics = async (req, res, next) => {
  try {
    const mechanics = await Mechanic.find();
    if (mechanics.length === 0) {
      return sendResponse(res, 404, false, 'No mechanics found');
    }
    return sendResponse(res, 200, true, 'All mechanics fetched successfully', mechanics);
  } catch (error) {
    console.error('Get All Mechanics Error:', error.message);
    return sendResponse(res, 500, false, 'Internal server error');
  }
};


// Get Single Mechanic
const getSingleMechanic = async (req, res, next) => {
  try {
    const mechanic = await Mechanic.findById(req.params.id);
    if (!mechanic) {
      return sendResponse(res, 404, false, 'Mechanic not found');
    }
    return sendResponse(res, 200, true, 'Mechanic fetched successfully', mechanic);
  } catch (error) {
    console.error('Get Single Mechanic Error:', error.message);
    return sendResponse(res, 500, false, 'Internal server error');
  }
};


// Update Mechanic
const updateMechanic = async (req, res, next) => {
  try {
    const mechanicId = req.params.id;

    const updatedMechanic = await Mechanic.findByIdAndUpdate(
      mechanicId,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedMechanic) {
      return sendResponse(res, 404, false, 'Mechanic not found');
    }

    return sendResponse(res, 200, true, 'Mechanic updated successfully', updatedMechanic);
  } catch (error) {
    console.error('Update Mechanic Error:', error.message);
    return sendResponse(res, 500, false, 'Internal server error');
  }
};


// Delete Mechanic 
const deleteMechanic = async (req, res, next) => {
  try {
    const mechanic = await Mechanic.findByIdAndDelete(req.params.id);

    if (!mechanic) {
      return sendResponse(res, 404, false, 'Mechanic not found');
    }

    return sendResponse(res, 200, true, 'Mechanic deleted successfully');

  } catch (error) {
    console.error('Delete Mechanic Error:', error.message);
    return sendResponse(res, 500, false, 'Internal server error');
  }
};


module.exports = {
  addMechanic,
  getAllMechanics,
  getSingleMechanic,
  updateMechanic,
  deleteMechanic,
};

