const jwt = require('jsonwebtoken');
const {User} = require('../models');

const verifyToken = async (req, res, next) => {
    try {
        const token = req.header('Authorization');
        if (!token) {
            return res.status(401).json({
                status: 'error',
                message: "No auth token, access denied"
            });
        }

        const verified = jwt.verify(token, "passwordKey");
        if (!verified) {
            return res.status(401).json({
                status: 'error',
                message: "Token verification failed, authorization denied."
            });
        }

        req.user = verified.id;
        next();
    } catch (err) {
        return res.status(500).json({
            status: 'error',
            message: err.message
        });
    }
}

const veryfiPasien = async (req,res,next) => {
    try{
        const token = req.header('Authorization');
        
        if(!token){
            res.status(401).json({
                status : 'error',
                message : "No auth token, access denied"
            });
        }
        console.log(token)
        const verified = jwt.verify(token, "passwordKey")
        if(!verified){
            return res
        .status(401)
        .json({ 
            status :'error', 
             message: "Token verification failed, authorization denied." 
        });

        }

        const user = await User.findByPk(verified.id)
        if(user.role !== 'patient'){
            return res.status(401).json({
                status : 'error',
                message : "Only pasien can access"
            })
        }
        req.user = user.id;
        next();
    }catch(err){
        return res.status(500).json({
            status : 'error',
            message :err.message
        })
    }
}

const veryfiDoctor = async (req,res,next) => {
    try{
        const token = req.header('Authorization');
        if(!token){
            res.status(401).json({
                status : 'error',
                message : "No auth token, access denied"
            });
        }

        const verified = jwt.verify(token, "passwordKey")
        if(!verified){
            return res
        .status(401)
        .json({ 
            status :'error', 
         message: "Token verification failed, authorization denied." 
        });

        }

        const user = await User.findByPk(verified.id)
        if(user.role !== 'doctor'){
            return res.status(401).json({
                status : 'error',
                message : "Only doctor can access"
            })
        }
        req.user = user.id;
        next();
    }catch(err){
        return res.status(500).json({
            status : 'error',
            message : err.message
        })
    }
}

module.exports = {verifyToken, veryfiDoctor, veryfiPasien}