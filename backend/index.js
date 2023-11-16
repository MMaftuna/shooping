import express, { json, response } from 'express'
import jwt from 'jsonwebtoken'
import cors from 'cors'
import { set, connect, Schema, model } from 'mongoose'
import 'dotenv/config'
import Stripe from 'stripe'
import bcrypt, { hash } from 'bcrypt'
import cookieParser from 'cookie-parser'
const app = express()
app.use(cors({
  origin:["http://localhost:3000"],
  methods:["GET", "POST"],
credentials:true}))
app.use(json({ limit: '10mb' }))
app.use(cookieParser())

const PORT = process.env.PORT || 8989

//mongodb connection
set('strictQuery', false)
connect(process.env.MONGODB_URL)
  .then(() => console.log('Connect to Databse'))
  .catch((err) => console.log(err))

//schema
const userSchema = Schema({
  firstName: String,
  lastName: String,
  email: {
    type: String,
    unique: true,
  },
  password: String,
  confirmPassword: String,
  image: String,
})

//
const userModel = model('user', userSchema)

//api
app.get('/', (req, res) => {
  res.send('Server is running')
})

//sign up
app.post('/signup', async (req, res) => {

  const { firstName, lastName, email, confirmPassword, password } = req.body
  bcrypt
    .hash(password, 10)
    .then((hash) => {
      userModel
        .create({
          firstName,
          lastName,
          email,
          confirmPassword: hash,
          password: hash,
        })
        .then((user) => res.json(user))
        .catch((err) => res.json(err))
    })
    .catch((err) => console.log(err.message))
})

//api login
app.post('/login', (req, res) => {
  // console.log(req.body);
  //   const { email } = req.body;
  //   userModel.findOne({ email: email }, (err, result) => {
  //     if (result) {
  //       const dataSend = {
  //         _id: result._id,
  //         firstName: result.firstName,
  //         lastName: result.lastName,
  //         email: result.email,
  //         image: result.image,
  //       };
  //       console.log(dataSend);
  //       res.send({
  //         message: "Login is successfully",
  //         alert: true,
  //         data: dataSend,
  //       });
  //     } else {
  //       res.send({
  //         message: "Email is not available, please sign up",
  //         alert: false,
  //       });
  //     }
  //   });
  // });

  //product section
  const { email, password } = req.body
  userModel.findOne({ email: email })
  .then(user => {
    if (user) {
      bcrypt.compare(password, user.password, (err, response) => {
        if (response) {
          const token = jwt.sign({ email: user.email }, 'jwt-secret-key', {
            expiresIn: '1d' })
            res.cookie('token', token)
            res.json('muvaffaqiyat✅')
         
      
         
        }else{
          res.json("parol noto'g'ri❌")
        }
      })
    } else {
      res.json('hech nima mavjud emas')
    }
  })
})
const schemaProduct = Schema({
  name: String,
  category: String,
  image: String,
  price: String,
  description: String,
})
const productModel = model('product', schemaProduct)

//save product va data
//api
app.post('/uploadProduct', async (req, res) => {
  // console.log(req.body)
  const data = await productModel(req.body)
  const datasave = await data.save()
  res.send({ message: 'Upload successfully' })
})

//
app.get('/product', async (req, res) => {
  const data = await productModel.find({})
  res.send(JSON.stringify(data))
})

/*****payment getWay */
// console.log(process.env.STRIPE_SECRET_KEY)

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

app.post('/create-checkout-session', async (req, res) => {
  try {
    const params = {
      submit_type: 'pay',
      mode: 'payment',
      payment_method_types: ['card'],
      billing_address_collection: 'auto',
      shipping_options: [{ shipping_rate: 'shr_1N0qDnSAq8kJSdzMvlVkJdua' }],

      line_items: req.body.map((item) => {
        return {
          price_data: {
            currency: 'inr',
            product_data: {
              name: item.name,
              // images : [item.image]
            },
            unit_amount: item.price * 100,
          },
          adjustable_quantity: {
            enabled: true,
            minimum: 1,
          },
          quantity: item.qty,
        }
      }),

      success_url: `${process.env.FRONTEND_URL}/success`,
      cancel_url: `${process.env.FRONTEND_URL}/cancel`,
    }

    const session = await stripe.checkout.sessions.create(params)
    // console.log(session)
    res.status(200).json(session.id)
  } catch (err) {
    res.status(err.statusCode || 500).json(err.message)
  }
})

//server is ruuning
app.listen(PORT, () => console.log('server is running at port : ' + PORT))
