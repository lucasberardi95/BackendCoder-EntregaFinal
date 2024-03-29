import cartModel from "../models/carts.models.js"
import productModel from "../models/products.models.js"
import ticketModel from "../models/ticket.models.js"
import { userModel } from "../models/users.models.js"
import mongoose from "mongoose"
import { logger } from "../utils/logger.js"
import { sendPurchaseConfirmationEmail } from "../config/nodemailer.js"

export const getCarts = async (req, res) => {
    try {
        const carts = await cartModel.find()
        res.status(200).send({ result: 'OK', message: carts })
    } catch (error) {
        logger.error(`[ERROR] - Date: ${new Date().toLocaleTimeString()} - ${error.message}`)
        res.status(500).send({ error: `Error displaying carts:  ${error}` })

    }
}

export const getCart = async (req, res) => {
    const { id } = req.params
    try {
        const cart = await cartModel.findById(id)
        res.status(200).send({ result: 'OK', message: cart })
    } catch (error) {
        logger.error(`[ERROR] - Date: ${new Date().toLocaleTimeString()} - ${error.message}`)
        res.status(404).send({ error: `Id cart not found:  ${error}` })
    }
}

export const postCart = async (req, res) => {
    const response = await cartModel.create(req.body)
    try {
        res.status(201).send({ result: 'Cart created succesfully', message: response })
    } catch (error) {
        logger.error(`[ERROR] - Date: ${new Date().toLocaleTimeString()} - ${error.message}`)
        res.status(400).send({ error: `Cart already exist: ${error}` })
    }
}

export const putCartWithProdsArray = async (req, res) => {
    const { cid } = req.params
    const arrayProds = req.body
    try {
        const cart = await cartModel.findById(cid)
        if (!cart) {
            res.status(404).send({ error: `Cart not found: ${error}` })
            return
        }
        arrayProds.forEach(async (productData) => {
            const { id_prod, quantity } = productData
            const existingProduct = cart.products.find((product) =>
                product.id_prod.equals(id_prod)
            )
            existingProduct
                ? (existingProduct.quantity += quantity)
                : cart.products.push({ id_prod, quantity })
        })
        await cart.save()
        res.status(200).send({ result: 'OK', cart })
    } catch (error) {
        logger.error(`[ERROR] - Date: ${new Date().toLocaleTimeString()} - ${error.message}`)
        res.status(500).send({ error: `Error updating cart: ${error}` })
    }
}

export const addProductCart = async (req, res) => {
    const { cid, pid } = req.params
    const { quantity = 1 } = req.body
    try {
        const cart = await cartModel.findById(cid)
        if (!cart) {
            res.status(404).send({ result: `Id cart not found` })
            return
        }
        let existingProduct = cart.products.find((prod) =>
            prod.id_prod.equals(pid)
        )
        if (!existingProduct) {
            existingProduct = { id_prod: pid, quantity: quantity }
            cart.products.push(existingProduct)
        } else {
            existingProduct.quantity += quantity
        }
        await cart.save()
        res.status(204).send() //204 para no redirigir y que la vista funcione correctamente
    } catch (error) {
        logger.error(`[ERROR] - Date: ${new Date().toLocaleTimeString()} - ${error.message}`)
        res.status(400).send({ error: `Error adding product: ${error}` })
    }
}

export const putProdQty = async (req, res) => {
    const { cid, pid } = req.params
    const { quantity } = req.body
    try {
        const cart = await cartModel.findById(cid)
        if (!cart) {
            res.status(404).send({ result: `Id cart not found` })
            return
        }
        const existingProduct = cart.products.find((prod) =>
            prod.id_prod.equals(pid)
        )
        if (!existingProduct) {
            res.status(404).send({ result: `Product not found in cart` })
            return
        }
        existingProduct.quantity += quantity
        await cart.save()
        res.status(200).send({ result: 'OK', cart })
    } catch (error) {
        logger.error(`[ERROR] - Date: ${new Date().toLocaleTimeString()} - ${error.message}`)
        res.status(400).send({ error: `Error updating product qty: ${error}` })
    }
}

export const deleteProdOnCart = async (req, res) => {
    const { cid, pid } = req.params
    try {
        const cart = await cartModel.findById(cid)
        if (cart) {
            const productIndex = cart.products.findIndex(prod => prod.id_prod.equals(new mongoose.Types.ObjectId(pid)))
            let deletedProduct
            if (productIndex !== -1) {
                deletedProduct = cart.products[productIndex]
                cart.products.splice(productIndex, 1)
            } else {
                res.status(404).send({ result: 'Id Product Not Found', message: cart })
            }
            await cart.save()
            res.status(200).send({ result: 'OK', message: deletedProduct })
        } else {
            res.status(404).send({ result: 'Cart Not Found', message: cart })
        }
    } catch (error) {
        logger.error(`[ERROR] - Date: ${new Date().toLocaleTimeString()} - ${error.message}`)
        res.status(400).send({ error: `Error deleting product: ${error}` })
    }
}

export const emptyCart = async (req, res) => {
    const { id } = req.params
    try {
        const cart = await cartModel.findById(id)
        if (!cart) {
            res.status(404).send({ result: 'Cart not found', message: cart })
        }
        cart.products = []
        await cart.save()
        res.status(200).send({ result: 'OK', message: cart })
    } catch (error) {
        logger.error(`[ERROR] - Date: ${new Date().toLocaleTimeString()} - ${error.message}`)
        res.status(400).send({ error: `Error empitying cart: ${cart}` })
    }
}

export const purchase = async (req, res) => {
    const { cid } = req.params
    try {
        const cart = await cartModel.findById(cid)
        const products = await productModel.find()
        const user = await userModel.find({ cart: cart._id })
        const purchaserEmail = user[0].email
        const userRole = req.user.role || req.user.user.role

        if (!cart) {
            return res.status(404).send({ result: 'Cart not found', message: cart })
        }

        const promises = cart.products.map(async (item) => {
            const product = await productModel.findById(item.id_prod)
            if (!product) {
                throw new Error('Product not found')
            }

            if (product.stock >= item.quantity) {
                product.stock -= item.quantity
                await product.save()

                // Discount for user "premium"
                let discount = 1.0;
                if (userRole === 'premium') {
                    discount = 0.8
                }

                return {
                    productId: product._id,
                    quantity: item.quantity,
                    price: product.price * discount,
                }
            }
            return null // Returns null if the product does not have enough stock
        })

        const results = await Promise.all(promises)
        const prodsToPurchase = results.filter((result) => result !== null)
        console.log(`Products to purchase: ${JSON.stringify(prodsToPurchase)}`)

        if (prodsToPurchase.length === 0) {
            return res.status(400).send({ result: 'No products to purchase' })
        }

        const purchase = {
            items: prodsToPurchase,
            total: prodsToPurchase.reduce((acc, product) => {
                return acc + product.price * product.quantity
            }, 0),
        }

        const ticket = {
            amount: purchase.total,
            purchaser: purchaserEmail
        }
        const createdTicket = await ticketModel.create(ticket)
        await sendPurchaseConfirmationEmail(purchaserEmail, createdTicket)
        console.log(`Successful purchase, your total to pay is: $${ticket.amount}`)
        await cartModel.findByIdAndUpdate(cid, { products: [] })
        return res.status(200).send({ message: "Successful purchase" })
    } catch (error) {
        logger.error(`[ERROR] - Date: ${new Date().toLocaleTimeString()} - ${error.message}`)
        return res.status(500).send({ error: `Error processing the purchase: ${error.message}` })
    }
}