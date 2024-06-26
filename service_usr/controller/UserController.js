const bcrypt = require("bcrypt")
const { User } = require("../models")
const jwt = require("jsonwebtoken")
const { where } = require("sequelize")
const Joi = require("joi")
const validator = require("fastest-validator")
const user = require("../models/User")
const v = new validator()
const { PrismaClient } = require("@prisma/client")
const prisma = new PrismaClient()

const register = async (req, res) => {
  try {
    const schema = {
      email: "email|empty:false",
      password: "string|empty:false",
      name: "string|empty:false",
      no_hp: "string|empty:false",
      gender: "string|empty:false",
      age: "number|empty:false",
    }

    const validated = v.validate(req.body, schema)

    if (validated.length) {
      return res.status(400).json({
        status: "error",
        message: validated,
      })
    }

    const user = await User.findOne({
      where: { email: req.body.email },
    })

    if (user) {
      return res.status(401).json({
        status: "error",
        message: "User dengan email tersebut sudah terdaftar",
      })
    }

    const hashedPassword = await bcrypt.hash(req.body.password, 10)

    const savedUser = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: hashedPassword,
      no_hp: req.body.no_hp,
      gender: req.body.gender,
      age: req.body.age,
    })

    return res.status(200).json({
      status: "success",
      data: savedUser,
    })
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: error.message,
    })
  }
}

const login = async (req, res) => {
  try {
    const schema = {
      email: "email|empty:false",
      password: "string|empty:false",
    }

    const validated = v.validate(req.body, schema)

    if (validated.length) {
      return res.status(400).json({
        status: "error",
        message: validated,
      })
    }

    const user = await User.findOne({
      where: { email: req.body.email },
    })

    if (!user) {
      return res.status(401).json({
        status: "error",
        message: "Email/password yang anda masukkan salah",
      })
    }

    const isPasswordValid = await bcrypt.compare(
      req.body.password,
      user.password
    )

    if (!isPasswordValid) {
      return res.status(401).json({
        status: "error",
        message: "Email/password yang anda masukkan salah",
      })
    }

    

    return res.status(200).json({
      id: user.id,
    })
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: error.message,
    })
  }
}

const update = async (req, res) => {
  try {
    const id = parseInt(req.params.id)
    const user = await User.findByPk(id)

    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      })
    }

    const schema = {
      name: "string|empty:false",
      email: "email|empty:false",
      no_hp: "string|empty:false",
      age: "number|optional",
      gender: "string|optional",
    }

    const validated = v.validate(req.body, schema)

    if (validated.length) {
      return res.status(400).json({
        status: "error",
        message: validated,
      })
    }

    const email = req.body.email
    if (email && email !== user.email) {
      const checkEmail = await User.findOne({
        where: { email: email },
      })

      if (checkEmail) {
        return res.status(409).json({
          status: "error",
          message: "Email ini sudah terdaftar",
        })
      }
    }

    const phone = req.body.no_hp
    if (phone && phone !== user.no_hp) {
      const checkPhone = await User.findOne({
        where: { no_hp: phone },
      })

      if (checkPhone) {
        return res.status(409).json({
          status: "error",
          message: "No hp ini sudah terdaftar",
        })
      }
    }
    console.log(req.body.name)
    const updatedUser = await user.update({
      email: req.body.email,
      no_hp: req.body.no_hp,
      name: req.body.name,
      age: req.body.age,
      gender: req.body.gender,
    })

    return res.status(200).json({
      status: "success",
      data: updatedUser,
    })
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: error.message,
    })
  }
}

const detailUser = async (req, res) => {
  try {
    const user = await User.findByPk(parseInt(req.params.id))
    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      })
    }

    return res.status(200).json({
      status: "success",
      data: user,
    })
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: error.message,
    })
  }
}

const updatePassword = async (req, res) => {
  try {
    const schema = {
      last_password: "string|empty:false",
      password: "string|empty:false",
    }

    const validated = v.validate(req.body, schema)

    if (validated.length) {
      return res.status(400).json({
        status: "error",
        message: validated,
      })
    }
    const user = await User.findByPk(parseInt(req.params.id))

    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      })
    }

    const isPasswordValid = await bcrypt.compare(
      req.body.last_password,
      user.password
    )

    if (!isPasswordValid) {
      return res.status(401).json({
        status: "error",
        message: "Password lama yang anda masukkan salah",
      })
    }

    hashedPassword = await bcrypt.hash(req.body.password, 10)

    await user.update({
      password: hashedPassword,
    })

    return res.status(200).json({
      status: "success",
      message: "updated password successfully",
    })
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: error.message,
    })
  }
}

module.exports = { register, login, update, detailUser, updatePassword }
