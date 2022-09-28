const express = require("express");
const bodyParser = require("body-parser");
const anubisPingger = require('sitepinger')

function server(anubis, store){
    const app = express();
    const host = '0.0.0.0'
    const port = process.env.PORT || 3000;
    app.use(bodyParser.json({ limit: "50mb" }));
    
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(express.static('views'));
    
    const web = require("./router/api")(anubis, store)
    app.use("/", web);
    
    anubisPingger(global.pingWeb)
    app.listen(port, host);
}

module.exports = server