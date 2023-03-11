const userModel = require("../models/userModel");
const userRouter = require("../routes/userRouter");
const sendOtp = require("../actions/otp");
const productModel = require("../models/productModel");
const categoryModel = require("../models/categoryModel");
const idcreate = require("../actions/idcreate");
const orderModel = require("../models/orderModel");
const bannerModel = require("../models/bannerModel");
const axios = require("axios");
const couponModel = require("../models/coupunModel");

module.exports = {
  getSignupPage: (req, res) => {
    if (req.session.user) {
      res.redirect("/");
    } else {
      res.render("userSignup");
    }
  },

  getHomePage: async (req, res) => {
    try {
      if (req.session.user) {
        const banner = await bannerModel.find({ status: "available" }).lean();

        res.render("home", { banner });
      } else {
        res.redirect("/login");
      }
    } catch (err) {
      res.render("404");
      console.log(err);
    }
  },

  getAboutPage: (req, res) => {
    res.render("about");
  },

  getContactPage: (req, res) => {
    res.render("contact");
  },

  getProductPage: async (req, res) => {
    try {
      const products = await productModel.find().lean();
      const categories = await categoryModel.find().lean();

      res.render("products", { products, categories });
    } catch(err){
      res.render("404");
      console.log(err);
    }
  },


  getLoginPage: (req, res) => {
    if (req.session.user) {
      res.redirect("/");
    } else {
      res.render("userLogin");
    }
  },

  userLogout: (req, res) => {
    req.session.user = null;
    res.redirect("/login");
  },

  getOtpPage: (req, res) => {
    res.render("otp", { user: false });
  },

  postLoginPage: async (req, res) => {
    try {
      const { email, password } = req.body;

      let user = await userModel.findOne({ email });

      if (user) {
        if (user.status == "block") {
          res.render("userLogin", { ban: "Your account is banned" });
        } else {
          if (email == user.email && password == user.password) {
            req.session.user = {
              name: user.name,
              id: user._id,
            };
            res.redirect("/");
          } else {
            res.render("userLogin", { err: "Incorrect password" });
          }
        }
      } else {
        res.render("userLogin", { error: true });
      }
    } catch(err){
      res.render("404");
      console.log(err);
    }
  },

  getForgotPassword: (req, res) => {
    res.render("forgotPassword");
  },

  postForgotPassword: async (req, res) => {
    try {
      const { email } = req.body;

      const user = await userModel.findOne({ email });

      if (user) {
        let otp = Math.floor(1000 + Math.random() * 9000);
        await sendOtp(req.body.email, otp);
        req.session.temp = {
          email,
          otp,
        };

        return res.redirect("/forgot-pass-verify");
      } else {
        return res.render("forgotPassword", { duplicate: "User not found" });
      }
    } catch (err) {
      res.render("404");
      console.log(err);
    }
  },

  postforgotPassotp: async (req, res) => {
    try {
      const { otp } = req.body;
      if (req.session.temp.otp == otp) {
        return res.render("changePassword");
      } else {
        return res.render("forgotpassword", {
          otpmessage: "please enter a valid otp",
        });
      }
    } catch (err) {
      res.render("404");
      console.log(err);
    }
  },

  changePass: async (req, res) => {
    try {
      const { newpass, cpass } = req.body;

      if (newpass == cpass) {
        await userModel.findOneAndUpdate(
          { email: req.session.temp.email },
          {
            $set: {
              password: newpass,
            },
          }
        );

        return res.redirect("/login");
      }

      return res.render("changePassword", { message: "password not match" });
    } catch (err) {
      res.render("404");
      console.log(err);
    }
  },

  forgotPassotp: (req, res) => {
    res.render("forgotPassOtp", { email: req.session.temp.email });
  },

  postSignupPage: async (req, res) => {
    try {
      const user = await userModel.findOne({ email: req.body.email });

      if (user) {
        return res.render("userSignup", { duplicate: "User already found" });
      }

      if (
        req.body.name == "" ||
        req.body.email == "" ||
        req.body.password == "" ||
        req.body.mobile == ""
      ) {
        const fieldRequired = " Please enter all fields ";
        res.render("userSignup", { fieldRequired });
      } else {
        if (req.body.password != req.body.cpassword) {
          res.render("userSignup", { passworder: "passwords are not same" });
        } else {
          randomOtp = Math.floor(Math.random() * 10000);
          req.session.otp = randomOtp;

          sendOtp(req.body.email, randomOtp)
            .then(() => {
              return res.render("otp", { user: req.body });
            })
            .catch((err) => {
              return res.render("userSignup", {
                error: true,
                message: "email sent failed",
              });
            });
        }
      }
    } catch(err){
      res.render("404");
      console.log(err);
    }
  },

  getverifyOtp: (req, res) => {
    res.render("otp");
  },

  postverifyOtp: (req, res) => {
    const { name, email, password, mobile } = req.body;
    if (req.body.otp == req.session.otp) {
      const user = new userModel({ name, email, mobile, password });

      user.save((err, data) => {
        if (err) {
          res.render("otp", {
            error: true,
            message: "Somethign went wrong",
            ...req.body,
          });
        } else {
          req.session.user = {
            name,
            id: user._id,
          };

          res.redirect("/");
        }
      });
    } else {
      res.render("otp", {
        error: true,
        otpmessage: "Invalid OTP",
        ...req.body,
      });
    }
  },

  getsortProduct: async (req, res) => {
    try {
      const name = req.query.SortBy;

      if (name == "low-high") {
        const products = await productModel.find().sort({ price: 1 }).lean();

        res.render("products", { products });
      } else if (name == "high-low") {
        const products = await productModel.find().sort({ price: -1 }).lean();
        res.render("products", { products });
      } else {
        const products = await productModel.find().lean();
        res.render("products", { products });
      }
    } catch (err){
      res.render("404");
      console.log(err);
    }
  },

  getfilterProduct: async (req, res) => {
    try {
      const name = req.query.filterBy;

      const products = await productModel
        .find({ $and: [{ category: name }, { status: "available" }] })
        .lean();
      res.render("products", { products });
    } catch(err){
      res.render("404");
      console.log(err);
    }
  },

  postSearchProduct: async (req, res) => {
    try {
      const products = await productModel
        .find({
          $and: [
            { status: "available" },
            {
              $or: [
                { name: new RegExp(req.body.name, "i") },
                { category: new RegExp(req.body.name, "i") },
              ],
            },
          ],
        })
        .lean();
      res.render("products", { products });
    } catch (err){
      res.render("404");
      console.log(err);
    }
  },

  getsingleProduct: async (req, res) => {
    try {
      const id = req.session.user.id;
      const user = await userModel.findById({ _id: id }).lean();
      const _id = req.params.id;

      const product = await productModel.findById(_id).lean();

      if (user.wishlist.includes(_id)) {
        res.render("singleProduct", { product, wish: true });
      } else {
        res.render("singleProduct", { product, wish: false });
      }
    } catch (err) {
      res.render("404");
      console.log(err);
    }
  },

  getCartPage: async (req, res) => {
    try {
      const _id = req.session.user.id;

      const { cart } = await userModel.findOne({ _id }, { cart: 1 });

      const cartList = cart.map((item) => {
        return item.id;
      });

      const product = await productModel
        .find({ _id: { $in: cartList } })
        .lean(); //$in for each elememnt in cart becaus eit has al ot ids //cart il product inte id ind . product modelil ella productsindum id indavum.aah randu id check cheythal equal aaya product kittum

      let totalPrice = 0;

      product.forEach((item, index) => {
        totalPrice = totalPrice + item.price * cart[index].quantity;
      });

      let totalMrp = 0;

      product.forEach((item, index) => {
        totalMrp = totalMrp + item.mrp * cart[index].quantity;
      });
      let empty;
      cart.length == 0 ? (empty = true) : (empty = false);
      res.render("cart", { product, totalPrice, cart, totalMrp, empty });
    } catch (err) {
      res.render("404");
      console.log(err);
    }
  },

  addtoCart: async (req, res) => {
    try {
      const _id = req.session.user.id;
      const productId = req.params.id;

      await userModel.updateOne(
        { _id },
        { $addToSet: { cart: { id: productId, quantity: 1 } } }
      );

      res.redirect("/cart");
    } catch(err){
      res.render("404");
      console.log(err);
    }
  },

  removeCart: async (req, res) => {
    try {
      const _id = req.session.user.id;
      const productId = req.params.id;

      await userModel.updateOne(
        { _id },
        {
          $pull: {
            cart: { id: productId },
          },
        }
      );
      res.redirect("/cart");
    } catch(err){
      res.render("404");
      console.log(err);
    }
  },

  addQuantity: async (req, res) => {
    try {
      const user = await userModel.updateOne(
        {
          _id: req.session.user.id,
          cart: { $elemMatch: { id: req.params.id } },
        },
        {
          $inc: { "cart.$.quantity": 1 },
        }
      );

      res.json({ user });
    } catch(err){
      res.render("404");
      console.log(err);
    }
  },

  minQuantity: async (req, res) => {
    try {
      let { cart } = await userModel.findOne(
        { "cart.id": req.params.id },
        { _id: 0, cart: { $elemMatch: { id: req.params.id } } }
      );

      if (cart[0].quantity <= 1) {
        return res.redirect("/cart");
      }

      const user = await userModel.updateOne(
        {
          _id: req.session.user.id,
          cart: { $elemMatch: { id: req.params.id } },
        },
        {
          $inc: {
            "cart.$.quantity": -1,
          },
        }
      );
      return res.json({ user });
    } catch(err){
      res.render("404");
      console.log(err);
    }
  },

  getWhishlistPage: async (req, res) => {
    try {
      const _id = req.session.user.id;

      const user = await userModel.findById({ _id }).lean();

      const wishlist = user.wishlist;

      const product = await productModel
        .find({ _id: { $in: wishlist } })
        .lean(); //$in for each elememnt in cart becaus eit has al ot ids //cart il product inte id ind . product modelil ella productsindum id indavum.aah randu id check cheythal equal aaya product kittum

      let empty;
      wishlist.length == 0 ? (empty = true) : (empty = false);
      res.render("whishlist", { product, empty });
    } catch (err) {
      res.render("404");
      console.log(err);
    }
  },

  addtowishList: async (req, res) => {
    try {
      const _id = req.session.user.id;

      const proId = req.params.id;
      await userModel.updateOne(
        { _id },
        {
          $addToSet: {
            wishlist: proId,
          },
        }
      );
      res.redirect("back");
    } catch(err){
      res.render("404");
      console.log(err);
    }
  },

  removeWishlist: async (req, res) => {
    try {
      const _id = req.session.user.id;
      const id = req.params.id;

      await userModel.updateOne(
        { _id },
        {
          $pull: {
            wishlist: id,
          },
        }
      );

      res.redirect("back");
    } catch(err){
      res.render("404");
      console.log(err);
    }
  },

  getProfilePage: async (req, res) => {
    try {
      const id = req.session.user.id;
      const user = await userModel.findById({ _id: id }).lean();
      res.render("userProfile", { user });
    } catch (error) {
      res.render("404");
      console.log(error);
    }
  },

  getcheckout: async (req, res) => {
    try {
      let totalPrice = 0;
      const id = req.session.user.id;
      const user = await userModel.findById({ _id: id }).lean();
      for (const i of user.cart) {
        let product = await productModel.findOne({ _id: i.id });
        totalPrice = totalPrice + product.price * i.quantity;
      }
      res.render("checkout", { user, totalPrice });
    } catch (err) {
      res.render("404");
      console.log(err);
    }
  },

  getEditProfile: async (req, res) => {
    try {
      const id = req.session.user.id;
      const user = await userModel.findById({ _id: id }).lean();
      res.render("editProfile", { user });
    } catch (error) {
      res.render("404");
      console.log(error);
    }
  },

  getAddAddress: (req, res) => {
    res.render("addAddress");
  },

  postAddress: async (req, res) => {
    try {
      const _id = req.session.user.id;

      await userModel.updateOne(
        { _id },
        {
          $addToSet: {
            address: {
              ...req.body,
              id: idcreate(),
            },
          },
        }
      );
      res.redirect("/profile");
    } catch (error) {
      res.render("404");
      console.log(error);
    }
  },

  postEditProfile: async (req, res) => {
    const { name, mobile, _id } = req.body;

    try {
      await userModel.findByIdAndUpdate(_id, { $set: { name, mobile } });
      res.redirect("/profile");
    } catch (error) {
      res.render("404");
      console.log(error);
    }
  },

  deleteAdderess: async (req, res) => {
    const _id = req.session.user.id;
    const id = req.params.id;

    try {
      await userModel.updateOne(
        { _id, address: { $elemMatch: { id } } },
        {
          $pull: {
            address: { id },
          },
        }
      );
      res.redirect("back");
    } catch (error) {
      res.render("404");
      console.log(error);
    }
  },

  getEditAddress: async (req, res) => {
    const id = req.params.id;

    try {
      let { address } = await userModel.findOne(
        { "address.id": id },
        { _id: 0, address: { $elemMatch: { id } } }
      );
      res.render("editAddress", { address: address[0] });
    } catch (error) {
      res.render("404");
      console.log(error);
    }
  },

  postEditAddress: async (req, res) => {
    try {
      await userModel.updateOne(
        {
          _id: req.session.user.id,
          address: { $elemMatch: { id: req.body.id } },
        },
        {
          $set: {
            "address.$": req.body,
          },
        }
      );
      res.redirect("/profile");
    } catch (error) {
      res.render("404");
      console.log(error);
    }
  },

  postCheckout: async (req, res) => {
    try {
      console.log(req.body, "8888888888888888888888");

      const _id = req.session.user.id;

      const { cart } = await userModel.findOne({ _id }, { cart: 1 });

      console.log(cart);

      const cartList = cart.map((item) => {
        return item.id;
      });
      console.log(cartList);
      // console.log(cart)

      const product = await productModel
        .find({ _id: { $in: cartList } })
        .lean();

      let totalPrice = 0;

      product.forEach((item, index) => {
        totalPrice = totalPrice + item.price * cart[index].quantity;
      });
      console.log(totalPrice);

      let { address } = await userModel.findOne(
        { _id },
        { _id: 0, address: { $elemMatch: { id: req.body.address } } }
      );
      console.log(address);

      req.session.userAddress = {
        id: address[0].id,
      };

      if (req.body.payment != "cod") {
        let orderId = "order_" + idcreate();
        const options = {
          method: "POST",
          url: "https://sandbox.cashfree.com/pg/orders",
          headers: {
            accept: "application/json",
            "x-api-version": "2022-09-01",
            "x-client-id": "331499ac934a4e418a4c162d00994133",
            "x-client-secret": "7488a0d389c527c5e59db40366c386541fdd5e96",
            "content-type": "application/json",
          },
          data: {
            order_id: orderId,
            order_amount: parseInt(req.body.total),
            order_currency: "INR",
            customer_details: {
              customer_id: _id,
              customer_email: "f@gmail.com",
              customer_phone: "9087674576",
            },
            order_meta: {
              return_url: "http://localhost:2222/return?order_id={order_id}",
            },
          },
        };

        await axios
          .request(options)
          .then(function (response) {
            return res.render("paymenttemp", {
              orderId,
              sessionId: response.data.payment_session_id,
            });
          })
          .catch(function (error) {
            console.error(error);
          });
      } else {
        let orders = [];
        let i = 0;

        for (let item of product) {
          await productModel.updateOne(
            { _id: item._id },
            {
              $inc: {
                quantity: -1 * cart[i].quantity,
              },
            }
          );
          totalPrice = cart[i].quantity * item.price;
          orders.push({
            address: address[0],
            orderItems: item,
            userId: req.session.user.id,
            quantity: cart[i].quantity,
            totalPrice: req.body.total,
            paymentType: req.body.payment,
          });
          i++;
        }
        const order = await orderModel.create(orders);
        await userModel.findByIdAndUpdate(req.session.user.id, {
          $set: { cart: [] },
        });

        res.render("orderSucsess");
      }
    } catch (error) {
      console.log("error");
      console.log(error);
    }
  },

  getpaymentUrl: async (req, res) => {
    try {
      const order_id = req.query.order_id;
      const options = {
        method: "GET",
        url: "https://sandbox.cashfree.com/pg/orders/" + order_id,
        headers: {
          accept: "application/json",
          "x-api-version": "2022-09-01",
          "x-client-id": "331499ac934a4e418a4c162d00994133",
          "x-client-secret": "7488a0d389c527c5e59db40366c386541fdd5e96",
          "content-type": "application/json",
        },
      };

      const response = await axios.request(options);

      if (response.data.order_status == "PAID") {
        const _id = req.session.user.id;

        const { cart } = await userModel.findOne({ _id }, { cart: 1 });

        const cartList = cart.map((item) => {
          return item.id;
        });

        const product = await productModel
          .find({ _id: { $in: cartList } })
          .lean();

        let totalPrice = 0;

        product.forEach((item, index) => {
          totalPrice = totalPrice + item.price * cart[index].quantity;
        });

        const address = req.session.userAddress.id;

        let newAddress = await userModel.findOne(
          { _id },
          { _id: 0, address: { $elemMatch: { id: address } } }
        );

        let orders = [];
        let i = 0;

        for (let item of product) {
          await productModel.updateOne(
            { _id: item._id },
            {
              $inc: {
                quantity: -1 * cart[i].quantity,
              },
            }
          );
          totalPrice = cart[i].quantity * item.price;
          orders.push({
            address: newAddress.address[0],
            orderItems: item,
            userId: req.session.user.id,
            quantity: cart[i].quantity,
            totalPrice: response.data.order_amount,
            paymentType: "online",
            paid: true,
          });
          i++;
        }
        const order = await orderModel.create(orders);
        await userModel.findByIdAndUpdate(req.session.user.id, {
          $set: { cart: [] },
        });

        res.render("orderSucsess");
      } else {
        res.send("error");
      }
    } catch (err) {
      res.render("404");
      console.log(err);
    }
  },

  getOrders: async (req, res) => {
    try {
      const order = await orderModel.find().lean();

      let empty;
      order.length == 0 ? (empty = true) : (empty = false);
      res.render("orders", { order, empty });
    } catch (err) {
      res.render("404");
      console.log(err);
    }
  },

  getviewOrder: async (req, res) => {
    try {
      const id = req.params.id;

      const order = await orderModel.findById({ _id: id }).lean();

      res.render("viewOrder", { order });
    } catch (err) {
      res.render("404");
      console.log(err);
    }
  },

  cancelOrder: async (req, res) => {
    try {
      const orderId = req.params.id;

      const order = await orderModel
        .updateOne(
          { _id: orderId },
          { $set: { status: "cancelled", cancel: true } }
        )
        .lean();

      res.redirect("back");
    } catch (err) {
      res.render("404");
      console.log(err);
    }
  },

  paymentSetup: (req, res) => {
    res.render("onlinePayment");
  },

  applyCoupon: async (req, res) => {
    try {
      const _id = req.params.id;
      const totalAmount = req.params.totalAmount;

      const coupon = await couponModel.findOne({ code: _id });
      if (coupon.expiry > new Date() && totalAmount >= coupon.minAmount) {
        let subTotal = totalAmount - Number(coupon.cashBack);

        res.json({ success: true, subTotal });
      } else {
        res.json({ success: false });
      }
    } catch (err) {
      res.render("404");
      console.log(err);
    }
  },

  errorPage: (req, res) => {
    res.render("404");
  },

  
};
