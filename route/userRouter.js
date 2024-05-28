const express = require("express");
const {
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
  getSinglePost,
  getTestimonial,
  postContact,
  getIndex2,
  getIndex3,
  errorpage,
} = require("../controllers/userController");
const { checkToken } = require("../middlewares/cookiesVaildation");

const router = express.Router();

router.get("/error", errorpage)
router.get("/",checkToken,getHome);
router.get("/post-ads",checkToken, getAds);
router.get("/register", getRegister);
router.get("/login",  getLogin);
router.post("/login", postLogin);
router.post("/register", postRegister);
router.post("/post-ads", checkToken, postAds);
router.get("/adsDetail/:id",checkToken, getDetail);
router.get("/services", checkToken, getService);
router.get("/about", checkToken, getAbout);
router.get("/account-favourite-ads", checkToken, getAccountFavourite);
router.get("account-myads", checkToken, getAccountMy);
router.get("/account-profile-setting", checkToken, getAccountProfile);
router.get("/adlistinggrid", checkToken, getAdlistingGrid);
router.get("/adlistinglist", checkToken, getAdlistingList);
router.get("/blog-grid-full-width", checkToken, getBlogGrid);
router.get("/blog-left-sidebar", checkToken, getBlogLeft);
router.get("/blog", checkToken, getBlog);
router.get("/category", checkToken, getCategory);
router.get("/contact", checkToken, getContact);
router.get("/dashboard", checkToken, getDashboard);
router.get("/faq", checkToken, getFaq);
router.get("/forgot-password", checkToken, getForgetPassword);
router.get("/offermessage", checkToken, getOfferMessage);
router.get("/payments", checkToken, getPayment);
router.get("/pricing", checkToken, getPricing);
router.get("/single-post", checkToken, getSinglePost);
router.get("/testimonial", checkToken, getTestimonial);
router.get("/index-2", checkToken, getIndex2)
router.get("/index-3", checkToken, getIndex3)
router.post("/contact", checkToken, postContact);

module.exports = router;
