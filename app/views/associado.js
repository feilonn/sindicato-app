require('dotenv').config();
const request = require('request');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const rota = require('path').basename(__filename, '.js');
var multer = require('multer');
var upload = multer();
let lista = [];
var moment = require('moment');


module.exports = async function (app) {

    app.use(cookieParser());
    app.use(session({
        secret: "2C44-4D44-WppQ38S"
    }));

    app.use(require('connect-flash')());
    app.use(function (req, res, next) {
        res.locals.messages = require('express-messages')(req, res);
        next();
    });

    // Rota para exibição da View Listar
    app.get('/app/' + rota + '/list', function (req, res) {
        if (!req.session.token) {
            res.redirect('/app/login');
        } else {
            teste = request({
                url: process.env.API_HOST + rota + "/0/10?sort=nome!asc",
                method: "GET",
                json: true,
                headers: {
                    "content-type": "application/json",
                    "Authorization": req.session.token
                },
            }, function (error, response, body) {
                lista = [];
                for (var i = 0; i < Object.keys(body.data.content).length; i++) {
                    const finallista = {
                        id: body.data.content[i].id,
                        nome: body.data.content[i].nome,
                        cpf: body.data.content[i].cpf,
                        status: body.data.content[i].status
                    };
                    lista.push(finallista);
                }
                res.format({
                    html: function () {
                        res.render(rota + '/List', { itens: lista, page: rota, informacoes: req.session.json, number: body.data.number, totalPages: body.data.totalPages, });
                    }
                });
                return lista;
            });
        }
    });

    app.post('/app/' + rota + '/list', function (req, res) {
        if (!req.session.token) {
            res.redirect('/app/login');
        } else {
            var url;
            if (req.body.busca) {
                url = process.env.API_HOST + rota + "/cpf/" + req.body.busca + '/' + req.body.page + "/" + req.body.size;
            } else {
                url = process.env.API_HOST + rota + "/" + req.body.page + "/" + req.body.size + "?sort=nome!asc";
            }
            teste = request({
                url: url,
                method: "GET",
                json: true,
                headers: {
                    "content-type": "application/json",
                    "Authorization": req.session.token
                },
            }, function (error, response, body) {
                lista = [];
                for (var i = 0; i < Object.keys(body.data.content).length; i++) {
                    const finallista = {
                        id: body.data.content[i].id,
                        nome: body.data.content[i].nome,
                        cpf: body.data.content[i].cpf,
                    };
                    lista.push(finallista);
                }

                return res.json({
                    itens: lista,
                    page: rota,
                    informacoes: req.session.json,
                    number: body.data.number,
                    totalPages: body.data.totalPages
                });

            });

        }
    });



    // Rota para exibição da View Criar
    app.get('/app/' + rota + '/create', function (req, res) {
        if (!req.session.token) {
            res.redirect('/app/login');
        } else {
            request({
                url: process.env.API_HOST + "municipio/estado/21",
                method: "GET",
                json: true,
                headers: {
                    "content-type": "application/json",
                },
            }, async function (error, response, body) {
                estados = [];
                for (var i = 0; i < Object.keys(body.data).length; i++) {
                    const finalarea = {
                        id: body.data[i].id,
                        nome: body.data[i].nome,
                        sigla: body.data[i].sigla
                    };
                    estados.push(finalarea);
                }
                res.format({
                    html: function () {
                        res.render(rota + '/Create', { itensEstados: estados, page: rota, informacoes: req.session.json });
                    }
                });
            });
        }
    });

    // Rota para receber parametros via post criar item
    app.post('/app/' + rota + '/create/submit', function (req, res) {
        var datanasc = moment(req.body.datanascimento).toDate();
        console.log(req.body.tpEstadoCivil);
        console.log(req.body);


        var cpf = req.body.cpf;
        cpf = cpf.replace('.', '');
        cpf = cpf.replace('.', '');
        cpf = cpf.replace('-', '');
        request({
            url: process.env.API_HOST + rota,
            method: "POST",
            json: true,
            headers: {
                "content-type": "application/json",
                "Authorization": req.session.token
            },
            json: {
                "nome_escola": req.body.nome_escola,
                "nome": req.body.nome,
                "orgao_expedidor": req.body.orgao_expedidor,
                "nivel": req.body.nivel,
                "atividade_funcional": req.body.atividade_funcional,
                "area": req.body.area,
                "matricula": req.body.matricula,
                "rg": req.body.rg,
                "cpf": cpf,
                "sexo": req.body.sexo,
                "turno": req.body.turno,
                "endereco": {
                    "logradouro": req.body.logradouro,
                    "numero": req.body.numero,
                    "complemento": req.body.complemento,
                    "bairro": req.body.bairro,
                    "cep": req.body.cep,
                    "contato": req.body.celular,
                    "municipio": {
                        "id": req.body.municipio
                    }
                },
                "disciplina": req.body.disciplina,
                "tpEstadoCivil": "SOLTEIRO",
                "tpRedeEnsino": req.body.tpRedeEnsino,
                "situacao": req.body.situacao,
                "datanascimento": datanasc,
                "tpEscolaridade": req.body.tpEscolaridade,
                "faixaSalario": req.body.faixaSalario,
                "celular": req.body.celular

            },

        }, function (error, response, body) {
            if (response.statusCode != 200) {
                req.flash("danger", "Não foi possível cadastrar. " + body.errors);
                res.redirect('/');
            } else {
                req.flash("success", "Associado cadastrado.");
                res.redirect('/');
            }
            return true;
        });
    });


    /*
    // Rota para exibição da View PERFIL
    app.get('/app/perfil/edit/', function (req, res) {
        console.log('perfil')
        categorias = [];
        if (!req.session.token) {
            res.redirect('/app/login');
        } else {
            request({
                url: process.env.API_HOST + "orgao/ativos",
                method: "GET",
                json: true,
                headers: {
                    "content-type": "application/json",
                },
            }, async function (error, response, body) {
                orgaos = [];
                for (var i = 0; i < Object.keys(body.data).length; i++) {
                    const finalarea = {
                        id: body.data[i].id,
                        nome: body.data[i].nome,
                        sigla: body.data[i].sigla
                    };
                    orgaos.push(finalarea);
                }
    
                request({
                    url: process.env.API_HOST + "categoria",
                    method: "GET",
                    json: true,
                    headers: {
                        "content-type": "application/json",
                        "Authorization": req.session.token
                    },
                }, async function (error, response, body) {
                    for (var i = 0; i < Object.keys(body.data).length; i++) {
                        const finalarea = {
                            id: body.data[i].id,
                            nome: body.data[i].nome,
                            status: body.data[i].status,
                        };
                        categorias.push(finalarea);
                    }
                    request({
                        url: process.env.API_HOST + "estado",
                        method: "GET",
                        json: true,
                        headers: {
                            "content-type": "application/json",
                            "Authorization": req.session.token
                        },
                    }, async function (error, response, body) {
                        estados = []
                        for (var i = 0; i < Object.keys(body.data).length; i++) {
                            const estado = {
                                id: body.data[i].id,
                                nome: body.data[i].nome,
                            };
                            estados.push(estado);
                        }
                        request({
                            url: process.env.API_HOST + rota + "/" + req.session.json.idCandidato,
                            method: "GET",
                            json: true,
                            headers: {
                                "content-type": "application/json",
                                "Authorization": req.session.token
                            },
                        }, function (error, response, body) {
                            var dataCad = moment(body.data.datacadastro).format("YYYY-MM-DD");
                            var datanascimento = moment(body.data.datanascimento).format("YYYY-MM-DD");
                            res.format({
                                html: function () {
                                    res.render(rota + '/Perfil', {
                                        id: body.data.id,
                                        nome: body.data.nome,
                                        lotacao: body.data.lotacao,
                                        cargo: body.data.cargo,
                                        cargo: body.data.cargo,
                                        funcao: body.data.funcao,
                                        area: body.data.area,
                                        matricula: body.data.matricula,
                                        rg: body.data.rg,
                                        cpf: body.data.cpf,
                                        sexo: body.data.sexo,
                                        sexo: body.data.sexo,
                                        nomesocial: body.data.nomesocial,
                                        dataCadastro: dataCad,
                                        datanascimento: datanascimento,
                                        endereco: {
                                            id: body.data.endereco != null ? body.data.endereco.id : null,
                                            logradouro: body.data.endereco != null ? body.data.endereco.logradouro : null,
                                            numero: body.data.endereco != null ? body.data.endereco.numero : null,
                                            complemento: body.data.endereco != null ? body.data.endereco.complemento : null,
                                            bairro: body.data.endereco != null ? body.data.endereco.bairro : null,
                                            cep: body.data.endereco != null ? body.data.endereco.cep : null,
                                            contato: body.data.endereco != null ? body.data.endereco.contato : null,
                                            municipio: {
                                                id: body.data.endereco != null ? body.data.endereco.municipio.id : 0,
                                                nome: body.data.endereco != null ? body.data.endereco.municipio.nome : '',
                                                estado: {
                                                    id: body.data.endereco != null ? body.data.endereco.municipio.estado.id : 0,
                                                    nome: body.data.endereco != null ? body.data.endereco.municipio.estado.nome : '',
                                                    sigla: body.data.endereco != null ? body.data.endereco.municipio.estado.sigla : '',
                                                }
                                            }
                                        },
                                        deficiencia: body.data.deficiencia,
                                        usuario: {
                                            id: body.data.usuario.id,
                                            email: body.data.usuario.email,
                                        },
                                        tpformacao: body.data.tpformacao,
                                        orgao: {
                                            id: body.data.orgao.id,
                                            nome: body.data.orgao.nome,
                                        },
                                        telefone: body.data.fone,
                                        celular: body.data.celular,
                                        setor: body.data.setor,
                                        chefe: body.data.chefe,
                                        emailchefe: body.data.emailchefe,
                                        status: body.data.status,
                                        codigo: body.data.codigo,
                                        objetivo: body.data.objetivo,
                                        publico: body.data.publico,
                                        topico: body.data.topico,
                                        page: rota,
                                        informacoes: req.session.json,
                                        estados: estados,
                                        itensOrgaos: orgaos
                                    });
                                }
                            });
                        });
                    });
                })
            })
    
    
        }
    })
    
    // Rota para receber parametros via post criar item
    app.post('/app/perfil/edit/submit', upload.single('photo'), function (req, res) {
    
        const file = req.file;
        let foto;
        if (file) {
            const buf = Buffer.from(req.file.buffer);
            foto = buf.toString('base64');
        } else {
            foto = process.env.PROFILE_IMG
        }
    
        var cadastrodata = moment.now();
        var datanasc = moment(req.body.datanascimento).toDate();
        var cpf = req.body.cpf;
    
    
    
    
        request({
            url: process.env.API_SEGEP + 'egma-servidores?cpf=' + cpf,
            method: "GET",
            json: true,
            headers: {
                "accept": "application/json",
                "Authorization": "Bearer RfIKxynXUGi2lvK3OqbB"
            },
        }, function (error, response, body) {
            var deficiencias = [];
            if (Array.isArray(req.body.candidatoDeficiencia)) {
                for (var i = 0; i < req.body.candidatoDeficiencia.length; i++) {
    
                    deficiencias.push(req.body.candidatoDeficiencia[i]);
                }
            } else {
    
                deficiencias.push(req.body.candidatoDeficiencia);
            }
            if (response.statusCode == 200) {
                if (body != []) {
                    request({
                        url: process.env.API_HOST + rota,
                        method: "PUT",
                        json: true,
                        headers: {
                            "content-type": "application/json",
                            "Authorization": req.session.token
                        },
                        json: {
                            "id": req.body.id,
                            "deficiencia": deficiencias,
                            "nome": req.body.nome,
                            "lotacao": req.body.lotacao,
                            "cargo": req.body.cargo,
                            "funcao": req.body.funcao,
                            "area": req.body.area,
                            "matricula": req.body.matricula,
                            "rg": req.body.rg,
                            "cpf": cpf,
                            "sexo": req.body.sexo,
                            "datacadastro": cadastrodata,
                            "endereco": {
                                "id": req.body.idEndereco,
                                "logradouro": req.body.logradouro,
                                "numero": req.body.numero,
                                "complemento": req.body.complemento,
                                "bairro": req.body.bairro,
                                "cep": req.body.cep,
                                "contato": req.body.celular,
                                "municipio": {
                                    "id": req.body.municipio
                                }
                            },
                            "tpformacao": req.body.formacao,
                            "orgao": {
                                "id": req.body.orgao
                            },
                            "setor": req.body.setor,
                            "chefe": req.body.chefe,
                            "emailchefe": req.body.emailchefe,
                            "datanascimento": datanasc,
                            "nomesocial": req.body.nomesocial,
                            "fone": req.body.telefone,
                            "celular": req.body.celular,
                            "status": true,
                            "servidor": true,
                            "usuario": {
                                "id": req.body.idUsuario,
                                "nome": req.body.nome,
                                "username": cpf,
                                "imgCapa": foto,
                                "niveis": ["EXTERNO"],
                                "email": req.body.email,
                                "telefone": req.body.telefone,
                                "primeiroAcesso": true
                            }
                        },
                    }, function (error, response, body) {
    
                        if (response.statusCode != 200) {
                            req.flash("danger", "Item não salvo. " + body.errors);
                            res.redirect('/app/perfil/edit');
                        } else {
                            req.flash("success", "Item salvo com sucesso.");
                            res.redirect('/app/perfil/edit');
                        }
                        return true;
                    });
                } else {
                    request({
                        url: process.env.API_HOST + rota,
                        method: "POST",
                        json: true,
                        headers: {
                            "content-type": "application/json",
                            "Authorization": req.session.token
                        },
                        json: {
                            "nome": req.body.nome,
                            "lotacao": req.body.lotacao,
                            "cargo": req.body.cargo,
                            "funcao": req.body.funcao,
                            "area": req.body.area,
                            "matricula": req.body.matricula,
                            "rg": req.body.rg,
                            "cpf": cpf,
                            "sexo": req.body.sexo,
                            "datacadastro": cadastrodata,
                            "endereco": {
                                "logradouro": req.body.logradouro,
                                "numero": req.body.numero,
                                "complemento": req.body.complemento,
                                "bairro": req.body.bairro,
                                "cep": req.body.cep,
                                "contato": req.body.celular,
                                "municipio": {
                                    "id": req.body.municipio
                                }
                            },
                            "tpformacao": req.body.formacao,
                            "orgao": {
                                "id": req.body.orgao
                            },
                            /*
                            "setor": {
                                "id": req.body.setor
                            },
                            */

    /*
    "setor": req.body.setor,
    "chefe": req.body.chefe,
    "emailchefe": req.body.emailchefe,
    "datanascimento": datanasc,
    "nomesocial": req.body.nomesocial,
    "fone": req.body.fone,
    "celular": req.body.celular,
    "status": true,
    "servidor": false,
    "usuario": {
        "nome": req.body.nome,
        "username": cpf,
        "password": req.body.password,
        "imgCapa": foto,
        "niveis": ["EXTERNO"],
        "email": req.body.email,
        "telefone": req.body.fone,
        "primeiroAcesso": true
    }
    },
    }, function (error, response, body) {
    
    if (response.statusCode != 200) {
    req.flash("danger", "Item não salvo. " + body.errors);
    res.redirect('/app/perfil/edit');
    } else {
    req.flash("success", "Item salvo com sucesso.");
    res.redirect('/app/perfil/edit');
    }
    return true;
    });
    }
    } else {
    req.flash("danger", "Item não salvo. " + body.errors);
    res.redirect('/');
    }
    });
    });
    */

    // Rota para exibição da View Editar
    app.get('/app/' + rota + '/edit/:id', function (req, res) {


        if (!req.session.token) {
            res.redirect('/app/login');
        } else {

            console.log('akkki');
            request({
                url: process.env.API_HOST + "municipio/estado/21",
                method: "GET",
                json: true,
                headers: {
                    "content-type": "application/json",
                },
            }, async function (error, response, body) {
                estados = [];
                for (var i = 0; i < Object.keys(body.data).length; i++) {
                    const finalarea = {
                        id: body.data[i].id,
                        nome: body.data[i].nome,
                        sigla: body.data[i].sigla
                    };
                    estados.push(finalarea);
                }
                request({
                    url: process.env.API_HOST + rota + "/" + req.params.id,
                    method: "GET",
                    json: true,
                    headers: {
                        "content-type": "application/json",
                        "Authorization": req.session.token
                    },
                }, function (error, response, body) {

                    res.format({
                        html: function () {
                            res.render(rota + '/Edit', {

                                id: body.data.id,
                                nome_escola: body.data.nome_escola,
                                nome: body.data.nome,
                                orgao_expedidor: body.data.orgao_expedidor,
                                nivel: body.data.nivel,
                                atividade_funcional: body.data.atividade_funcional,
                                area: body.data.area,
                                matricula: body.data.matricula,
                                rg: body.data.rg,
                                cpf: body.data.cpf,
                                sexo: body.data.sexo,
                                turno: body.data.turno,
                                endereco: {
                                    id: body.data.endereco != null ? body.data.endereco.id : null,
                                    logradouro: body.data.endereco != null ? body.data.endereco.logradouro : null,
                                    numero: body.data.endereco != null ? body.data.endereco.numero : null,
                                    complemento: body.data.endereco != null ? body.data.endereco.complemento : null,
                                    bairro: body.data.endereco != null ? body.data.endereco.bairro : null,
                                    cep: body.data.endereco != null ? body.data.endereco.cep : null,
                                    contato: body.data.endereco != null ? body.data.endereco.contato : null,
                                    //municipio: body.data.endereco.municipio.id,
                                    /*
                                    municipio: {
    
                                        id: body.data.endereco != null ? body.data.endereco.municipio.id : 0,
                                        nome: body.data.endereco != null ? body.data.endereco.municipio.nome : '',
                                        estado: {
                                            id: body.data.endereco != null ? body.data.endereco.municipio.estado.id : 0,
                                            nome: body.data.endereco != null ? body.data.endereco.municipio.estado.nome : '',
                                            sigla: body.data.endereco != null ? body.data.endereco.municipio.estado.sigla : '',
                                        }
                                    }
                                    */
                                },
                                disciplina: body.data.disciplina,
                                tpEstadoCivil: body.data.tpEstadoCivil,
                                tpRedeEnsino: body.data.tpRedeEnsino,
                                situacao: body.data.situacao,
                                datanascimento: body.data.datanasc,
                                tpEscolaridade: body.data.tpEscolaridade,
                                faixaSalario: body.data.faixaSalario,
                                celular: body.data.celular,
                                page: rota,
                                informacoes: req.session.json,
                                itensEstados: estados
                            });
                        }
                    });
                });
            });
        }
    });

    // Rota para receber parametros via post editar item
    app.post('/app/' + rota + '/edit/submit', function (req, res) {
        var cadastrodata = moment.now();
        var datanasc = moment(req.body.datanascimento).toDate();
        var cpf = req.body.cpf;
        request({
            url: process.env.API_HOST + rota,
            method: "POST",
            json: true,
            headers: {
                "content-type": "application/json",
                "Authorization": req.session.token
            },
            json: {
                "nome_escola": req.body.nome_escola,
                "nome": req.body.nome,
                "id": req.body.id,
                "orgao_expedidor": req.body.orgao_expedidor,
                "nivel": req.body.nivel,
                "atividade_funcional": req.body.atividade_funcional,
                "area": req.body.area,
                "matricula": req.body.matricula,
                "rg": req.body.rg,
                "cpf": cpf,
                "sexo": req.body.sexo,
                "turno": req.body.turno,
                "endereco": {
                    "logradouro": req.body.logradouro,
                    "numero": req.body.numero,
                    "complemento": req.body.complemento,
                    "bairro": req.body.bairro,
                    "cep": req.body.cep,
                    "contato": req.body.celular,
                    "municipio": {
                        "id": req.body.municipio
                    }
                },
                "disciplina": req.body.disciplina,
                "tpEstadoCivil": "SOLTEIRO",
                "tpRedeEnsino": req.body.tpRedeEnsino,
                "situacao": req.body.situacao,
                "datanascimento": datanasc,
                "tpEscolaridade": req.body.tpEscolaridade,
                "faixaSalario": req.body.faixaSalario,
                "celular": req.body.celular

            },

        }, function (error, response, body) {
            if (response.statusCode != 200) {
                req.flash("danger", "Não foi possível cadastrar. " + body.errors);
                res.redirect('/');
            } else {
                req.flash("success", "Associado cadastrado.");
                res.redirect('/');
            }
            return true;
        });
    })

    // Rota para exclusão de um item
    app.post('/app/' + rota + '/delete/', function (req, res) {
        if (!req.session.token) {
            res.redirect('/app/login');
        } else {
            request({
                url: process.env.API_HOST + rota + "/" + req.body.id,
                method: "DELETE",
                json: true,
                headers: {
                    "content-type": "application/json",
                    "Authorization": req.session.token
                },
            }, function (error, response, body) {

                if (response.statusCode != 200) {
                    req.flash("danger", "Item não excluído. " + body.errors);
                } else {
                    req.flash("success", "Item excluído com sucesso.");
                }

                res.redirect('/app/' + rota + '/list');
                return true;
            });

        }
    });

    app.get('/app/' + rota + '/setor/:id', function (req, res) {
        setores = [];
        request({
            url: process.env.API_HOST + "setor/orgao/" + req.params.id,
            method: "GET",
            json: true,
            headers: {
                "content-type": "application/json",
                "Authorization": req.session.token
            },
        }, function (error, response, body) {
            for (var i = 0; i < Object.keys(body.data).length; i++) {
                const finalarea = {
                    id: body.data[i].id,
                    nome: body.data[i].nome
                };
                setores.push(finalarea);
            }
            res.json(setores);
        });
    });


    // Rota para exibição da View Alterar Senha
    app.get('/app/' + rota + '/alterar-senha', function (req, res) {
        if (!req.session.token) {
            res.redirect('/app/login');
        } else {
            res.format({
                html: function () {
                    res.render(rota + '/Alterar-Senha', { informacoes: req.session.json, page: rota });
                }
            });


        }
    })

    app.post('/app/' + rota + '/alterar-senha/submit', upload.single('photo'), function (req, res) {
        if (!req.session.token) {
            res.redirect('/app/login');
        } else {
            request({
                url: process.env.API_HOST + rota + '/' + req.body.id + '/alterar-senha',
                method: "POST",
                json: true,
                headers: {
                    "content-type": "application/json",
                    "Authorization": req.session.token,
                    'teste': 'TESTE'
                },
                form: {
                    senhaAtual: req.body.senhaAtual,
                    novaSenha: req.body.novaSenha
                }
            }, function (error, response, body) {

                if (response.statusCode != 200) {
                    req.flash("danger", "Item não atualizado. " + body.errors);
                } else {
                    req.flash("success", "Item atualizado com sucesso.");
                }

                res.redirect('/app/' + rota + '/Alterar-Senha');
                return true;
            });
        }
    });


}