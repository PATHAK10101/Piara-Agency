const express = require("express");
const mongoose = require("mongoose");

const port = 3000;

app.get("/", ()=>{
    console.log("Ruuning Successfully")
})

app.listen(port , ()=>{
    console.log(`Running on port ${port}`)
})