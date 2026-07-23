const pool = require('../conexao')

const CadastrarTransacao = async (req, res) => {
  const { tipo, descricao, valor, data, categoria_id } = req.body
  const usuario_id = req.usuario.id

  try {
    const categoriaExistente = await pool.query(
      'SELECT * FROM categorias WHERE id = $1',
      [categoria_id]
    )

    if (categoriaExistente.rowCount === 0) {
      return res
        .status(400)
        .json({ mensagem: 'A categoria especificada não existe.' })
    }

    const novaTransacao = await pool.query(
      'INSERT INTO transacoes (tipo, descricao, valor, data, categoria_id, usuario_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [tipo, descricao, valor, data, categoria_id, usuario_id]
    )

    const novaTransacaoJson = {
      id: novaTransacao.rows[0].id,
      tipo: novaTransacao.rows[0].tipo,
      descricao: novaTransacao.rows[0].descricao,
      valor: novaTransacao.rows[0].valor,
      data: novaTransacao.rows[0].data,
      usuario_id: novaTransacao.rows[0].usuario_id,
      categoria_id: novaTransacao.rows[0].categoria_id,
      categoria_nome: categoriaExistente.rows[0].descricao
    }

    return res.status(201).json(novaTransacaoJson)
  } catch (error) {
    console.error(error)
    return res.status(500).json({ mensagem: 'Erro interno do servidor' })
  }
}

const listarTransacao = async (req, res) => {
  const usuario_id = req.usuario.id

  try {
    const { rows: transacoes } = await pool.query(
      'SELECT * FROM transacoes WHERE usuario_id = $1',
      [usuario_id]
    )
    return res.json(transacoes)
  } catch (error) {
    console.error(error)
    return res.status(500).json({ mensagem: 'Erro interno do servidor' })
  }
}

const atualizarTransacao = async (req, res) => {
  const { tipo, descricao, valor, data, categoria_id } = req.body
  const { id } = req.params
  const usuario_id = req.usuario.id

  try {
    const transacaoExistente = await pool.query(
      'SELECT * FROM transacoes WHERE id = $1 AND usuario_id = $2',
      [id, usuario_id]
    )

    if (transacaoExistente.rowCount === 0) {
      return res
        .status(404)
        .json({ mensagem: 'Transação não encontrada.' })
    }

    const categoriaExistente = await pool.query(
      'SELECT * FROM categorias WHERE id = $1',
      [categoria_id]
    )

    if (categoriaExistente.rowCount === 0) {
      return res
        .status(400)
        .json({ mensagem: 'A categoria especificada não existe.' })
    }

    const transacaoAtualizada = await pool.query(
      'UPDATE transacoes SET tipo = $1, descricao = $2, valor = $3, data = $4, categoria_id = $5 WHERE id = $6 AND usuario_id = $7 RETURNING *',
      [tipo, descricao, valor, data, categoria_id, id, usuario_id]
    )

    return res.status(200).json(transacaoAtualizada.rows[0])
  } catch (error) {
    console.error(error)
    return res.status(500).json({ mensagem: 'Erro interno do servidor' })
  }
}

const excluirTransacao = async (req, res) => {
  const { id } = req.params
  const usuario_id = req.usuario.id

  try {
    const transacaoExistente = await pool.query(
      'SELECT * FROM transacoes WHERE id = $1 AND usuario_id = $2',
      [id, usuario_id]
    )

    if (transacaoExistente.rowCount === 0) {
      return res
        .status(404)
        .json({ mensagem: 'Transação não encontrada.' })
    }

    await pool.query('DELETE FROM transacoes WHERE id = $1 AND usuario_id = $2', [
      id,
      usuario_id
    ])

    return res.status(204).send()
  } catch (error) {
    console.error(error)
    return res.status(500).json({ mensagem: 'Erro interno do servidor' })
  }
}

const detalharTransacao = async (req, res) => {
  const { id } = req.params
  const usuario_id = req.usuario.id

  try {
    const { rows, rowCount } = await pool.query(
      'SELECT * FROM transacoes WHERE id = $1 AND usuario_id = $2',
      [id, usuario_id]
    )

    if (rowCount < 1) {
      return res.status(404).json({ mensagem: 'Transação não encontrada.' })
    }

    return res.json(rows[0])
  } catch (error) {
    console.error(error)
    return res.status(500).json({ mensagem: 'Erro interno do servidor' })
  }
}

const obterExtradoDeUmaTransacao = async (req, res) => {
  const usuario_id = req.usuario.id

  try {
    const { rows: entradas } = await pool.query(
      "SELECT SUM(valor) FROM transacoes WHERE usuario_id = $1 AND tipo = 'entrada'",
      [usuario_id]
    )

    const { rows: saidas } = await pool.query(
      "SELECT SUM(valor) FROM transacoes WHERE usuario_id = $1 AND tipo = 'saida'",
      [usuario_id]
    )

    const somaEntrada = Number(entradas[0].sum) || 0
    const somaSaida = Number(saidas[0].sum) || 0

    return res.json({ entrada: somaEntrada, saida: somaSaida })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ mensagem: 'Erro interno do servidor' })
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