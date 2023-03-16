const express = require("express");
const userModel = require("../models/userModel");

const controller = require("../controllers/userController");
const verifyUser = require("../middlewares/verifyuser");
const checkUser = require("../middlewares/checkUser");

const router = express.Router();

router.get("/", controller.getHomePage);

router.get("/signup", controller.getSignupPage);
router.get("/login", controller.getLoginPage);
router.get("/logout", controller.userLogout);
router.get("/otp", controller.getverifyOtp);

router.get("/forgot-password", controller.getForgotPassword);
router.get("/forgot-pass-verify", controller.forgotPassotp);

router.post("/otp", controller.postverifyOtp);
router.post("/signup", controller.postSignupPage);
router.post("/login", controller.postLoginPage);
router.post("/forgot-password-email", controller.postForgotPassword);
router.post("/forgot-pass-verify", controller.postforgotPassotp);
router.post("/change-password", controller.changePass);

router.use(verifyUser);
router.use(checkUser);

router.post("/search-product", controller.postSearchProduct);
router.get("/sort-product", controller.getsortProduct);
router.get("/filter-product", controller.getfilterProduct);
router.get("/single-product/:id", controller.getsingleProduct);
router.get("/about", controller.getAboutPage);
router.get("/contact", controller.getContactPage);
router.get("/products", controller.getProductPage);

router.get("/cart", controller.getCartPage);
router.get("/addto-cart/:id", controller.addtoCart);
router.get("/remove-cart/:id", controller.removeCart);
router.get("/add-quantity/:id", controller.addQuantity);
router.get("/minus-quantity/:id", controller.minQuantity);

//whishlist

router.get("/whishlist", controller.getWhishlistPage);
router.get("/addto-wishlist/:id", controller.addtowishList);
router.get("/remove-wishlist/:id", controller.removeWishlist);

// user profile

router.get("/profile", controller.getProfilePage);
router.get("/edit-profile", controller.getEditProfile);
router.post("/edit-profile", controller.postEditProfile);
router.get("/add-address", controller.getAddAddress);
router.post("/add-address", controller.postAddress);
router.get("/delete-address/:id", controller.deleteAdderess);
router.get("/edit-address/:id", controller.getEditAddress);
router.post("/edit-address", controller.postEditAddress); 

// checkout page
router.get("/product-checkout", controller.getcheckout);
router.post("/checkout", controller.postCheckout);
router.get("/return", controller.getpaymentUrl);
router.get("/couponCheck/:id/:totalAmount", controller.applyCoupon);

// online payment

router.get("/online-payment-setup", controller.paymentSetup);

//order
router.get("/orders", controller.getOrders);
router.get("/view-order/:id", controller.getviewOrder);
router.get("/cancelorder/:id", controller.cancelOrder);

//404 page
router.get("/error-page", controller.errorPage);

module.exports = router;
