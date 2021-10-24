const express = require('express');
const router = express.Router();
const {database} = require('../config/helper');

/* OBTENER TODOS LOS PRODUCTOS */
router.get('/', function (req, res) {       
    let page = (req.query.page !== undefined && req.query.page !== 0) ? req.query.page : 1;
    const limit = (req.query.limit !== undefined && req.query.limit !== 0) ? req.query.limit : 10;   
    let startValue;
    let endValue;
    if (page > 0) {
        startValue = (page * limit) - limit;     // 0, 10, 20, 30
        endValue = page * limit;                  // 10, 20, 30, 40
    } else {
        startValue = 0;
        endValue = 10;
    }
    database.table('products as p')
        .join([
            {
                table: "categorias as c",
                on: `c.id_categoria = p.id_cat`
            },
            {
              table:  "  detalles_compo as d",
              on: ` p.detalle_id = d.id_detalles`
            }
        ])
        .withFields(['c.title as categoria',
            'p.title as nombre',
            'p.precio',
            'p.quantity',
            'p.descripcion',
            'p.image',
            'p.imagedes',
            'p.id',
            'p.detalle_id',
            'd.Marca as Marca',
            'd.Modelo',
            'd.Producto',
            'd.MemoriaRAM as Memoria',
            'd.Almacenamiento',
            'd.Pantalla',
            'd.SistemaOperativo as Sistema'

        ])
        .slice(startValue, endValue)
        .sort({id: .1})
        .getAll()
        .then(prods => {
            if (prods.length > 0) {
                res.status(200).json({
                    count: prods.length,
                    products: prods
                });
            } else {
                res.json({message: "No se Encontraron Productos"});
            }
        })
        .catch(err => console.log(err));
});

/* OBTENER ID DE PRODUCTO */
router.get('/:prodId', (req, res) => {
    let productId = req.params.prodId;
    database.table('products as p')
        .join([
            {
                table: "categorias as c",
                on: `c.id_categoria = p.id_cat`
            },
            {
              table:  "  detalles_compo as d",
              on: ` p.detalle_id = d.id_detalles`
            }
        ])
        .withFields(['c.title as categoria',
            'p.title as nombre',
            'p.precio',
            'p.quantity',
            'p.descripcion',
            'p.image',                
            'p.images',
            'p.imagedes',
            'p.id',
            'p.detalle_id',
            'd.Marca as Marca',
            'd.Producto',
            'd.MemoriaRAM as Memoria',
            'd.Almacenamiento',
            'd.Pantalla',
            'd.SistemaOperativo as Sistema'
        ])
        .filter({'p.id': productId})
        .get()
        .then(prod => {
            console.log(prod);
            if (prod) {
                res.status(200).json(prod);
            } else {
                res.json({message: `No se encontraron productos con el id ${productId}`});
            }
        }).catch(err => res.json(err));
});

/* OBTENER TODOS LOS PRODUCTOS EN UNA CATEGORIA */
router.get('/category/:catName', (req, res) => { 
    let page = (req.query.page !== undefined && req.query.page !== 0) ? req.query.page : 1;   
    const limit = (req.query.limit !== undefined && req.query.limit !== 0) ? req.query.limit : 10;   
    let startValue;
    let endValue;
    if (page > 0) {
        startValue = (page * limit) - limit;      // 0, 10, 20, 30
        endValue = page * limit;                  // 10, 20, 30, 40
    } else {
        startValue = 0;
        endValue = 10;
    }

    // Get category title value from param
    const cat_title = req.params.catName;

    database.table('products as p')
        .join([
            {
                table: "categorias as c",
                on: `c.id_categoria = p.id_cat WHERE c.title LIKE '%${cat_title}%'`
            },
            {
              table:  "  detalles_compo as d",
              on: ` p.detalle_id = d.id_detalles`
            }
        ])
        .withFields(['c.title as categoria',
            'p.title as nombre',
            'p.precio',
            'p.quantity',
            'p.descripcion',
            'p.image',
            'p.imagedes',
            'p.id',
            'p.detalle_id',
            'd.Marca as Marca',
            'd.Producto',
            'd.MemoriaRAM as Memoria',
            'd.Almacenamiento',
            'd.Pantalla',
            'd.SistemaOperativo as Sistema'
        ])
        .slice(startValue, endValue)
        .sort({id_categoria : 1})
        .getAll()
        .then(prods => {
            if (prods.length > 0) {
                res.status(200).json({
                    count: prods.length,
                    products: prods
                });
            } else {
                res.json({message: `No se han encontrado productos que coincidan con la categoría ${cat_title}`});
            }
        }).catch(err => res.json(err));

});


module.exports = router;