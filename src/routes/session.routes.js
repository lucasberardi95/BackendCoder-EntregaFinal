import { Router } from "express"
import passport from 'passport'
import { passportError, authorization } from "../utils/errorMessages.js"
import * as sessionController from "../controllers/session.controller.js"
import CustomError from "../services/Errors/CustomError.js"
import { EErrors } from "../services/errors/enums.js"
import { generateUserErrorInfo } from "../services/errors/info.js"

const sessionRouter = Router()

sessionRouter.post('/register', (req, res, next) => {
    const { first_name, last_name, email, password, age } = req.body
    try {
        if (!last_name || !first_name || !email || !password || !age) {
            CustomError.createError({
                name: 'Error creating user',
                cause: generateUserErrorInfo({ first_name, last_name, email, password, age }),
                message: 'All fields must be completed',
                code: EErrors.USER_ERROR
            })
        }
        next()
    } catch (error) {
        next(error)
    }
}, passport.authenticate('register'), sessionController.postUser)

sessionRouter.post('/login', passport.authenticate('login'), sessionController.login)

sessionRouter.get('/testJWT', passport.authenticate('jwt', {session: true}), sessionController.testJWT)

sessionRouter.get('/current', passportError('jwt'), authorization(['user', 'admin']), sessionController.current)

sessionRouter.get('/github', passport.authenticate('github', { scope: ['user:email'] }), sessionController.github)

sessionRouter.get('/githubSession', passport.authenticate('github'), sessionController.githubSession)

sessionRouter.get('/logout', sessionController.logout)

export default sessionRouter