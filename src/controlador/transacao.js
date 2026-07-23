const pool = require('../conexao')
const { validarCamposObrigatorios } = require('../intermediarios/validarCorpoRequisicao')

const CadastrarTransacao = async (req, res) => {
	const { tipo, descricao, valor, data, categoria_id } = req.body;
	const usuario_id = req.usuario.id;

	const camposObrigatorios = ['tipo', 'descricao', 'valor', 'data', 'categoria_id'];

	try {
		validarCamposObrigatorios(req.body, camposObrigatorios)

		const categoriaExistente = await pool.query('SELECT * from categorias WHERE id = $1', [categoria_id]);

		if (categoriaExistente.rowCount === 0) {
			return res.status(400).json({ mensagem: 'A categoria especificada não existe.' });
		}

		const novaTransacao = await pool.query(
			'INSERT INTO transacoes (tipo, descricao, valor, data, categoria_id, usuario_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
			[tipo, descricao, valor, data, categoria_id, usuario_id]
		);

		const { rows: categoria } = await pool.query('select descricao FROM categorias WHERE id = $1', [categoria_id]);

		const novaTransacaoJson = {
			id: novaTransacao.rows[0].id,
			tipo: novaTransacao.rows[0].tipo,
			descricao: novaTransacao.rows[0].descricao,
			valor: novaTransacao.rows[0].valor,
			data: novaTransacao.rows[0].data,
			usuario_id: novaTransacao.rows[0].usuario_id,
			categoria_id: novaTransacao.rows[0].categoria_id,
			categoria_nome: categoria[0].descricao
		};

		return res.status(201).json(novaTransacaoJson);

	} catch (error) {
		console.error(error);
		return res.status(error.status || 500).json({ mensagem: error.message || 'Erro interno do servidor' });
	}
}


const listarTransacao = async (req, res) => {
	const usuario_id = req.usuario.id;
	try {
		const { rows: transacao } = await pool.query('select * from transacoes where  usuario_id = $1', [usuario_id]);
		return res.json(transacao);
	} catch (error) {
		console.error(error);
		return res.status(500).json({ mensagem: 'Erro interno do servidor' });
	}
}

const atualizarTransacao = async (req, res) => {
	const { tipo, descricao, valor, data, categoria_id } = req.body;
	const { id } = req.params;

	const camposObrigatorios = ['tipo', 'descricao', 'valor', 'data', 'categoria_id'];

	try {
		validarCamposObrigatorios(req.body, camposObrigatorios)

		if (tipo !== 'entrada' && tipo !== 'saida') {
			throw { status: 400, message: 'Campo tipo está incorreto' };
		}

		const transacaoExistente = await pool.query('SELECT * from transacoes WHERE id = $1', [id]);

		if (transacaoExistente.rowCount === 0) {
			return res.status(400).json({ mensagem: 'A transação especificada não existe.' });
		}
		const categoriaExistente = await pool.query('SELECT * from categorias WHERE id = $1', [categoria_id]);

		if (categoriaExistente.rowCount === 0) {
			return res.status(400).json({ mensagem: 'A categoria especificada não existe.' });
		}

		const transacaoAtualizada = await pool.query(
			'UPDATE transacoes SET tipo = $1, descricao = $2, valor = $3, data = $4, categoria_id = $5 WHERE id = $6 RETURNING *', [tipo, descricao, valor, data, categoria_id, id]
		)
		return res.status(200).json(transacaoAtualizada.rows[0]);

	} catch (error) {
		console.error(error);
		return res.status(error.status || 500).json({ mensagem: error.message || 'Erro interno do servidor' });
	}

}

const excluirTransacao = async (req, res) => {
	const { id } = req.params

	try {
		if (!id) {
			throw { status: 400, message: 'O campo id é obrigatório' };
		}

		const transacaoExistente = await pool.query('select * from transacoes WHERE id = $1', [id])

		if (transacaoExistente.rowCount === 0) {
			throw { status: 400, message: 'Transação não encontrada' };
		}

		const transacaoExcluida = await pool.query('delete from  transacoes where id = $1', [id]
		)

		return res.status(200).json();
	} catch (error) {
		console.error(error);
		return res.status(error.status || 500).json({ mensagem: error.message || 'Erro interno do servidor' });
	}

}

const detalharTransacao = async (req, res) => {
	const { id } = req.params;

	try {
		const { rows, rowCount } = await pool.query(
			'SELECT * FROM transacoes WHERE id = $1 AND usuario_id = $2',
			[id, req.usuario.id]
		);

		if (rowCount < 1) {
			return res.status(404).json({ mensagem: 'Transação não encontrada.' });
		}

		return res.json(rows[0]);
	} catch (error) {
		console.error(error);
		return res.status(500).json({ mensagem: 'Erro interno do servidor' });
	}
}

const obterExtradoDeUmaTransacao = async (req, res) => {
	try {
		const { rows: entradas } = await pool.query(
			'select sum(valor) from transacoes where usuario_id = $1 AND tipo = $2',
			[req.usuario.id, 'entrada']
		);

		const { rows: saidas } = await pool.query(
			'select sum(valor) from transacoes where usuario_id = $1 AND tipo = $2',
			[req.usuario.id, 'saida']
		);

		let somaEntrada = 0;
		if (entradas[0].sum !== null) {
			somaEntrada = entradas[0].sum;
		}

		let somaSaida = 0;
		if (saidas[0].sum !== null) {
			somaSaida = saidas[0].sum;
		}

		return res.json({ entrada: somaEntrada, saida: somaSaida });
	} catch (error) {
		console.error(error);
		return res.status(500).json({ mensagem: 'Erro interno do servidor' });
	}
}


module.exports = {
	CadastrarTransacao,
	listarTransacao,
	atualizarTransacao,
	excluirTransacao,
	detalharTransacao,
	obterExtradoDeUmaTransacao
}