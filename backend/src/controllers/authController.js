const { User } = require("../models");
const {
  hashPassword,
  comparePassword,
  generateToken,
} = require("../utils/jwt");
const logger = require("../utils/logger");

// Registrar nuevo usuario
const register = async (req, res) => {
  try {
    const { name, email, password, department, employeeId } = req.body;

    // Verificar si el email ya existe
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        error: "El email ya está registrado",
      });
    }

    // Verificar si el employeeId ya existe (si se proporciona)
    if (employeeId) {
      const existingEmployee = await User.findOne({ employeeId });
      if (existingEmployee) {
        return res.status(400).json({
          error: "El ID de empleado ya está registrado",
        });
      }
    }

    // Hashear la contraseña
    const hashedPassword = await hashPassword(password);

    // Crear nuevo usuario
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      department,
      employeeId: employeeId || undefined,
    });

    const savedUser = await newUser.save();

    // Generar token
    const token = generateToken(savedUser._id, savedUser.role);

    // Respuesta sin contraseña
    const userResponse = savedUser.toObject();
    delete userResponse.password;

    logger.info("Usuario registrado exitosamente", {
      userId: savedUser._id,
      email: savedUser.email,
    });

    res.status(201).json({
      message: "Usuario registrado exitosamente",
      user: userResponse,
      token,
    });
  } catch (error) {
    logger.error("Error en registro de usuario:", error);
    res.status(500).json({
      error: "Error interno del servidor",
    });
  }
};

// Iniciar sesión
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Buscar usuario por email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        error: "Credenciales inválidas",
      });
    }

    // Verificar si el usuario está activo
    if (!user.isActive) {
      return res.status(401).json({
        error: "Usuario inactivo. Contacta al administrador",
      });
    }

    // Verificar contraseña
    const isValidPassword = await comparePassword(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        error: "Credenciales inválidas",
      });
    }

    // Actualizar último login
    user.lastLogin = new Date();
    await user.save();

    // Generar token
    const token = generateToken(user._id, user.role);

    // Respuesta sin contraseña
    const userResponse = user.toObject();
    delete userResponse.password;

    logger.info("Usuario inició sesión", {
      userId: user._id,
      email: user.email,
    });

    res.json({
      message: "Inicio de sesión exitoso",
      user: userResponse,
      token,
    });
  } catch (error) {
    logger.error("Error en inicio de sesión:", error);
    res.status(500).json({
      error: "Error interno del servidor",
    });
  }
};

// Obtener perfil del usuario actual
const getProfile = async (req, res) => {
  try {
    // El usuario ya está disponible en req.user por el middleware de auth
    const userResponse = req.user.toObject();
    delete userResponse.password;

    res.json({
      user: userResponse,
    });
  } catch (error) {
    logger.error("Error obteniendo perfil:", error);
    res.status(500).json({
      error: "Error interno del servidor",
    });
  }
};

// Cerrar sesión (básico - solo mensaje)
const logout = async (req, res) => {
  try {
    logger.info("Usuario cerró sesión", {
      userId: req.user._id,
      email: req.user.email,
    });

    res.json({
      message: "Sesión cerrada exitosamente",
    });
  } catch (error) {
    logger.error("Error en cierre de sesión:", error);
    res.status(500).json({
      error: "Error interno del servidor",
    });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  logout,
};
