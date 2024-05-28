const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const userModel = require("../model/auth");
const productModel = require("../model/product");
const contactModel = require("../model/contact");
const { spName } = require("../middlewares/upload");

const errorpage = (req, res) => {
  res.render("error", { error: "Error Occured" });
};
const getHome = async (req, res) => {
  try {
    if (req.user) {
      const userId = req.user.id;
      const userInner = await userModel.findOne({ _id: userId });
      const product = await productModel.find();
      const allProduct = await product.map((item) => {
        return {
          ...item.toObject(),
          display: item.images[0] || "assets/img/featured/img-2.jpg",
        };
      });
      res.render("index", { userInner, allProduct });
    } else {
      const product = await productModel.find();
      const allProduct = await product.map((item) => {
        return {
          ...item.toObject(),
          display: item.images[0] || "assets/img/featured/img-2.jpg",
        };
      });
      res.render("index", { allProduct });
    }
  } catch (error) {}
};

const postRegister = async (req, res) => {
  try {
    const { userName, email, password, retypePassword } = req.body;
    const checkF = ["userName", "email", "password", "retypePassword"];
    const emptyAuth = [];
    for (const auth of checkF) {
      if (!req.body[auth] || req.body[auth] === "") {
        emptyAuth.push(auth);
      }
    }
    if (emptyAuth.length < 0) {
      return res.render("register", {
        error: `This field(s) ${emptyAuth.join(", ")} cannot be empty`,
      });
    }

    if (password !== retypePassword) {
      return res.render("register", {
        error: "email and password Mismatch",
      });
    }
    const checkEmail = await userModel.findOne({ email: email });
    if (checkEmail) {
      return res.render("register", { error: `Email already exist !` });
    }

    await userModel.create({
      userName: userName,
      email: email,
      password: password,
    });
    return res.render("login", {
      success: `Account created successfully, kindly login !`,
    });
  } catch (err) {
    res.render("error", { error: err.message });
  }
};
const postLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const checkF = ["email", "password"];
    const emptyAuth = [];
    for (const auth of checkF) {
      if (!req.body[auth] || req.body[auth] === "") {
        emptyAuth.push(auth);
      }
    }
    if (emptyAuth.length > 0) {
      return res.render("login", {
        error: `This field(s) ${emptyAuth.join(", ")} cannot be empty`,
      });
    }
    const checkUser = await userModel.findOne({ email: email });
    if (!checkUser) {
      return res.render("login", { error: `Email already exist !` });
    }
    const comparePassword = await bcrypt.compare(password, checkUser.password);
    if (comparePassword) {
      const token = await jwt.sign(
        { id: checkUser._id },
        process.env.JWT_SECRET_KEY,
        {
          expiresIn: "1h",
        }
      );
      res.cookie("Nexusplus", token);
      return res.redirect("/");
    } else {
      return res.render("login", { error: "Email or Password mismatch" });
    }
  } catch (err) {
    res.render("error", { error: err.message });
  }
};
const postAds = async (req, res) => {
  try {
    if (req.user) {
      const userId = req.user.id;
      const userInner = await userModel.findOne({ _id: userId });
      const {
        title,
        price,
        message,
        firstName,
        address,
        country,
        category,
        condition,
        brand,
      } = req.body;
      const images = req.files.images;
      const imageArr = [];
      const productField = [
        "title",
        "price",
        "message",
        "firstName",
        "address",
        "category",
        "country",
        "condition",
        "brand",
      ];
      const emptyField = [];
      for (const field of productField) {
        if (!req.body[field] || req.body[field] === "") {
          emptyField.push(field);
        }
      }
      if (emptyField.length > 0) {
        return res.render("post-ads", {
          error: `This field(s) ${emptyField.join(", ")} cannot be empty`,
        });
      }
      if (Array.isArray(images)) {
        await Promise.all(
          images.map(async (item) => {
            const newName = spName(item.name);
            const filePath = `/upload/${newName}`;
            imageArr.push(filePath);
            const fileDir = `public/upload/${newName}`;
            await item.mv(fileDir);
          })
        );
      } else {
        const newName = spName(images.name);
        const filePath = `/upload/${newName}`;
        imageArr.push(filePath);
        const fileDir = `public/upload/${newName}`;
        await images.mv(fileDir);
      }

      await productModel.create({
        title: title,
        price: price,
        message: message,
        firstName: firstName,
        address: address,
        country: country,
        category: category,
        condition: condition,
        brand: brand,
        images: imageArr,
      });
      res.render("post-ads", {
        success: "Product posted successfully",
        userInner,
      });
    } else {
      return res.redirect("/login");
    }
  } catch (err) {
    res.render("error", { error: err.message });
  }
};

const getDetail = async (req, res) => {
  try {
    const productId = req.params.id;
    const product = await productModel.findOne({ _id: productId });
    if (req.user) {
      const userId = req.user.id;
      const userInner = await userModel.findOne({ _id: userId });
      res.render("ads-details", { product, userInner });
    } else {
      res.render("ads-details", { product });
    }
  } catch (error) {
    res.render("error", { error: error.message });
  }
};

const getAdlistingGrid = async (req, res) => {
  try {
    if (req.user) {
      const userId = req.user.id;
      const userInner = await userModel.findOne({ _id: userId });
      const product = await productModel.find();
      const allProduct = await product.map((item) => {
        return {
          ...item.toObject(),
          display: item.images[0] || "assets/img/featured/img-2.jpg",
        };
      });
      res.render("adlistinggrid", { userInner, allProduct });
    } else {
      const product = await productModel.find();
      const allProduct = await product.map((item) => {
        return {
          ...item.toObject(),
          display: item.images[0] || "assets/img/featured/img-2.jpg",
        };
      });
      res.render("adlistinggrid", { allProduct });
    }
  } catch (error) {}
};

const getAdlistingList = async (req, res) => {
  try {
    if (req.user) {
      const userId = req.user.id;
      const userInner = await userModel.findOne({ _id: userId });
      const product = await productModel.find();
      const allProduct = await product.map((item) => {
        return {
          ...item.toObject(),
          display: item.images[0] || "assets/img/featured/img-2.jpg",
        };
      });
      res.render("adlistinglist", { userInner, allProduct });
    } else {
      const product = await productModel.find();
      const allProduct = await product.map((item) => {
        return {
          ...item.toObject(),
          display: item.images[0] || "assets/img/featured/img-2.jpg",
        };
      });
      res.render("adlistinglist", { allProduct });
    }
  } catch (error) {}
};

const getCategory = async (req, res) => {
  try {
    if (req.user) {
      const userId = req.user.id;
      const userInner = await userModel.findOne({ _id: userId });
      const product = await productModel.find();
      const allProduct = await product.map((item) => {
        return {
          ...item.toObject(),
          display: item.images[0] || "assets/img/featured/img-2.jpg",
        };
      });
      res.render("category", { userInner, allProduct });
    } else {
      const product = await productModel.find();
      const allProduct = await product.map((item) => {
        return {
          ...item.toObject(),
          display: item.images[0] || "assets/img/featured/img-2.jpg",
        };
      });
      res.render("category", { allProduct });
    }
  } catch (error) {}
};

const postContact = async (req, res) => {
  try {
    if (req.user) {
      const userId = req.user.id;
      const userInner = await userModel.findOne({ _id: userId });
      const { Name, email, subject, message } = req.body;
      const field = [];
      const incomingField = ["Name", "email", "subject", "message"];
      for (const child of incomingField) {
        if (!req.body[child] || req.body[child] === "") {
          field.push(child);
        }
      }
      if (field.length > 0) {
        return res.render("contact", {
          error: `This field(s) ${field.join(", ")} cannot be empty`,
        });
      }
      await contactModel.create({
        Name: Name,
        email: email,
        subject: subject,
        message: message,
      });
      return res.render("contact", {
        success: "Posted successfully, You will get feedback soon",
        userInner,
      });
    }
  } catch (err) {
    res.render("error", { error: err.message });
  }
};

// Get code>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
const getLogin = (req, res) => {
  res.render("login");
};
const getRegister = (req, res) => {
  res.render("register");
};
const getAds = async (req, res) => {
  try {
    if (req.user) {
      const userId = req.user.id;
      const userInner = await userModel.findOne({ _id: userId });
      res.render("post-ads", { userInner });
    } else {
      res.render("post-ads");
    }
  } catch (error) {
    res.render("error", { error: error.message });
  }
};
const getService = async (req, res) => {
  try {
    if (req.user) {
      const userId = req.user.id;
      const userInner = await userModel.findOne({ _id: userId });
      res.render("services", { userInner });
    } else {
      res.render("services");
    }
  } catch (error) {
    res.render("error", { error: error.message });
  }
};
const getAbout = async (req, res) => {
  try {
    if (req.user) {
      const userId = req.user.id;
      const userInner = await userModel.findOne({ _id: userId });
      res.render("about", { userInner });
    } else {
      res.render("about");
    }
  } catch (error) {
    res.render("error", { error: error.message });
  }
};
const getAccountFavourite = async (req, res) => {
  try {
    if (req.user) {
      const userId = req.body.id;
      const userInner = await userModel.findOne({ _id: userId });
      res.render("account-favourite-ads", { userInner });
    } else {
      res.render("account-favourite-ads");
    }
  } catch (error) {
    res.render("error", { error: error.message });
  }
};
const getAccountMy = async (req, res) => {
  try {
    if (req.user) {
      const userId = req.body.id;
      const userInner = await userModel.findOne({ _id: userId });
      res.render("account-myads", { userInner });
    } else {
      res.render("account-myads");
    }
  } catch (error) {
    res.render("error", { error: error.message });
  }
};
const getAccountProfile = async (req, res) => {
  try {
    if (req.user) {
      const userId = req.body.id;
      const userInner = await userModel.findOne({ _id: userId });
      res.render("account-profile-setting", { userInner });
    } else {
      res.render("account-profile-setting");
    }
  } catch (error) {
    res.render("error", { error: error.message });
  }
};
const getBlogGrid = async (req, res) => {
  try {
    if (req.user) {
      const userId = req.user.id;
      const userInner = await userModel.findOne({ _id: userId });
      res.render("blog-grid-full-width", { userInner });
    } else {
      res.render("blog-grid-full-width");
    }
  } catch (error) {
    res.render("error", { error: error.message });
  }
};
const getBlogLeft = async (req, res) => {
  try {
    if (req.user) {
      const userId = req.user.id;
      const userInner = await userModel.findOne({ _id: userId });
      res.render("blog-left-sidebar", { userInner });
    } else {
      res.render("blog-left-sidebar");
    }
  } catch (error) {
    res.render("error", { error: error.message });
  }
};
const getBlog = async (req, res) => {
  try {
    if (req.user) {
      const userId = req.user.id;
      const userInner = await userModel.findOne({ _id: userId });
      res.render("blog", { userInner });
    } else {
      res.render("blog");
    }
  } catch (error) {
    res.render("error", { error: error.message });
  }
};
const getContact = async (req, res) => {
  try {
    if (req.user) {
      const userId = req.body.id;
      const userInner = await userModel.findOne({ _id: userId });
      res.render("contact", { userInner });
    } else {
      res.render("contact");
    }
  } catch (error) {
    res.render("error", { error: error.message });
  }
};
const getDashboard = async (req, res) => {
  try {
    if (req.user) {
      const userId = req.body.id;
      const userInner = await userModel.findOne({ _id: userId });
      res.render("dashboard", { userInner });
    } else {
      res.render("dashboard");
    }
  } catch (error) {
    res.render("error", { error: error.message });
  }
};
const getFaq = async (req, res) => {
  try {
    if (req.user) {
      const userId = req.user.id;
      const userInner = await userModel.findOne({ _id: userId });
      res.render("faq", { userInner });
    } else {
      res.render("faq");
    }
  } catch (error) {
    res.render("error", { error: error.message });
  }
};
const getForgetPassword = async (req, res) => {
  res.render("forgot-password");
};
const getOfferMessage = async (req, res) => {
  try {
    if (req.user) {
      const userId = req.user.id;
      const userInner = await userModel.findOne({ _id: userId });
      res.render("offermessages", { userInner });
    } else {
      res.render("offermessages");
    }
  } catch (error) {
    res.render("error", { error: error.message });
  }
};
const getPayment = async (req, res) => {
  try {
    if (req.user) {
      const userId = req.user.id;
      const userInner = await userModel.findOne({ _id: userId });
      res.render("payments", { userInner });
    } else {
      res.render("payments");
    }
  } catch (error) {
    res.render("error", { error: error.message });
  }
};
const getPricing = async (req, res) => {
  try {
    if (req.user) {
      const userId = req.user.id;
      const userInner = await userModel.findOne({ _id: userId });
      res.render("pricing", { userInner });
    } else {
      res.render("pricing");
    }
  } catch (error) {
    res.render("error", { error: error.message });
  }
};
const getPrivacy = async (req, res) => {
  try {
    if (req.user) {
      const userId = req.user.id;
      const userInner = await userModel.findOne({ _id: userId });
      res.render("privacy-settings", { userInner });
    } else {
      res.render("privacy-settings");
    }
  } catch (error) {
    res.render("error", { error: error.message });
  }
};
const getSinglePost = async (req, res) => {
  try {
    if (req.user) {
      const userId = req.user.id;
      const userInner = await userModel.findOne({ _id: userId });
      res.render("single-post", { userInner });
    } else {
      res.render("single-post");
    }
  } catch (error) {
    res.render("error", { error: error.message });
  }
};
const getTestimonial = async (req, res) => {
  try {
    if (req.user) {
      const userId = req.user.id;
      const userInner = await userModel.findOne({ _id: userId });
      res.render("testimonial", { userInner });
    } else {
      res.render("testimonial");
    }
  } catch (error) {
    res.render("error", { error: error.message });
  }
};
const getIndex2 = async (req, res) => {
  try {
    if (req.user) {
      const userId = req.user.id;
      const userInner = await userModel.findOne({ _id: userId });
      const product = await productModel.find();
      const allProduct = await product.map((item) => {
        return {
          ...item.toObject(),
          display: item.images[0] || "assets/img/featured/img-2.jpg",
        };
      });
      res.render("index", { allProduct, userInner });
    } else {
      const product = await productModel.find();
      const allProduct = await product.map((item) => {
        return {
          ...item.toObject(),
          display: item.images[0] || "assets/img/featured/img-2.jpg",
        };
      });
      res.render("index", { allProduct });
    }
  } catch (error) {
    res.render("error", { error: error.message });
  }
};
const getIndex3 = async (req, res) => {
  try {
    if (req.user) {
      const userId = req.user.id;
      const userInner = await userModel.findOne({ _id: userId });
      const product = await productModel.find();
      const allProduct = await product.map((item) => {
        return {
          ...item.toObject(),
          display: item.images[0] || "assets/img/featured/img-2.jpg",
        };
      });
      res.render("index", { allProduct, userInner });
    } else {
      const product = await productModel.find();
      const allProduct = await product.map((item) => {
        return {
          ...item.toObject(),
          display: item.images[0] || "assets/img/featured/img-2.jpg",
        };
      });
      res.render("index", { allProduct });
    }
  } catch (error) {
    res.render("error", { error: error.message });
  }
};

module.exports = {
  errorpage,
  getRegister,
  getLogin,
  postRegister,
  postLogin,
  getHome,
  getAds,
  postAds,
  getDetail,
  getService,
  getAbout,
  getAccountFavourite,
  getAccountMy,
  getAccountProfile,
  getAdlistingGrid,
  getAdlistingList,
  getBlogGrid,
  getBlogLeft,
  getBlog,
  getCategory,
  getContact,
  getDashboard,
  getFaq,
  getForgetPassword,
  getOfferMessage,
  getPayment,
  getPricing,
  getPrivacy,
  getSinglePost,
  getTestimonial,
  getIndex2,
  getIndex3,
  postContact,
};
