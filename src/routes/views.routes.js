import { Router } from "express";
import productModel from '../models/products.models.js'
import cartModel from "../models/carts.models.js";

const viewRouter = Router()

viewRouter.get('/static/chat', (req, res) => {
    res.render('chat', {
        rutaCSS: 'chat',
        rutaJS: 'chat',
    })
})

viewRouter.get('/static/products', async (req, res) =>{
    const products = await productModel.find().lean()
    const info = req.query.info
    const cartId = req.session.user.cartId
    res.render('products', {
        rutaCSS: 'products',
        rutaJS: 'products',
        products,
        info,
        cartId: cartId
    })
})

viewRouter.get('/static/myCart', async (req, res) => {
    const userCart = await cartModel
    .findById(req.user.cart)
    .populate({
        path: 'products.id_prod',
        model: 'products'
    })
    .lean()
    const cartId = req.session.user.cartId
    res.render('myCart', {
        rutaCSS: 'myCart',
        rutaJS: 'myCart',
        myCart: userCart,
        cartId: cartId
    })
})

viewRouter.get('/static/register', (req, res) =>{
    res.render('register', {
        rutaCSS: 'register',
        rutaJS: 'register',
    })
})

viewRouter.get('/static/login', (req, res) =>{
    res.render('login', {
        rutaCSS: 'login',
        rutaJS: 'login',
    })
})

viewRouter.get('/static/logout', (req, res) =>{
    res.render('logout', {
        rutaCSS: 'logout',
        rutaJS: 'logout',
    })
})

export default viewRouter