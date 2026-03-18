import mongoose from "mongoose";

const denunciaSchema = new mongoose.Schema({
    

nombreCompleto:String,
dni:String,
telefono:String,
email:String,
domicilio:String,
ciudad:String,
hora:String,
dia:String,
mes:String,
anio:String,

motivoDenuncia:String,
domicilioComercial:String,
relacionConsumo:String,
documentalesAdjuntas:String,
numero:{
type:Number,
unique:true
},
fechaCreacion:{
type:Date,
default:Date.now
}

})

export default mongoose.model("Denuncia", denunciaSchema)