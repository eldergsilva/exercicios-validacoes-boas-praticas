const pool = require('../conexao')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const senhaJwt = require('../senhaJwt')

const cadastrarUsuario = async (req, res) => {
	const { nome, email, senha } = req.body
	try {
		const emailExistente = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);

		if (emailExistente.rowCount > 0) {
			return res.status(400).json({ mensagem: 'O e-mail informado já está sendo utilizado por outro usuário.' });
		}
		const senhaCriptografada = await bcrypt.hash(senha, 10)

		const novoUsuario = await pool.query(
			'insert into usuarios (nome, email, senha) values ($1, $2, $3) returning *',
			[nome, email, senhaCriptografada]
		)

		return res.status(201).json(novoUsuario.rows[0])
	} catch (error) {
		console.log(error)
		return res.status(500).json({ mensagem: 'Erro interno do servidor' })
	}
}

const login = async (req, res) => {
	const { email, senha } = req.body

	try {
		const usuario = await pool.query(
			'select * from usuarios where email = $1',
			[email]
		)

		if (usuario.rowCount < 1) {
			return res.status(404).json({ mensagem: 'Email ou senha invalida' })
		}

		const senhaValida = await bcrypt.compare(senha, usuario.rows[0].senha)

		if (!senhaValida) {
			return res.status(400).json({ mensagem: 'Email ou senha invalida' })
		}

		const token = jwt.sign({ id: usuario.rows[0].id }, senhaJwt, {
			expiresIn: '8h',
		})

		const { senha: _, ...usuarioLogado } = usuario.rows[0]

		return res.json({ usuario: usuarioLogado, token })
	} catch (error) {
		return res.status(500).json({ mensagem: 'Erro interno do servidor' })
	}
}

const detalharPerfilLogado = async (req, res) => {
	return res.json(req.usuario)
}

const detalharUsuario = async (req, res) => {
	const { id } = req.params

	try {
		const { rows, rowCount } = await pool.query(
			'select * from usuarios where id = $1',
			[id]
		)

		if (rowCount < 1) {
			return res.status(404).json({ mensagem: 'Usuario não encontrado' })
		}
		return res.json(rows[0])
	} catch (error) {
		return res.status(500).json('Erro interno do servidor')
	}
}

const atualizarUsuario = async (req, res) => {
	const { nome, email, senha } = req.body
	const { id } = req.usuario

	const camposObrigatorios = {
		nome: 'Campo nome é obrigatório!',
		email: 'Campo email é obrigatório!',
		senha: 'Campo senha é obrigatório!'
	}
	for (let campo in camposObrigatorios) {
		if (!req.body[campo]) {
			return res.status(400).json({ mensagem: camposObrigatorios[campo] });
		}
	}

	try {
		const emailExiste = await pool.query('select * from usuarios where email = $1', [email])

		if (emailExiste.rowCount > 0) {
			return res.status(404).json({ mensagem: "O e-mail informado já está sendo utilizado por outro usuário." })
		}

		const senhaCriptografada = await bcrypt.hash(senha, 10)

		const usuarioAtualizado = await pool.query(
			'update usuarios set nome = $1 , email = $2, senha = $3 where id = $4', [nome, email, senhaCriptografada, id]
		)

		return res.status(204).json()

	} catch (error) {
		// console.log(error)
		return res.status(500).json({ mensagem: 'Erro interno do servidor' })
	}
}



module.exports = {
	cadastrarUsuario,
	login,
	detalharPerfilLogado,
	detalharUsuario,
	atualizarUsuario
}
