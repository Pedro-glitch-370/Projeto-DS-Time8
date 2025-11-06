// config/database.js
const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/RPG';
        
        const connection = await mongoose.connect(MONGODB_URI);
        
        console.log('✅ Conectado ao MongoDB:', connection.connection.name);
        console.log('📍 Host:', connection.connection.host);
        console.log('📍 Porta:', connection.connection.port);
        
        return connection;
        
    } catch (error) {
        console.error('❌ Erro ao conectar com MongoDB:', error.message);
        process.exit(1);
    }
};

/**
 * Fecha a conexão com o MongoDB
 * @returns {Promise}
 */
const disconnectDB = async () => {
    try {
        await mongoose.connection.close();
        console.log('🔌 Conexão com MongoDB fechada');
    } catch (error) {
        console.error('❌ Erro ao fechar conexão:', error.message);
    }
};

/**
 * Verifica o status da conexão
 * @returns {Object} Status da conexão
 */
const getDBStatus = () => {
    return {
        connected: mongoose.connection.readyState === 1,
        readyState: mongoose.connection.readyState,
        host: mongoose.connection.host,
        port: mongoose.connection.port,
        name: mongoose.connection.name
    };
};

// Event listeners para monitorar a conexão
mongoose.connection.on('connected', () => {
    console.log('🟢 Mongoose conectado ao MongoDB');
});

mongoose.connection.on('error', (err) => {
    console.error('🔴 Erro na conexão do Mongoose:', err);
});

mongoose.connection.on('disconnected', () => {
    console.log('🟡 Mongoose desconectado do MongoDB');
});

// Exporta as funções
module.exports = {
    connectDB,
    disconnectDB,
    getDBStatus,
    mongoose // Exporta o mongoose também, caso precise em outros lugares
};