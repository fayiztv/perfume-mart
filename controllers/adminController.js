const adminModel = require("../models/adminModel");
const userModel = require("../models/userModel");
const adminRouter = require("../routes/adminRouter");
const categoryModel = require("../models/categoryModel");
const productModel = require("../models/productModel");
const couponModel = require("../models/coupunModel");
const orderModel = require("../models/orderModel");
const bannerModel = require("../models/bannerModel");
const moment = require("moment");
const cloudinary = require("cloudinary");
const { request } = require("express");
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_SECRET,
});

module.exports = {
  adminLoginPage: (req, res) => {
    if (req.session.admin) {
      res.redirect("/admin/");
    } else {
      res.render("adminLogin");
    }
  },

  adminHomePage: async (req, res) => {
    try {
      if (req.session.admin) {
        const order = await orderModel.find().lean();
        const monthlyDataArray = await orderModel.aggregate([
          { $match: { paid: true } },
          {
            $group: {
              _id: { $month: "$createdAt" },
              sum: { $sum: "$totalPrice" },
            },
          },
        ]);

        console.log("haaaaaaaaaaaaaaaaaaaa", monthlyDataArray);

        let deliveredOrder = 0;
        let PendingOrder = 0;
        let cancelOrder = 0;

        const user = await userModel.find().lean();

        let users = user.length;
        let totalOrders = order.length;
        let totalRevenue = 0;

        let deliveredOrders = order.filter((item) => {
          if (item.status == "pending") {
            PendingOrder++;
          }

          if (item.status == "cancelled") {
            cancelOrder++;
          }

          if (item.status == "delivered") {
            deliveredOrder++;
            totalRevenue = totalRevenue + item.totalPrice;
          }

          return item.paid;
        });

        let totalDispatch = deliveredOrders.length;

        let monthlyDataObject = {};

        monthlyDataArray.map((item) => {
          monthlyDataObject[item._id] = item.sum;
        });

        let monthlyData = [];
        for (let i = 1; i <= 12; i++) {
          monthlyData[i - 1] = monthlyDataObject[i] ?? 0;
        }

        res.render("adminHome", {
          totalOrders,
          users,
          totalRevenue,
          monthlyData,
          deliveredOrder,
          PendingOrder,
          cancelOrder,
        });
      } else {
        res.redirect("/admin/login");
      }
    } catch (err) {
      console.log("ful err");
      console.log(err);
    }
  },

  productManagment: async (req, res) => {
    try {
      const products = await productModel.find().lean();
      res.render("productManagment", { products });
    } catch(err) {
      console.log("ful err");
      console.log(err);
    }
  },

  orderManagment: async (req, res) => {
    try {
      const order = await orderModel.find().lean();
      res.render("orderManagment", { order });
    } catch (err) {
      console.log("ful err");
      console.log(err);
    }
  },

  categoryManagment: async (req, res) => {
    try {
      const categories = await categoryModel.find().lean();
      res.render("categoryManagment", { categories });
    } catch (err){
      console.log("ful err");
      console.log(err);
    }
  },

  userManagment: async (req, res) => {
    try {
      let users = await userModel.find({}, { password: 0 }).lean();

      res.render("userManagment", { users });
    } catch (err){
      console.log("ful err");
      console.log(err);
    }
  },

  bannerManagment: async (req, res) => {
    try {
      const banners = await bannerModel.find().lean();
      res.render("bannerManagment", { banners });
    } catch(err) {
      console.log("ful err");
      console.log(err);
    }
  },

  coupunManagment: async (req, res) => {
    try {
      const coupuns = await couponModel.find().lean();
      res.render("coupunManagment", { coupuns });
    } catch (err) {
      console.log("ful err");
      console.log(err);
    }
  },

  postadminlogin: async (req, res) => {
    try {
      const { email, password } = req.body;

      const admin = await adminModel.findOne({ email });

      console.log(admin);
      if (admin) {
        if (password == admin.password) {
          req.session.admin = {
            name: admin.name,
          };
          res.redirect("/admin/");
        } else {
          console.log("first");
          res.render("adminLogin", { err: "Incorrect Password" });
        }
      } else {
        console.log("second");
        res.render("adminLogin", { error: "Please Enter all fields" });
      }
    } catch(err) {
      console.log("ful err");
      console.log(err);
    }
  },

  adminLogout: (req, res) => {
    req.session.admin = null;
    res.redirect("/admin/login");
  },

  getuserBlock: async (req, res) => {
    try {
      var id = req.params.id;

      await userModel
        .findByIdAndUpdate(id, { $set: { status: "block" } })
        .then(() => {
          res.redirect("/admin/usermanagment");
        })
        .catch((err) => {
          console.log(err);
        });
    } catch(err) {
      console.log("ful err");
      console.log(err);
    }
  },

  getuserUnlock: async (req, res) => {
    try {
      var id = req.params.id;

      await userModel
        .findByIdAndUpdate(id, { $set: { status: "Unblock" } })
        .then(() => {
          res.redirect("/admin/usermanagment");
        })
        .catch((err) => {
          console.log(err);
        });
    } catch(err) {
      console.log("ful err");
      console.log(err);
    }
  },

  getaddcategory: (req, res) => {
    res.render("addCategory");
  },

  postAddCategory: async (req, res) => {
    try {
      const category = await categoryModel.findOne({
        category: req.body.category.toLowerCase(),
      });

      if (category) {
        return res.render("addCategory", {
          duplicate: "category already found",
        });
      } else {
        const category = req.body.category;

        const categories = new categoryModel({
          category: category.toLowerCase(),
        });
        categories.save((err, data) => {
          if (err) {
            console.log(err);
            return res.redirect("/admin/addCategory");
          }
          res.redirect("/admin/categoryManagment");
        });
      }
    } catch (err) {
      console.log("ful err");
      console.log(err);
    }
  },

  getaddCoupun: (req, res) => {
    res.render("addCoupun");
  },

  unlistCategory: async (req, res) => {
    try {
      const _id = req.params.id;

      await categoryModel
        .findByIdAndUpdate(_id, { $set: { status: "unavailable" } })
        .then(() => {
          res.redirect("/admin/categoryManagment");
        })
        .catch((err) => {
          console.log(err);
        });
    } catch (err){
      console.log("ful err");
      console.log(err);
    }
  },

  listCategory: async (req, res) => {
    try {
      const _id = req.params.id;

      await categoryModel
        .findByIdAndUpdate(_id, { $set: { status: "available" } })
        .then(() => {
          res.redirect("/admin/categoryManagment");
        })
        .catch((err) => {
          console.log(err);
        });
    } catch(err) {
      console.log("ful err");
      console.log(err);
    }
  },

  unlistCoupun: async (req, res) => {
    try {
      const _id = req.params.id;

      await categoryModel
        .findByIdAndUpdate(_id, { $set: { status: "unavailable" } })
        .then(() => {
          res.redirect("/admin/coupunManagment");
        })
        .catch((err) => {
          console.log(err);
        });
    } catch (err){
      console.log("ful err");
      console.log(err);
    }
  },

  listCoupun: async (req, res) => {
    try {
      const _id = req.params.id;

      await categoryModel
        .findByIdAndUpdate(_id, { $set: { status: "available" } })
        .then(() => {
          res.redirect("/admin/coupunManagment");
        })
        .catch((err) => {
          console.log(err);
        });
    } catch(err) {
      console.log("ful err");
      console.log(err);
    }
  },

  postAddCoupun: async (req, res) => {
    try {
      const { name, cashBack, minAmount, expiry, code } = req.body;

      const coupon = new couponModel({
        name,
        cashBack,
        minAmount,
        expiry,
        code,
      });

      coupon.save((err, data) => {
        if (err) {
          console.log(err);
        }

        res.redirect("/admin/coupunManagment");
      });
    } catch (err) {
      console.log("ful err");
      console.log(err);
    }
  },

  getaddproduct: async (req, res) => {
    try {
      const categories = await categoryModel.find().lean();
      res.render("addProducts", { categories });
    } catch (err){
      console.log("ful err");
      console.log(err);
    }
  },

  postaddProducts: async (req, res) => {
    try {
      let main_image = req.files.image[0];
      let sub_image = req.files.images;
      let imageFile = await cloudinary.uploader.upload(main_image.path, {
        folder: "p-mart",
      });
      let products = imageFile;

      for (let i in sub_image) {
        let imageFile = await cloudinary.uploader.upload(sub_image[i].path, {
          folder: "p-mart",
        });
        sub_image[i] = imageFile;
      }

      const { name, category, quantity, price, brand, description, mrp } =
        req.body;

      const product = new productModel({
        name,
        category,
        quantity,
        price,
        brand,
        description,
        mrp,
        mainImage:products,
        sideImage:sub_image
      });

      product.save(async (err, data) => {
        if (err) {
          console.log(err);
          const categories = await categoryModel.find().lean();
          res.render("addProducts", {
            error: true,
            message: "validation filed",
            categories,
          });
        } else {
          res.redirect("/admin/productManagment");
        }
      });
    } catch (err) {
      console.log(err);
      const categories = await categoryModel.find().lean();
      res.render("/admin/addProducts", {
        error: true,
        message: "enter all fieds",
      });
    }
  },

  unlistProduct: async (req, res) => {
    try {
      const _id = req.params.id;

      await productModel
        .findByIdAndUpdate(_id, { $set: { status: "unavailable" } })
        .then(() => {
          res.redirect("/admin/productManagment");
        })
        .catch((err) => {
          console.log(err);
        });
    } catch(err) {
      console.log("ful err");
      console.log(err);
    }
  },

  listProduct: async (req, res) => {
    try {
      const _id = req.params.id;

      await productModel
        .findByIdAndUpdate(_id, { $set: { status: "available" } })
        .then(() => {
          res.redirect("/admin/productManagment");
        })
        .catch((err) => {
          console.log(err);
        });
    } catch(err) {
      console.log("ful err");
      console.log(err);
    }
  },

  getEditProduct: async (req, res) => {
    try {
      const _id = req.params.id;
      const product = await productModel.findOne({ _id });

      const categories = await categoryModel.find().lean();
      res.render("editProduct", { product, error: false, categories });
    } catch (err) {
      console.log("ful err");
      console.log(err);
    }
  },

  postEditProduct: async (req, res) => {
    try {
      let main_image = req.files.image[0];
      let sub_image = req.files.images;
      let imageFile = await cloudinary.uploader.upload(main_image.path, {
        folder: "p-mart",
      });
      let products = imageFile;

      for (let i in sub_image) {
        let imageFile = await cloudinary.uploader.upload(sub_image[i].path, {
          folder: "p-mart",
        });
        sub_image[i] = imageFile;
      }
      const { name, category, quantity, mrp, brand, price, description, _id } =
        req.body;

      if (req.files.image && req.files.images) {
        console.log("first");
        await productModel.findByIdAndUpdate(_id, {
          $set: {
            name,
            category,
            quantity,
            brand,
            price,
            mrp,
            description,
            mainImage: products,
            sideImage: sub_image,
          },
        });

        return res.redirect("/admin/productManagment");
      }

      if (!req.files.image && req.files.images) {
        console.log("second");
        await productModel.findByIdAndUpdate(_id, {
          $set: {
            name,
            category,
            quantity,
            brand,
            mrp,
            price,
            description,
            sideImage: sub_image,
          },
        });

        return res.redirect("/admin/productManagment");
      }

      if (req.files.image && !req.files.images) {
        console.log("third");
        await productModel.findByIdAndUpdate(_id, {
          $set: {
            name,
            category,
            quantity,
            brand,
            mrp,
            price,
            description,
            mainImage: products,
          },
        });

        return res.redirect("/admin/productManagment");
      }

      if (!req.files.image && !req.files.images) {
        console.log("four");

        await productModel.updateOne(
          { _id },
          {
            $set: {
              name,
              category,
              quantity,
              brand,
              mrp,
              price,
              description,
            },
          }
        );

        return res.redirect("/admin/productManagment");
      }

      return res.redirect("/admin/productManagment");
    } catch (err) {
      console.log("ful err");
      console.log(err);
      const categories = await categoryModel.find().lean();
      res.render("editProduct", {
        error: true,
        message: "Please fill all the fields",
        categories,
        product: req.body,
      });
    }
  },

  adminOrderView: async (req, res) => {
    try {
      const id = req.params.id;

      const order = await orderModel.findById({ _id: id }).lean();

      res.render("adminViewOrder", { order });
    } catch (err) {
      console.log("ful err");
      console.log(err);
    }
  },

  admincancelOrder: async (req, res) => {
    try {
      const orderId = req.params.id;

      const order = await orderModel
        .updateOne({ _id: orderId }, { $set: { status: "cancelled" } })
        .lean();

      res.redirect("back");
    } catch (err) {
      console.log("ful err");
      console.log(err);
    }
  },

  adminPendingOrder: async (req, res) => {
    try {
      const orderId = req.params.id;

      const order = await orderModel
        .updateOne({ _id: orderId }, { $set: { status: "pending" } })
        .lean();

      res.redirect("back");
    } catch (err) {
      console.log("ful err");
      console.log(err);
    }
  },

  AdminShipOrder: async (req, res) => {
    try {
      const orderId = req.params.id;

      const order = await orderModel
        .updateOne({ _id: orderId }, { $set: { status: "shiped" } })
        .lean();

      res.redirect("back");
    } catch (err) {
      console.log("ful err");
      console.log(err);
    }
  },

  adminDeliveredOrder: async (req, res) => {
    try {
      const orderId = req.params.id;

      const order = await orderModel
        .updateOne({ _id: orderId }, { $set: { status: "delivered" } })
        .lean();

      res.redirect("back");
    } catch (err) {
      console.log("ful err");
      console.log(err);
    }
  },

  getsalesReport: async (req, res) => {
    try {
      let startDate = new Date(new Date().setDate(new Date().getDate() - 8));
      let endDate = new Date();

      if (req.query.startDate) {
        startDate = new Date(req.query.startDate);
        startDate.setHours(0, 0, 0, 0);
      }
      if (req.query.endDate) {
        endDate = new Date(req.query.endDate);
        endDate.setHours(24, 0, 0, 0);
      }
      if (req.query.filter == "thisYear") {
        let currentDate = new Date();
        startDate = new Date(currentDate.getFullYear(), 0, 1);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(new Date().setDate(new Date().getDate() + 1));
        endDate.setHours(0, 0, 0, 0);
      }
      if (req.query.filter == "lastYear") {
        let currentDate = new Date();
        startDate = new Date(currentDate.getFullYear() - 1, 0, 1);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(currentDate.getFullYear() - 1, 11, 31);
        endDate.setHours(0, 0, 0, 0);
      }
      if (req.query.filter == "thisMonth") {
        let currentDate = new Date();
        startDate = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth(),
          1
        );
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth() + 1,
          1
        );
        endDate.setHours(0, 0, 0, 0);
      }
      if (req.query.filter == "lastMonth") {
        let currentDate = new Date();
        startDate = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth() - 1,
          1
        );
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth(),
          1
        );
        endDate.setHours(0, 0, 0, 0);
      }

      const orders = await orderModel
        .find({ createdAt: { $gt: startDate, $lt: endDate } })
        .sort({ createdAt: -1 })
        .lean();

      let totalOrders = orders.length;
      let totalRevenue = 0;
      let totalPending = 0;
      let totalDelivered = 0;
      let totalCancelled = 0;

      let deliveredOrders = orders.filter((item) => {
        if (item.status == "pending") {
          totalPending++;
        }
        if (item.status == "cancelled") {
          totalCancelled++;
        }

        if (item.status == "delivered") {
          totalRevenue = totalRevenue + item.orderItems.price;
          totalDelivered++;
          return item.paid;
        }
      });

      let filter = req.query.filter ?? "";
      if (!req.query.filter && !req.query.startDate) {
        filter = "lastWeek";
      }
      res.render("salesReport", {
        orders,
        totalDelivered,
        totalOrders,
        totalPending,
        totalRevenue,
        totalCancelled,
        startDate: moment(
          new Date(startDate).setDate(new Date(startDate).getDate() + 1)
        )
          .utc()
          .format("YYYY-MM-DD"),
        endDate: moment(endDate).utc().format("YYYY-MM-DD"),
        filter,
      });
    } catch (err) {
      console.log(err);
    }
  },

  getsingleOrder: async (req, res) => {
    const _id = req.params.id;

    const order = await orderModel.findById({ _id }).lean();

    res.render("singleOrder", { order });
  },

  getaddBanner: (req, res) => {
    res.render("addBanner");
  },

  postaddBanner: async (req, res) => {
    try {
      const { name, description } = req.body;

      const banner = new bannerModel({
        name,
        description,
        image: req.files.image[0],
      });

      banner.save(async (err, data) => {
        if (err) {
          console.log(err);

          res.render("addbanner");
        } else {
          res.redirect("/admin/bannerManagment");
          console.log("completed");
        }
      });
    } catch (err) {
      console.log(err);
    }
  },

  unlistBanner: async (req, res) => {
    try {
      const _id = req.params.id;

      await bannerModel
        .findByIdAndUpdate(_id, { $set: { status: "unavailable" } })
        .then(() => {
          res.redirect("/admin/bannerManagment");
        })
        .catch((err) => {
          console.log(err);
        });
    } catch(err){
      console.log("ful err");
      console.log(err);
    }
  },

  listBanner: async (req, res) => {
    try {
      const _id = req.params.id;

      await bannerModel
        .findByIdAndUpdate(_id, { $set: { status: "available" } })
        .then(() => {
          res.redirect("/admin/bannerManagment");
        })
        .catch((err) => {
          console.log(err);
        });
    } catch(err) {
      console.log("ful err");
      console.log(err);
    }
  },
};
