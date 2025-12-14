// middleware para autentificação - futuramente, é bom alterar para usar express-session e tokens

// Verifica se o usuário está autenticado (se mandou id e tipo nos headers)
const isAuthenticated = (req, res, next) => {
  const userId = req.headers["x-user-id"];
  const userTipo = req.headers["x-user-tipo"];

  if (!userId || !userTipo) {
    return res.status(401).json({ message: "Usuário não autenticado" });
  }

  // Injeta no req.user para uso nos controllers
  req.user = { id: userId, tipo: userTipo };
  next();
};

// Verifica se o usuário é admin
const isAdmin = (req, res, next) => {
  if (!req.user || req.user.tipo !== "admin") {
    return res.status(403).json({ message: "Acesso restrito a administradores" });
  }
  next();
};

module.exports = { isAuthenticated, isAdmin };
