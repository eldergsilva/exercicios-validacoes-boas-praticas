function validarCamposObrigatorios(body, campos) {
    for (const campo of campos) {
        if (!body[campo]) {
            throw { status: 400, message: `O campo ${campo} é obrigatório` };
        }
    }
}


module.exports = {
    validarCamposObrigatorios,
};