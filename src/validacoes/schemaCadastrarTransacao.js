const joi = require('joi')

const schemaCadastrarTransacao = joi.object({
  tipo: joi.string().valid('entrada', 'saida').required().messages({
    'any.only': 'O campo tipo deve ser "entrada" ou "saida"',
    'any.required': 'O campo tipo é obrigatório',
    'string.empty': 'O campo tipo é obrigatório'
  }),

  descricao: joi.string().trim().required().messages({
    'any.required': 'O campo descricao é obrigatório',
    'string.empty': 'O campo descricao é obrigatório'
  }),

  valor: joi.number().positive().required().messages({
    'number.base': 'O campo valor deve ser um número',  
    'number.positive': 'O campo valor deve ser um número positivo',
    'any.required': 'O campo valor é obrigatório'
  }),

  data: joi.date().iso().required().messages({
    'any.required': 'O campo data é obrigatório'
  }),

  categoria_id: joi.number().integer().positive().required().messages({
    'number.base': 'O campo categoria_id deve ser um número',
    'number.integer': 'O campo categoria_id deve ser um número inteiro',
    'number.positive': 'O campo categoria_id deve ser um ID válido',
    'any.required': 'O campo categoria_id é obrigatório'
  })
})



module.exports = schemaCadastrarTransacao