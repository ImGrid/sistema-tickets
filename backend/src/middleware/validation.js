const Joi = require("joi");

// Schema de validación para registro
const registerSchema = Joi.object({
  name: Joi.string().trim().min(2).max(50).required().messages({
    "string.empty": "El nombre es obligatorio",
    "string.min": "El nombre debe tener al menos 2 caracteres",
    "string.max": "El nombre no puede tener más de 50 caracteres",
  }),

  email: Joi.string().email().lowercase().required().messages({
    "string.empty": "El email es obligatorio",
    "string.email": "El email debe tener un formato válido",
  }),

  password: Joi.string().min(6).required().messages({
    "string.empty": "La contraseña es obligatoria",
    "string.min": "La contraseña debe tener al menos 6 caracteres",
  }),

  department: Joi.string().trim().required().messages({
    "string.empty": "El departamento es obligatorio",
  }),

  employeeId: Joi.string().trim().optional().allow(""),
});

// Schema de validación para login
const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.empty": "El email es obligatorio",
    "string.email": "El email debe tener un formato válido",
  }),

  password: Joi.string().required().messages({
    "string.empty": "La contraseña es obligatoria",
  }),
});

// Función para validar datos
const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false, // Mostrar todos los errores
      stripUnknown: true, // Remover campos no definidos en el schema
    });

    if (error) {
      const errors = error.details.map((detail) => ({
        field: detail.path.join("."),
        message: detail.message,
      }));

      return res.status(400).json({
        error: "Datos de entrada inválidos",
        details: errors,
      });
    }

    // Reemplazar req.body con los datos validados
    req.body = value;
    next();
  };
};

module.exports = {
  validateRegister: validate(registerSchema),
  validateLogin: validate(loginSchema),
};
