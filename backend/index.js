const express = require("express");
const app = express();

const cors = require("cors");
const path = require("path");
const cookieParser = require("cookie-parser");
const session = require("express-session");
//moment
const moment = require('moment');

app.use(express.json());

// flash
const flash = require('express-flash');
app.use(cookieParser("ABC"));
app.use(session({ cookie: { maxAge: 60000 } }));
app.use(flash());
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5175'],
  credentials: true
}));


//nhung phuong thuc
const methodOverride = require('method-override');
app.use(methodOverride("_method"));

const database = require("./config/database.js");
const systemConfig = require("./config/sytem.js");

// nhung env
require("dotenv").config();
// Use PORT from environment if available, otherwise default to 3005
const port = process.env.PORT || 3005;

//tinymce
app.use('/tinymce', express.static(path.join(__dirname, 'node_modules', 'tinymce')));
//end tinymce

//nhung bodyparser
const bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: false }));

const routes = require("./routes/client/index.routes");
const AdminRoutes = require("./routes/admin/index.router");
const apiRouter = require("./routes/api/index.api.js");

database.connect();

app.set("views", `${__dirname}/views`);
app.set("view engine", "pug");
app.use(express.static(`${__dirname}/public`));

//routes
//routes(app);
AdminRoutes(app);
apiRouter(app)



// App Locals Variables (biến sử dụng được trong tất cả trong file pug)
app.locals.prefixAdmin = systemConfig.prefixAdmin;
app.locals.moment = moment;



app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});