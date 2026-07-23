const pool = require('../conexao')
const categoria =async (req,res)=>{

}

const listarCategorias = async (req, res) => {
	try {
		const { rows } = await pool.query('select * from categorias')
		return res.json(rows)
	} catch (error) {
        console.log(error)
		return res.status(500).json('Erro interno do servidor')
	}
}

module.exports =listarCategorias