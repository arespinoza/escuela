const mongoose = require('mongoose');
//const URI = 'mongodb://localhost/ProyectoFinal';
const URI = 'mongodb+srv://me380017100savio:EscSav119@escuela119.bdnyolb.mongodb.net/escueladb?retryWrites=true&w=majority';

mongoose.connect(URI)
.then(db=>console.log('DB is connected'))
.catch(err=>console.error(err))
module.exports = mongoose;
