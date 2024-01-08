import { logger } from "../utils/logger.js"
import { userModel } from "../models/users.models.js"
import cartModel from "../models/carts.models.js"
import { sendAccountDeletionEmail } from "../config/nodemailer.js"

export const getUsers = async (req, res) => {
    try {
        const users = await userModel.find()
        res.status(200).send({ result: 'OK', message: users })
    } catch (error) {
        logger.error(`[ERROR] - Date: ${new Date().toLocaleTimeString()} - ${error.message}`)
        res.status(500).send({ error: `Error displaying users:  ${error}` })

    }
}

export const deleteUser = async (req, res) => {
    const { id } = req.params
    try {
        const user = await userModel.findOneAndDelete({ _id: id })
        if (!user) {
            return res.status(404).send('User id not found')
        }
        //Deleting his/her cart
        const cartId = user.cart
        if (cartId) {
            await cartModel.findByIdAndDelete(cartId)
            logger.info('Associated cart successfully deleted')
        }
        return res.status(200).send('User deleted succesfully')
    } catch (error) {
        logger.error(`[ERROR] - Date: ${new Date().toLocaleTimeString()} - ${error.message}`)
        res.status(500).send({ message: `Error deleting user: ${error}` })
    }
}

export const deleteInactiveUsers = async (req, res) => {
    try {
        const inactiveUsers = await userModel.find({
            last_connection: { $lt: new Date(Date.now() - 48 * 60 * 60 * 1000 ) }
        })
        if (inactiveUsers.length > 0) {
            //Get cartId associated with inactive users
            const cartIds = inactiveUsers.map(user => user.cart)
            //Delete associated carts
            await cartModel.deleteMany({ _id: { $in: cartIds } })
            //Delete inactive users
            await userModel.deleteMany({ _id: { $in: inactiveUsers.map(user => user._id) } })
            //Send notification mail
            await Promise.all(inactiveUsers.map(async (user) => {
                const userEmail = user.email
                await sendAccountDeletionEmail(userEmail)
            }))
            return res.status(200).send('Inactive users and their carts deleted succesfully')
        } else {
            return res.status(404).send('No inactive users found')
        }
    } catch (error) {
        logger.error(`[ERROR] - Date: ${new Date().toLocaleTimeString()} - ${error.message}`)
        res.status(500).send({ message: `Error deleting inactive users: ${error}` })
    }
}