const mongoose=require("mongoose");
const slug=require("mongoose-slug-updater");

mongoose.plugin(slug);

const ProductSchema= new mongoose.Schema(
    {
        title:String,
        product_category_id:{
            type:String,
            default:""
        },
        description:String,
        price:Number,
        discountPercentage:Number,
        stock:Number,
        thumbnail:String,
        status:String,
        featured:String,
        position:Number,
        slug:{
            type: String, 
            slug:"title",
            unique:true
        },
        createBy:{
            account_id:String,
            createAt:{
                type:Date,
                default:Date.now 
            }
        },
        deleted:{
            type:Boolean,
            default:false
        },
        //deletedAt: Date
        deletedBy:{
            account_id:String,
            deletedAt:{
                type:Date,
                default:Date.now
            }
        },
        updatedBy:[
            {
                account_id:String,
                updatedAt:Date
            }
        ],
        
    },
    {
        timestamps:true
    });
const Product=mongoose.model('Product',ProductSchema,"products");

module.exports=Product;