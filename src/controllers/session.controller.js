import { userModel } from "../models/users.models.js"
import { generateToken } from "../utils/jwt.js"
import { logger } from "../utils/logger.js"

export const postUser = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(400).send({ message: 'Existing user' })
        }
        res.redirect(`/static/login`) //Redirect
    } catch (error) {
        logger.error(`[ERROR] - Date: ${new Date().toLocaleTimeString()} - ${error.message}`)
        res.status(500).send({ message: `Error creating user: ${error}` })
    }
}

export const login = async (req, res) => {
    try {
        if (!req.user) {
            if (req.authInfo && req.authInfo.message) {
                return res.status(401).send({ message: req.authInfo.message })
            }
            return res.status(401).send({ message: `Authentication failed` })
        }
        //get userId & update last_connection
        const userId = req.user._id
        const user = await userModel.findById(userId)
        if (user) {
            user.last_connection = new Date()
            await user.save()
        }

        req.session.user = {
            first_name: req.user.first_name,
            last_name: req.user.last_name,
            age: req.user.age,
            email: req.user.email,
            cartId: req.user.cart._id
        }
        const token = generateToken(req.user)
        res.cookie('jwtCookie', token, {
            maxAge: 43200000,
        })
        res.redirect(`/static/products?info=${req.user.first_name}`) //Redirect
        //res.status(200).send({ payload: req.user })
    } catch (error) {
        logger.error(`[ERROR] - Date: ${new Date().toLocaleTimeString()} - ${error.message}`)
        res.status(500).send({ message: `Failed to login: ${error}` })
    }
}

export const testJWT = async (req, res) => {
    res.status(200).send({ message: req.user })
    //console.log(req.user.user);
    /* req.session.user = {
        first_name: req.user.user.first_name,
        last_name: req.user.user.last_name,
        age: req.user.user.age,
        email: req.user.user.email
    } */
}

export const current = async (req, res) => {
    res.send(req.user)
}

export const github = async (req, res) => {
    res.status(200).send({ payload: req.user })
}

export const githubSession = async (req, res) => {
    req.session.user = req.user
    res.status(200).send({ message: 'Session created' })
}

export const logout = async (req, res) => {
    if (req.session) {
        req.session.destroy()
    }
    res.clearCookie('jwtCookie')
    res.redirect(`/static/login`) //Redirect
}