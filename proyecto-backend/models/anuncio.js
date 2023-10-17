const mongoose = require('mongoose');
const {Schema} = mongoose;
const Rol = require("./rol");


const AnuncioSchema = new Schema({
    titulo: {type: String},
    descripcionCard: {type: String},
    descripcion: {type:String},
    fechaDesde: {type: String},
    fechaHasta: {type:String},
    recursos: [{
        base64:{type:String},
        type:{type: String},
        name:{type: String}
    }],
    tipo: {type:String},
    destinatarios: [{ type: Schema.Types.ObjectId, ref: Rol, required: true }],

})

module.exports = mongoose.models.Anuncio || mongoose.model('Anuncio', AnuncioSchema);