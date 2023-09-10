const router = require("express").Router();
const authController = require('../Controller/authControllers')
const verifyToken = require('../Controller/middleware')
router.post("/register", authController.registerUser)
router.post("/login",authController.loginUser)
router.post("/refresh",authController.posttoken)
router.patch("/logout",authController.logout)
router.get("/test",verifyToken.verifyTokenAndAdmin , authController.test_verifyToken)

module.exports = router