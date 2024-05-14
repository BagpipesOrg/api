//Validation
import Joi from 'joi';
import  worker from 'cluster';

//register platform user validation
export const registerValidation = (data) => { 
    
    const schema = Joi.object({
    // name: 
    //     Joi.string()
    //     .required(),
    email: 
        Joi.string()
        .required()
        .email(),
    password: 
        Joi.string()
        .min(8)
        .required(),
    // organisation: 
    //     Joi.string()
    //     .min(8)
    //     .required()

});
return schema.validate(data);
};

export const loginValidation = (data) => { 
    
    const schema = Joi.object({
    
    email: 
        Joi.string()
        .required()
        .email(),
    password: 
        Joi.string()
        .min(8)
        .required(),

});
return schema.validate(data);
};

export default { registerValidation, loginValidation}