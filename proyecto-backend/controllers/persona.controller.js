const Persona = require('../models/persona');
const Rol = require('../models/rol'); 
const Area =  require('../models/area');
const jwt = require('jsonwebtoken');

const personaCtrl = {}


personaCtrl.getPersona = async (req, res) => {
    //console.log(req.params.id);
    const apersona = await Persona.findById(req.params.id)
    res.json(apersona);
    //console.log(apersona);
}

personaCtrl.getPersonas = async (req, res) => {
    var apersonas = await Persona.find()
    res.json(apersonas);
}

personaCtrl.createPersona = async (req, res) => {
    var apersona = new Persona(req.body);
   // console.log("dni: "+ req.body.dni);
    const personaEncontradaPorDni = await Persona.findOne({dni:{$eq:req.body.dni}});
   // console.log(personaEncontradaPorDni);
   if (personaEncontradaPorDni==null || personaEncontradaPorDni=="" || personaEncontradaPorDni==undefined) {
        try {
            await apersona.save();
            res.json({
                'status': '1',
                'msg': 'Persona guardada'
            })
        } catch (error) {
            res.status(400).json({
            'status': '0',
            'msg': 'Error procesando operacion persona'
            })
        }    
    }else{
       res.json({
           'status':"2",
           'msg':"Ya se encuentra una persona registrada con ese numero de dni"
         })
    }
}

personaCtrl.editPersona = async (req, res) => {
    const persona = new Persona(req.body);
    //console.log("Dni:"+req.body.dni);
    //console.log("ID"+req.body._id);
    const pSinCambioDni = await Persona.findOne({$and:[
                                                {_id:{$eq:req.body._id}},
                                                {dni:{$eq:req.body.dni}}
                                            ]});
    //console.log(pSinCambioDni);
    
    if(pSinCambioDni!=null && pSinCambioDni!="" && pSinCambioDni!=undefined){
        try {
            //console.log("no hubo cambio de dni");
            await Persona.updateOne({_id: req.body._id}, persona);
            res.json({
                'status': '1',
                'msg': 'Persona actualizada correctamente'
             }) 
        } catch (error) {
            res.status(400).json({
                'status': '0',
                'msg': 'Error procesando la operacion'
            }) 
        }
    }else{
        const personaEncontradaPorDni = await Persona.findOne({$and:[
            {_id:{$ne:req.body._id}},
            {dni:{$eq:req.body.dni}}
          ]});
        //console.log("persona buscada por dni ");
        //console.log(personaEncontradaPorDni);
        if (personaEncontradaPorDni!=null && personaEncontradaPorDni!="" && personaEncontradaPorDni!=undefined) {
            res.json({
                'status':"2",
                'msg':"Ya se encuentra una persona registrada con ese numero de dni"
            })
        }else{
            try {
                await Persona.updateOne({_id: req.body._id}, persona);
                res.json({
                    'status': '1',
                    'msg': 'Persona actualizada correctamente'
                }) 
            } catch (error) {
                res.status(400).json({
                    'status': '0',
                    'msg': 'Error procesando la operacion'
                }) 
            }
        }
    }
}

personaCtrl.deletePersona = async (req, res)=>{
    try {
        await Persona.deleteOne({_id: req.params.id});
        res.json({
            'status': '1',
            'msg': 'Persona removed'
        }) 
    } catch (error) {
        res.status(400).json({
            'status': '0',
            'msg': 'Error procesando la operacion'
        }) 
    }
}


personaCtrl.getPersonaByType = async (req, res) => {
    
    var personas = await Persona.find({rol:req.query.rol});
    res.json(personas);
}

personaCtrl.loginUsuario = async (req, res)=>{

    const criteria = {
            username: req.body.username,
            password: req.body.password
    }

    try{
        const user = await Persona.findOne(criteria);
        if (!user) {
            res.json({
                'status': 0,
                'msg': "not found" 
            })
        }else{
            //preparo un token para ser enviado en caso de loguin correcto
            const unToken = jwt.sign({id: user._id}, "secretkey");
            res.json({
                'status': 1,
                'msg': "success",
                username: user.username, 
                userid: user._id,
                rol: user.rol,
                token: unToken  //retorno del tokens
            })
        }

    }catch(error){
        res.json({
            'status': 0,
            'msg': 'error'
        })
    }

}





module.exports = personaCtrl;