const systemConfig=require("../../config/sytem");
const authMiddlewares= require("../../middlewares/admin/auth.middleware")
const dashBoardRoutes=require("./dashboard.router");
const productsRoutes=require("./products.router");
const productCategoryRoutes=require("./products-category.router");
const rolesRouter=require("./roles.router");
const accountsRouter=require("./accounts.router");
const authsRouter=require("./auth.router");
const myAccountRouter=require("./my-account.router");
module.exports=(app)=>{
    const PATH_ADMIN=systemConfig.prefixAdmin;
    app.use(PATH_ADMIN+"/dashboard",authMiddlewares.requireAuth,dashBoardRoutes);

    app.use(PATH_ADMIN+"/products",authMiddlewares.requireAuth,productsRoutes);

    app.use(PATH_ADMIN+"/products-category",authMiddlewares.requireAuth,productCategoryRoutes);
    app.use(PATH_ADMIN+"/roles",authMiddlewares.requireAuth,rolesRouter);

    app.use(PATH_ADMIN+"/accounts",authMiddlewares.requireAuth,accountsRouter);
    app.use(PATH_ADMIN+"/auth",authsRouter);
    app.use(PATH_ADMIN+"/my-account",authMiddlewares.requireAuth,myAccountRouter);
}