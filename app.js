const express = require("express");
const connectDB = require("./config/dbConnect");
const session = require("express-session");
const adminRouter = require("./routes/adminRouter");
const userRouter = require("./routes/userRouter");
const cache = require("./middlewares/cacheControl");

const app = express();


app.set("view engine", "ejs");
connectDB();
app.use(
  session({
    secret: "secret",
    saveUninitialized: true,
    resave: false,
  })
);

app.use(cache);
app.use(express.static(__dirname + "/public"));
app.use(express.urlencoded({ extended: true }));
app.use("/admin", adminRouter);
app.use("/", userRouter);

app.listen(2222, () => {
  console.log("http://localhost:2222");
});
