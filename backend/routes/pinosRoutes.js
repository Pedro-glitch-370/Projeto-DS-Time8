const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const Pino = require('../models/PinoModel')

const path = require('path')
const fs = require('fs')

// tem que fazer as rotas, principalmente a de deletar e criar pinos (obs: tá sendo feita falta conseguir executar, ele ainda não salva os pinos).
// tem que criar outra depois de atualizar.
// comentar o codigo.

// ================================================================
// ROTA QUE RETORNA TODOS OS PINOS
router.get('/', async (req, res) => {
    try {
        const pinos = await Pino.find();
        console.log('📌 Alguém solicitou os pinos (JSON)!');
        res.json(pinos);
    } catch (err) {
        res.status(500).json({ error: 'Erro ao buscar pinos: ' + err.message });
    }
});


// ================================================================
// ROTA PARA RENDERIZAR HTML
router.get('/adicionar', (req, res) => {
    try {
        const htmlPath = path.join(__dirname, '../test/adicionarpinos.html')
        const htmlContent = fs.readFileSync(htmlPath, 'utf8')
        res.send(htmlContent)
    } catch (err) {
        console.error('❌ Erro ao carregar HTML:', err)
        res.status(500).send('Erro ao carregar página')
    }
})

// ROTA PARA PROCESSAR O FORMULÁRIO (POST) - CORRIGIDA
router.post('/adicionar', async (req, res) => {
    try {
        const { nome, latitude, longitude, msg } = req.body;
        
        console.log('Dados recebidos:', { nome, latitude, longitude, msg });
        
        const novoPino = new Pino({
            nome: nome,
            localizacao: {
                type: 'Point',
                coordinates: [parseFloat(longitude), parseFloat(latitude)] // [lng, lat]
            },
            msg: msg
        });

        const pinoSalvo = await novoPino.save();
        console.log("✅ Pino salvo no banco de dados:", pinoSalvo._id);
        
        res.redirect('/api/pinos/adicionar?success=true');
        
    } catch (err) {
        console.error('❌ Erro ao salvar pino:', err);
        res.status(500).send('Erro ao salvar pino: ' + err.message);
    }
});

// ================================================================
// Rota para deletar

// Rota para atualizar

module.exports = router