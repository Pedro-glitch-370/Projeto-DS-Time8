const express = require("express")
const router = express.Router()

router.get("/", (req, res) => {
    res.send("Rota do adm funcionando!")
})

module.exports = router