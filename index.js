import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
// import db from "./dbConfig.js";

import { join, dirname } from 'path'
import { Low, JSONFile } from 'lowdb'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url));

const file = join(__dirname, 'db.json')
const adapter = new JSONFile(file)
const db = new Low(adapter)

await db.read()


db.data ||= {
    orders : [],
    users : [],
    orderValidation : []
}

await db.write()

const app = express();

app.get("/", (req, res) => {
    res.send({
        message: "Hello World",
        success: true,
    });
});


/**
 * @api {post} /api/v1/orders Get all orders
 * @apiName GetAllOrders
 * @apiGroup Orders
 * 
 */
app.get("/api/orders", (req, res) => {
    const allOrders = db.data.orders;
    return res.send({
        message: "All orders",
        success: true,
        data: allOrders
    });
}); 

/**
 * @api {get} /api/orders/:id Get order by id
 */
app.get("/api/orders/:id", (req, res) => {
    const order = db.data.orders.find(order => order.orderId === req.params.id);
    if(!order) {
        return res.send({
            message: "Order not found",
            success: false,
            data: null
        });
    }
    return res.send({
        message: "Order by id",
        success: true,
        data: order
    });
}); 

/**
 * @api {get} /orders Create an order with random ID
 * @api {}
 * 
 */
app.post("/api/orders", (req, res) => {
    //create random orderId
    const orderId = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 10);
    
    if (!orderId) {
        res.status(400).send({
            message: "Order Id is required",
            success: false,
        });
    }

    const documentList = Array(15)
        .fill(0)
        .map((_, index) => {
            return `Document ${index + 1}`;
        });

    const randomNumber = Math.floor(Math.random() * 12) + 1;

    const randomDocuments = documentList
        .sort(() => 0.5 - Math.random())
        .slice(0, randomNumber);

    const order = {
        orderId,
        documents: randomDocuments,
    };

    db.data.orders.push(order);
    db.write();

    res.send({
        message: "Successfully fetched documents",
        success: true,
        orderId,
        documents: randomDocuments,
    });
});

app.get("/api/orders/validate", (req, res) => {
    const orderId = req.query.orderId;
    if (!orderId) {
        res.status(400).send({
            message: "Order Id is required",
            success: false,
        });
    }

    const { receivedDocuments } = req.body;
    if (!receivedDocuments) {
        res.status(400).send({
            message: "Received documents is required",
            success: false,
        });
    }
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, () => {
    console.log("Server started on port 3000");
});
