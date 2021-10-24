const express = require('express');
const router = express.Router();
const {database} = require('../config/helper');
const crypto = require('crypto');



router.get('/', (req, res) => {
  database.table('orders_details as od')
      .join([
          {
          table: 'orders as o',
            on: 'o.id = od.id_order '
      },
        {
          table: 'products as p',
          on: 'p.id = od.id_product'
        },

        {
          table: 'users as u',
          on: 'u.id = o.id_user'

        }
      ])
      .withFields(['o.id','p.title as nombre','p.descripcion','p.precio','u.username'])

      .getAll()
      .then(orders => {
        if (orders.length > 0) {
          res.json(orders);
        } else {
          res.json({message: "No orders found"});
        }

      }).catch(err => res.json(err));
});

router.get('/:id', async (req, res) => {
  let orderId = req.params.id;
  console.log(orderId);

  database.table('orders_details as od')
      .join([
        {
          table: 'orders as o',
          on: 'o.id = od.id_order'
        },
        {
          table: 'products as p',
          on: 'p.id = od.id_product'
        },
        {
          table: 'users as u',
          on: 'u.id = o.id_user'
        }
      ])
      .withFields(['o.id', 'p.title as nombre', 'p.descripcion', 'p.precio', 'p.image', 'od.quantity as CantidadOrdenada'])
      .filter({'o.id': orderId})
      .getAll()
      .then(orders => {
        console.log(orders);
        if (orders.length > 0) {
          res.json(orders);
        } else {
          res.json({message: "No se Encontraron Pedidos"});
        }

      }).catch(err => res.json(err));
});

// Place New Order
router.post('/new', async (req, res) => {
  // let userId = req.body.userId;
  // let data = JSON.parse(req.body);
  let {userId, products} = req.body;
  console.log(userId);
  console.log(products);

   if (userId !== null && userId > 0) {
      database.table('orders')
          .insert({
              id_user: userId
          }).then((newOrderId) => {

          if (newOrderId > 0) {
              products.forEach(async (p) => {

                      let data = await database.table('products').filter({id: p.id}).withFields(['quantity']).get();



                  let inCart = parseInt(p.incart);

                  // Deduct the number of pieces ordered from the quantity in database

                  if (data.quantity > 0) {
                      data.quantity = data.quantity - inCart;

                      if (data.quantity < 0) {
                          data.quantity = 0;
                      }

                  } else {
                      data.quantity = 0;
                  }

                  // Insert order details w.r.t the newly created order Id
                  database.table('orders_details')
                      .insert({
                          id_order: newOrderId,
                          id_product: p.id,
                          quantity: inCart
                      }).then(newId => {
                      database.table('products')
                          .filter({id: p.id})
                          .update({
                              quantity: data.quantity
                          }).then(successNum => {
                      }).catch(err => console.log(err));
                  }).catch(err => console.log(err));
              });

          } else {
              res.json({message: 'New order failed while adding order details', success: false});
          }
          res.json({
              message: `Order successfully placed with order id ${newOrderId}`,
              success: true,
              id_order: newOrderId,
              products: products
          })
      }).catch(err => res.json(err));
  }

  else {
      res.json({message: 'New order failed', success: false});
  }

});

// Payment Gateway
router.post('/payment', (req, res) => {
  setTimeout(() => {
      res.status(200).json({success: true});
  }, 3000)
});






module.exports = router;
