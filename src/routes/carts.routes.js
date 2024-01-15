import { Router } from "express"
import { passportError, authorization } from "../utils/errorMessages.js"
import * as cartController from "../controllers/cart.controller.js"
import { logger } from "../utils/logger.js"

const cartRouter = Router()

//Get all carts
cartRouter.get('/', cartController.getCarts)

//Get cart by id
cartRouter.get('/:id', cartController.getCart)

//Create new cart
cartRouter.post('/', cartController.postCart)

//Put cart with products array
cartRouter.put('/:cid', passportError('jwt'), authorization(['user', 'premium']), cartController.putCartWithProdsArray)

//Add product to cart
cartRouter.post('/:cid/product/:pid', passportError('jwt'), authorization(['user', 'premium']), cartController.addProductCart)

//Put quantity of products on cart
cartRouter.put('/:cid/product/:pid', passportError('jwt'), authorization(['user', 'premium']), cartController.putProdQty)

//Delete product on cart by id
cartRouter.delete('/:cid/product/:pid', passportError('jwt'), authorization(['user', 'premium']), cartController.deleteProdOnCart)

//Empty cart
cartRouter.delete('/:id', passportError('jwt'), authorization(['user', 'premium']), cartController.emptyCart)

//Checkout - finalize purchase
cartRouter.post('/purchase/:cid', passportError('jwt'), authorization(['user', 'premium']), async (req, res) => {
    try {
        await cartController.purchase(req, res)
    } catch (error) {
        logger.error(`[ERROR] - Date: ${new Date().toLocaleTimeString()} - ${error.message}`)
        res.status(500).send('Error sending purchase confirmation', error)
    }
})


export default cartRouter