//Inicialização do SearchBar
var searchbar = app.searchbar.create({
    el: '.searchbar',
    searchContainer: '.list',
    searchIn: '.item-title',
    on: {
      search(sb, query, previousQuery) {
        console.log(query, previousQuery);
      }
    }
  });

  //Banco de dados LOCAL-WEBSQL

  //Cria o banco se não existir ou abre o banco se existir
  var db = window.openDatabase("Memorias", "1.0" ,"Memorias", 25000000)

  //ciração de transação
  db.transaction(criarTabela,
    //callback erro 
    function(erro){
        app.dialog.alert("Erro ao criar tabela: " + erro)
  }, 
  //callback sucesso
    function(){
        console.log("sucesso ao realizar transação")
  })

  //Função de criação de tabela no banco
  function criarTabela(tx){
    tx.executeSql("CREATE TABLE IF NOT EXISTS memorias (id INTEGER primary key, p_escrita varchar(255), p_falada varchar(255), r_falada varchar(255))")
  }

//Função para listar os itens do banco
function listarMemorias() {
    db.transaction(selecionarTudo, 
        (erro) => {
            app.dialog.alert("Erro ao realizar transação selecionar tudo: " + erro)
        },
        () => {
            console.log("sucesso ao inserir listas!")
        })
}


//função para selecionar tudo
function selecionarTudo(tx) {
    tx.executeSql('SELECT * FROM memorias ORDER BY id', [], 
    (tx, dados) => {
        var linhas = dados.rows.length
        //Validação das linhas
        if(linhas == 0){
            $("#comMemorias").addClass("display-none")
            $("#semMemorias").removeClass("display-none")
        }else{
            $("#comMemorias").removeClass("display-none")
            $("#semMemorias").addClass("display-none")

            $("#quantidadeAprendida").html(`${linhas}`)
            $("#listaPerguntas").empty()
            for(i = 0; i < linhas; i++){
                $("#listaPerguntas").append(`<li class="lista text-primary">
                <a href="#" data-popup=".popup-resposta" class="item-link item-content text-primary popup-open" data-id="${dados.rows.item(i).id}" data-pescrita="${dados.rows.item(i).p_escrita}" data-pfalada="${dados.rows.item(i).p_falada}" data-rfalada="${dados.rows.item(i).r_falada}">
                  <div class="item-inner text-primary">
                    <div class="item-title-row text-primary">
                      <div class="item-title text-primary fw-bold"> <span class="material-symbols-outlined">
                        edit
                        </span>${dados.rows.item(i).p_escrita}</div>
                      <div class="item-after text-primary"><span class="badge lista padding-left">ID: ${dados.rows.item(i).id}</span></div>
                    </div>
                    <div class="item-subtitle text-primary"><span class="material-symbols-outlined">
                      mic
                      </span>${dados.rows.item(i).p_falada}</div>
                  </div>
                </a>
              </li>`)
            }

            $('.item-link').on("click", () => {
              var valores = $(event.currentTarget)
              var id_item = valores.attr("data-id")
              localStorage.setItem("id-item", id_item)
              var item_rfalada = valores.attr("data-rfalada")

              $("#idItem").html("ID: " + id_item)

              console.log(id_item)
              //Se não for nula, será alimentado!
              if(item_rfalada !== null && item_rfalada !== "null" ){
                $("#resposta_falada").val(item_rfalada)
              }

              $("#resposta_falada").focus()

              $("#falar_resposta").on("click", () => {
                var resposta_falada = $("#resposta_falada").val()
              
                window.plugins.speechRecognition.startListening(
                  TTS.speak({
                    text: `${resposta_falada}`,
                    locale: 'pt-BR',
                    rate: 0.95
                }, function () {
                    app.dialog.alert("Fala concluida com sucesso!")
                }, function (erro) {
                    app.dialog.alert("Houve um erro: " + erro);
                })
                )
              })

              $("#salvar_resposta_falada").on("click", () => {
                var id = localStorage.getItem('id-item')
                var resposta_falada = $("#resposta_falada").val()
              
                db.transaction(resposta,
                  //caso der erro 
                  (erro) => {
                      app.dialog.alert("Erro em inserir transação: " + erro)
                  },
                  //caso der certo
                  () => {
                      console.log("Sucesso ao inserir transação!")
                      //Toast para informar o usuario que foi salvo
                      toastSalvar = app.toast.create({
                          icon: '<span class="material-symbols-outlined">save</span>',
                          text: 'Salvo',
                          position: 'center',
                          closeTimeout: 2000,
                        });
                        toastSalvar.open()
                      }
                )
              
                function resposta(tx) {
                  tx.executeSql(`UPDATE memorias SET r_falada='${resposta_falada}' WHERE id= '${id}'`)
                }
              })

              $(document).on("click", "#excluir_resposta", () => {
                var id_del = localStorage.getItem('id-item')

                db.transaction(excluir,
                  //caso der erro 
                  (erro) => {
                      app.dialog.alert("Erro em Excluir elemento: " + erro)
                  },
                  //caso der certo
                  () => {
                      console.log("Sucesso ao Excluir elemento!")
                      //Toast para informar o usuario que foi Excluido
                      toastExcluir = app.toast.create({
                          icon: '<span class="material-symbols-outlined">delete_forever</span>',
                          text: 'Excluido',
                          position: 'center',
                          closeTimeout: 2000,
                        });
                        toastExcluir.open()
                      }
                )
              
                function excluir(tx) {
                  tx.executeSql(`DELETE FROM memorias WHERE id= '${id_del}'`)
                }
                listarMemorias()
              })

            })
        }
        
    },
    (erro) => {
        app.dialog.alert("Erro ao listar as memorias: " + erro)
    })
}

listarMemorias()


  //Gravar Pergunta
  $("#gravarPergunta").on('click', () => {

    let options = {
        language: "pt-BR",      
        showPopup: false,
        showPartial: true
      }
      //Escutando 
      window.plugins.speechRecognition.startListening(
        //sucesso
        function(dados){
            $.each(dados, function(index, texto){
                $("#perguntaEntendida").val(texto)
                })
            },
        //Erro
        function(erro){
            app.dialog.alert('Houve um erro: ' + erro)
        },  options)
  })

  //Salvar pergunta
  $("#salvarPergunta").on("click", () => {
    var pergunta_escrita = $("#perguntaEscrita").val().toLowerCase()
    var pergunta_Entendida = $("#perguntaEntendida").val().toLowerCase()

    //validação dos campos
    if(pergunta_escrita == "" || pergunta_Entendida == ""){
        app.dialog.alert("Por favor preencha todos os campos!")
    }else{
        db.transaction(inserir,
        //caso der erro 
        (erro) => {
            app.dialog.alert("Erro em inserir transação: " + erro)
        },
        //caso der certo
        () => {
            console.log("Sucesso ao inserir transação!")
            //Toast para informar o usuario que foi salvo
            toastSalvar = app.toast.create({
                icon: '<span class="material-symbols-outlined">save</span>',
                text: 'Salvo',
                position: 'center',
                closeTimeout: 2000,
              });
              toastSalvar.open()

            //Esvaziar os campos
            $("#perguntaEscrita").val("")
            $("#perguntaEntendida").val("")

            //focar no pergunta escrita
            $("#perguntaEscrita").focus()

            listarMemorias()
        })
    }
    function inserir(tx) {
        tx.executeSql(`INSERT INTO memorias (p_escrita, p_falada) VALUES ('${pergunta_escrita}', '${pergunta_Entendida}')`)
    }
  })

//Apagar memorias
$("#apagarMemorias").on("click", () => {
    app.dialog.confirm("Tem certeza que quer apagar as memorias?", "<strong>Confirmação</strong>", () => {
        db.transaction(apagar, 
            (erro) => {
                app.dialog.alert('Erro ao realizar a exclusão: ' + erro)
            },
            () => {
                app.views.main.router.refreshPage()
            })
            
        function apagar(tx) {
            tx.executeSql("DROP TABLE memorias", [], 
            () => {
                app.dialog.alert("Nada mais faz sentido....", "<strong>Memórias Apagadas</strong>")
            },
            (erro) => {
                app.dialog.alert("Falha ao apagar as memórias", + erro)
            })    
        }
    })
})
