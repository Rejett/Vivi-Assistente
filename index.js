//keyAPI

var apiKey = "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"

var palavras_db = []

//Começo da rota index

var db = window.openDatabase("Memorias", "1.0" ,"Memorias", 25000000)

//Verificação de permisão de microfone
window.plugins.speechRecognition.hasPermission(
    function(permissao){
        //se NÃO TIVER PERMISSOA
        if(!permissao){
            //solicitar permissao
            window.plugins.speechRecognition.requestPermission(
                function(temPermissao){
                    app.dialog.alert("Permissão concedida: " + temPermissao)
                }, 
                function(erro){
                    app.dialog.alert("Erro na requisição de permissão: " + erro)
                })
        }
    }, 
    function(erro){
        app.dialog.alert('Erro de permissão: ' + erro)
    })


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
            for(i = 0; i < linhas; i++){
                palavras_db.push(dados.rows.item(i).p_falada)
            }
        })
    }

listarMemorias()

console.log(palavras_db)
//clicou no botão falar
$("#btn-falar").on('click',function(){
    let options = {
        language: "pt-BR",      
        showPopup: false,
        showPartial: false
      }
      //Escutando 
      window.plugins.speechRecognition.startListening(
        //sucesso
        function(dados){
            $.each(dados, function(index, texto){
                $("#pergunta").html("").append(texto)
                var pergunta = $("#pergunta").html().toLowerCase()

                if(pergunta == "acessar memórias" || pergunta == "acessar memória"){
                    app.views.main.router.navigate('/memorias/')
                }else{
                    resposta()
                }
                
                function resposta() {
                    db.transaction(selecionarResposta, 
                        (erro) => {
                            app.dialog.alert("Erro ao realizar transação selecionar tudo: " + erro)
                        },
                        () => {
                            console.log("sucesso ao inserir listas!")
                        })
                }
                
                function selecionarResposta(tx) {
                    tx.executeSql('SELECT * FROM memorias ORDER BY id', [], 
                    (tx, dados) => {
                        var linhas = dados.rows.length
                        for(i = 0; i < linhas; i++){
                            var pergunta_falada = dados.rows.item(i).p_falada
                            var r_falada = dados.rows.item(i).r_falada

                            if(pergunta == pergunta_falada){
                                console.log(pergunta)
                                TTS.speak({
                                    text: `${r_falada}`,
                                    locale: 'pt-BR',
                                    rate: 0.95
                                }, function () {
                                    //fala realizada com sucesso
                                    var typed = new Typed('#resposta', {
                                        // Waits 1000ms after typing "First"
                                        strings: [`${r_falada}^1000`, ''],
                                        typeSpeed: 40,
                                        showCursor: false,
                                        onComplete: function(self){
                                            toastBottom = app.toast.create({
                                      text: 'Fala concluida com sucesso',
                                      closeTimeout: 2000,
                                    });
                                    toastBottom.open()
                                        }
                                      });
                                }, function (erro) {
                                    app.dialog.alert("Houve um erro: " + erro);
                                });
                                break
                            }
                            else if(pergunta != pergunta_falada && i == linhas - 1){
                                console.log(pergunta)
                               fetch("https://api.openai.com/v1/completions",{
                                    method: 'POST',
                                    headers: {
                                        Accept: 'application/json',
                                        "Content-Type": 'application/json',
                                        Authorization: `Bearer ${apiKey}`
                                    },
                                    body: JSON.stringify({
                                        model: "text-davinci-003",
                                        prompt: `você é uma assistente virtual chamada vivi, responda vivi: ${pergunta}`,
                                        max_tokens: 2048,
                                        temperature: 0.6
                                    })
                               })
                               .then((response) => response.json())
                               .then((response) => {
                                   var resposta =  response.choices[0]['text']
            
                                   TTS.speak({
                                    text: resposta,
                                    locale: 'pt-BR',
                                    rate: 0.95
                                }, function () {
                                    //fala realizada com sucesso
                                    var typed = new Typed('#resposta', {
                                        // Waits 1000ms after typing "First"
                                        strings: [`${resposta}^1000`, ''],
                                        typeSpeed: 40,
                                        showCursor: false,
                                        onComplete: function(self){
                                            toastBottom = app.toast.create({
                                      text: 'Fala concluida com sucesso',
                                      closeTimeout: 2000,
                                    });
                                    toastBottom.open()
                                        }
                                      });
                                }, function (erro) {
                                    app.dialog.alert("Houve um erro: " + erro);
                                });
                               })
                               .catch((erro) => {
                                    app.dialog.alert("Deu erro: " + erro)
                               })
                        }
            }
        })
        }
            })
        },
        //Erro
        function(erro){
            app.dialog.alert('Houve um erro: ' + erro)
        },  options)
})