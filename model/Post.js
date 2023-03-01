import mongoose from "mongoose"
import slugify from "slugify"
import geoCoder from "../utils/geocoder"


const postSchema=new mongoose.Schema({
    title:{
        type:String,
        required:true
    },
    slug:String,
    description:{
        type:String,
        required:true,
        maxlength:1000
    },
    image:{
        type:String,
        required:true
    },
    dinerName:{
        type:String,
        required:true
    },
    address:{
        type:String,
        required:true
    },
    location:{
        type:{
            type:String,
            enum:['Point']
        },
        coordinates:{
            type:[Number],
            index:'2dsphere'
        },
        formattedAddress:String,
        city:String,
        state:String,
        zipcode:String,
        country:String
    },
    postingDate:{
        type:Date,
        default:Date.now
    },
    likes:[],
    user:{
        type:mongoose.Types.ObjectId,
        ref:'User',
        required:true
    }

})

postSchema.pre('save',function(next){
    this.slug=slugify(this.title,{lower:true})

    next()
})

//setting up Location

postSchema.pre('save',async function(next){
    const loc=await geoCoder.geocode(this.address)
    
    this.location={
        type:'Point',
        coordinates:[loc[0].longitude,loc[0].latitude],
        formattedAddress:loc[0].formattedAddress,
        city:loc[0].city,
        state:loc[0].stateCode,
        zipcode:loc[0].zipcode,
        country:loc[0].countryCode
    }
})

//update location

postSchema.pre('findOneAndUpdate', async function (next) {
     
    if (this._update.address) {
      const loc = await geoCoder.geocode(this._update.address);
   
      this._update.location = {
        type: 'Point',
        coordinates: [loc[0].longitude, loc[0].latitude],
        formattedAddress: loc[0].formattedAddress,
        city: loc[0].city,
        state: loc[0].stateCode,
        zipcode: loc[0].zipcode,
        country: loc[0].countryCode
      };
    }
  });

export default mongoose.model('Post',postSchema)