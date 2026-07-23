const express = require('express');
const validarCorpoRequisicao = require('./intermediarios/validarCorpoRequisicao')
const schemaUsuario = require('./validacoes/schemaUsuario')

const {
    login,
    cadastrarUsuario,
    detalharUsuario,
    detalharPerfilLogado,
    atualizarUsuario
} = require('./controlador/usuario');

const categoria = require('./controlador/categoria');

const { transacao,
    CadastrarTransacao,
    listarTransacao,
    atualizarTransacao,
    excluirTransacao,
    detalharTransacao,
    obterExtradoDeUmaTransacao
} = require('./controlador/transacao');

const verificarUsuarioLogado = require('./intermediarios/autenticacao');

const listarCategorias = require('./controlador/categoria');
const schemaAtualizarUsuario = require('./validacoes/schemaAtualizarUsuario');

const rotas = express();

rotas.get('/', (req, res) => {
    res.json('Tudo Certo')
})

rotas.post('/usuario', validarCorpoRequisicao(schemaUsuario) , cadastrarUsuario)  
rotas.post('/login', login)  
rotas.use(verificarUsuarioLogado) 

rotas.get('/perfil', detalharPerfilLogado)  
rotas.get('/usuario/:id', detalharUsuario)  
rotas.put('/usuario', validarCorpoRequisicao(schemaAtualizarUsuario) ,atualizarUsuario)  
rotas.get('/categoria', listarCategorias) 
rotas.post('/transacao', CadastrarTransacao) 
rotas.get('/transacao', listarTransacao)  
rotas.get('/transacao/extrato',obterExtradoDeUmaTransacao) 
rotas.get('/transacao/:id',detalharTransacao) 
rotas.put('/transacao/:id',atualizarTransacao)  
rotas.delete('/transacao/:id', excluirTransacao)  


module.exports = rotas