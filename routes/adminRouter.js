const express = require("express");
const userModel = require("../models/userModel");
const adminModel = require("../models/adminModel");
const router = express.Router();
const controller = require("../controllers/adminController");
const verifyAdmin = require("../middlewares/verifyAdmin");
const upload = require("../middlewares/multer");

router.get("/login", controller.adminLoginPage);
router.get("/", controller.adminHomePage);
router.post("/login", controller.postadminlogin);
router.get("/logout", controller.adminLogout);

router.use(verifyAdmin);

router.get("/salesReport", controller.getsalesReport);
router.get("/singleOrder/:id", controller.getsingleOrder);
router.get("/productManagment", controller.productManagment);
router.get("/orderManagment", controller.orderManagment);
router.get("/categoryManagment", controller.categoryManagment);
router.get("/userManagment", controller.userManagment);
router.get("/bannerManagment", controller.bannerManagment);
router.get("/coupunManagment", controller.coupunManagment);
router.get("/addCategory", controller.getaddcategory);
router.get("/addCoupun", controller.getaddCoupun);
router.get("/addProducts", controller.getaddproduct);
router.get("/edit-product/:id", controller.getEditProduct);
router.get("/admin-view-order/:id", controller.adminOrderView);

router.post("/block-user/:id", controller.getuserBlock);
router.post("/unblock-user/:id", controller.getuserUnlock);
router.post("/addCategory", controller.postAddCategory);
router.post("/addCoupun", controller.postAddCoupun);
router.post(
  "/addProducts",
  upload.fields([
    { name: "images", maxCount: 3 },
    { name: "image", maxCount: "1" },
  ]),
  controller.postaddProducts
);
router.post("/unlist-product/:id", controller.unlistProduct);
router.post(
  "/edit-product",
  upload.fields([
    { name: "images", maxCount: 3 },
    { name: "image", maxCount: "1" },
  ]),
  controller.postEditProduct
);
router.post("/list-product/:id", controller.listProduct);
router.post("/unlist-category/:id", controller.unlistCategory);
router.post("/list-category/:id", controller.listCategory);
router.post("/unlist-coupun/:id", controller.unlistCoupun);
router.post("/list-coupun/:id", controller.listCoupun);

router.get("/cancel-admin-order/:id", controller.admincancelOrder);
router.get("/ship-order/:id", controller.AdminShipOrder);
router.get("/pending-admin-order/:id", controller.adminPendingOrder);
router.get("/deliver-order/:id", controller.adminDeliveredOrder);

router.get("/sales-report", controller.getsalesReport);
router.get("/single-order/:id", controller.getsingleOrder);

router.get("/add-banner", controller.getaddBanner);
router.post(
  "/add-banner",
  upload.fields([
    { name: "images", maxCount: 5 },
    { name: "image", maxCount: "1" },
  ]),
  controller.postaddBanner
);
router.post("/unlist-banner/:id", controller.unlistBanner);
router.post("/list-banner/:id", controller.listBanner);

module.exports = router;
