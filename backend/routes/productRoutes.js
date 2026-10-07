const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  updateStock,
  deleteProduct,
} = require('../controllers/productController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.route('/')
  .get(getProducts)
  .post(protect, upload.single('image'), createProduct);

router.route('/:id')
  .get(getProductById)
  .put(protect, upload.single('image'), updateProduct)
  .delete(protect, deleteProduct);

router.route('/:id/stock')
  .patch(protect, updateStock);

module.exports = router;
