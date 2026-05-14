require('dotenv').config()

const qrcode = require('qrcode-terminal')

const { Client: NotionClient } =
  require('@notionhq/client')

const {
  Client,
  LocalAuth,
} = require('whatsapp-web.js')

const chrono =
  require('chrono-node')

const cron =
  require('node-cron')

// ======================
// INICIANDO
// ======================

console.log('🚀 Iniciando bot...')

// ======================
// NOTION
// ======================

const notion =
  new NotionClient({

    auth:
      process.env.NOTION_TOKEN,
  })

console.log('✅ Notion conectado')

// ======================
// WHATSAPP
// ======================

const client =
  new Client({

    authStrategy:
      new LocalAuth(),

    puppeteer: {

      headless: true,

      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
        '--disable-gpu',
      ],
    },
  })

console.log(
  '✅ Cliente WhatsApp criado'
)

// ======================
// GERAR NOVO ID
// ======================

async function gerarNovoID() {

  const response =
    await notion.databases.query({

      database_id:
        process.env.DATABASE_ID,

      sorts: [
        {
          property: 'ID',
          direction: 'descending',
        },
      ],

      page_size: 1,
    })

  if (
    response.results.length === 0
  ) {
    return 1
  }

  const ultimoID =
    response.results[0]
      .properties.ID.number || 0

  return ultimoID + 1
}

// ======================
// EVENTOS WHATSAPP
// ======================

client.on('qr', qr => {

  console.log(
    '\n📱 ESCANEIE O QR CODE:\n'
  )

  qrcode.generate(
    qr,
    { small: true }
  )
})

client.on(
  'authenticated',
  () => {

    console.log(
      '🔐 WhatsApp autenticado!'
    )
  }
)

client.on(
  'auth_failure',
  msg => {

    console.log(
      '❌ Falha autenticação:',
      msg
    )
  }
)

client.on(
  'loading_screen',
  (percent, message) => {

    console.log(
      `⏳ ${percent}% - ${message}`
    )
  }
)

client.on(
  'ready',
  () => {

    console.log(
      '✅ WhatsApp conectado!'
    )
  }
)

// ======================
// BUSCAR GRUPO
// ======================

async function buscarGrupo() {

  const chats =
    await client.getChats()

  const grupo =
    chats.find(

      chat =>
        chat.name ===
        'TAREFAS FSP'
    )

  return grupo
}

// ======================
// BUSCAR TAREFAS HOJE
// ======================

async function buscarTarefasHoje() {

  const hoje =
    new Date()
      .toISOString()
      .split('T')[0]

  const response =
    await notion.databases.query({

      database_id:
        process.env.DATABASE_ID,

      filter: {

        and: [

          {
            property: 'Prazo',

            date: {
              equals: hoje,
            },
          },

          {
            property: 'Status',

            status: {
              does_not_equal:
                'Concluído',
            },
          },
        ],
      },
    })

  return response.results
}

// ======================
// RECEBER MENSAGENS
// ======================

client.on(
  'message_create',

  async message => {

    console.log(
      '\n━━━━━━━━━━━━━━━━━━━━━━━'
    )

    console.log(
      '📩 NOVA MENSAGEM'
    )

    try {

      if (!message.body) {
        return
      }

      const chat =
        await message.getChat()

      const nomeChat =
        chat.name.trim()

      console.log(
        '📁 Nome do chat:',
        nomeChat
      )

      if (
        nomeChat !==
        'TAREFAS FSP'
      ) {

        console.log(
          '⛔ Chat ignorado'
        )

        return
      }

      const texto =
        message.body.trim()

      console.log(
        '📝 Texto:',
        texto
      )

      // ======================
      // IGNORA MENSAGENS FSP
      // ======================

      if (
        texto.includes('[FSP]')
      ) {

        console.log(
          '⛔ Mensagem FSP ignorada'
        )

        return
      }

      // ======================
      // RELATÓRIO DIA
      // ======================

      if (

        texto.toLowerCase() ===
          'relatorio dia' ||

        texto.toLowerCase() ===
          'resumo dia'
      ) {

        const hoje =
          new Date()
            .toISOString()
            .split('T')[0]

        const response =
          await notion.databases.query({

            database_id:
              process.env.DATABASE_ID,

            filter: {
              property: 'Prazo',

              date: {
                equals: hoje,
              },
            },
          })

        const tarefas =
          response.results

        let concluidas = ''
        let andamento = ''
        let naoIniciado = ''

        tarefas.forEach(
          tarefa => {

            const id =
              tarefa.properties
                .ID.number

            const nome =
              tarefa.properties[
                'Nome da tarefa'
              ]
                .title[0]
                ?.plain_text ||
              'Sem nome'

            const status =
              tarefa.properties
                .Status.status.name

            const linha =

`\n🆔 ${id} - ${nome}`

            if (
              status ===
              'Concluído'
            ) {
              concluidas += linha
            }

            if (
              status ===
              'Em andamento'
            ) {
              andamento += linha
            }

            if (
              status ===
              'Não iniciado'
            ) {
              naoIniciado += linha
            }
          }
        )

        const mensagem =

`[FSP] 📊 RELATÓRIO DO DIA

✅ CONCLUÍDAS
${concluidas || '\nNenhuma'}

🟡 EM ANDAMENTO
${andamento || '\nNenhuma'}

❌ NÃO INICIADAS
${naoIniciado || '\nNenhuma'}`

        await chat.sendMessage(
          mensagem
        )

        return
      }

      // ======================
      // RELATÓRIO MÊS
      // ======================

      if (

        texto.toLowerCase() ===
          'relatorio mes' ||

        texto.toLowerCase() ===
          'resumo mes'
      ) {

        const hoje =
          new Date()

        const inicioMes =

          new Date(
            hoje.getFullYear(),
            hoje.getMonth(),
            1
          )
            .toISOString()
            .split('T')[0]

        const fimMes =

          new Date(
            hoje.getFullYear(),
            hoje.getMonth() + 1,
            0
          )
            .toISOString()
            .split('T')[0]

        const response =
          await notion.databases.query({

            database_id:
              process.env.DATABASE_ID,

            filter: {

              and: [

                {
                  property:
                    'Prazo',

                  date: {
                    on_or_after:
                      inicioMes,
                  },
                },

                {
                  property:
                    'Prazo',

                  date: {
                    on_or_before:
                      fimMes,
                  },
                },
              ],
            },
          })

        const tarefas =
          response.results

        let concluidas = ''
        let andamento = ''
        let naoIniciado = ''

        tarefas.forEach(
          tarefa => {

            const id =
              tarefa.properties
                .ID.number

            const nome =
              tarefa.properties[
                'Nome da tarefa'
              ]
                .title[0]
                ?.plain_text ||
              'Sem nome'

            const status =
              tarefa.properties
                .Status.status.name

            const linha =

`\n🆔 ${id} - ${nome}`

            if (
              status ===
              'Concluído'
            ) {
              concluidas += linha
            }

            if (
              status ===
              'Em andamento'
            ) {
              andamento += linha
            }

            if (
              status ===
              'Não iniciado'
            ) {
              naoIniciado += linha
            }
          }
        )

        const mensagem =

`[FSP] 📅 RELATÓRIO DO MÊS

✅ CONCLUÍDAS
${concluidas || '\nNenhuma'}

🟡 EM ANDAMENTO
${andamento || '\nNenhuma'}

❌ NÃO INICIADAS
${naoIniciado || '\nNenhuma'}`

        await chat.sendMessage(
          mensagem
        )

        return
      }

      // ======================
      // DELETAR
      // ======================

      const regexDelete =

        /^(deletar|apagar)\s+(\d+)$/i

      const matchDelete =
        texto.match(regexDelete)

      if (matchDelete) {

        const id =
          Number(
            matchDelete[2]
          )

        const busca =
          await notion.databases.query({

            database_id:
              process.env.DATABASE_ID,

            filter: {
              property: 'ID',

              number: {
                equals: id,
              },
            },
          })

        if (
          busca.results.length === 0
        ) {

          await chat.sendMessage(

`[FSP] ❌ ID ${id} não encontrado`

          )

          return
        }

        const pagina =
          busca.results[0]

        const nome =
          pagina.properties[
            'Nome da tarefa'
          ]
            .title[0]
            ?.plain_text ||
          'Sem nome'

        await notion.pages.update({

          page_id:
            pagina.id,

          archived: true,
        })

        await chat.sendMessage(

`[FSP] 🗑️ Tarefa deletada

🆔 ${id}
📌 ${nome}`

        )

        return
      }

      // ======================
      // ALTERAR STATUS
      // ======================

      const regexStatus =

/^(\d+)\s+(concluido|concluído|andamento|em andamento|nao iniciado|não iniciado)$/i

      const matchStatus =
        texto.match(regexStatus)

      if (matchStatus) {

        const id =
          Number(
            matchStatus[1]
          )

        let novoStatus =
          matchStatus[2]
            .toLowerCase()

        if (

          novoStatus ===
            'concluido' ||

          novoStatus ===
            'concluído'
        ) {

          novoStatus =
            'Concluído'
        }

        if (

          novoStatus ===
            'andamento' ||

          novoStatus ===
            'em andamento'
        ) {

          novoStatus =
            'Em andamento'
        }

        if (

          novoStatus ===
            'nao iniciado' ||

          novoStatus ===
            'não iniciado'
        ) {

          novoStatus =
            'Não iniciado'
        }

        const busca =
          await notion.databases.query({

            database_id:
              process.env.DATABASE_ID,

            filter: {
              property: 'ID',

              number: {
                equals: id,
              },
            },
          })

        if (
          busca.results.length === 0
        ) {

          await chat.sendMessage(

`[FSP] ❌ ID ${id} não encontrado`

          )

          return
        }

        const pagina =
          busca.results[0]

        await notion.pages.update({

          page_id:
            pagina.id,

          properties: {

            Status: {

              status: {
                name:
                  novoStatus,
              },
            },
          },
        })

        await chat.sendMessage(

`[FSP] ✅ Status atualizado

🆔 ${id}
📊 ${novoStatus}`

        )

        return
      }

      // ======================
      // DETECTAR DATA
      // ======================

      console.log(
        '📅 Procurando data...'
      )

      const resultadoData =

        chrono.pt.parse(texto)

      let prazo = null

      if (
        resultadoData.length > 0
      ) {

        prazo =
          resultadoData[0]
            .start
            .date()
            .toISOString()
            .split('T')[0]

        console.log(
          '✅ Data encontrada:',
          prazo
        )

      } else {

        console.log(
          '⚠️ Nenhuma data encontrada'
        )
      }

      // ======================
      // REMOVER DATA
      // ======================

      let nomeTarefa =
        texto

      if (
        resultadoData.length > 0
      ) {

        resultadoData.forEach(

          resultado => {

            nomeTarefa =

              nomeTarefa.replace(
                resultado.text,
                ''
              )
          }
        )
      }

      nomeTarefa =
        nomeTarefa
          .replace(/\s+/g, ' ')
          .trim()

      console.log(
        '📝 Nome da tarefa:',
        nomeTarefa
      )

      // ======================
      // GERAR ID
      // ======================

      const novoID =
        await gerarNovoID()

      // ======================
      // CRIAR TAREFA
      // ======================

      await notion.pages.create({

        parent: {

          database_id:
            process.env.DATABASE_ID,
        },

        properties: {

          ID: {
            number:
              novoID,
          },

          'Nome da tarefa': {

            title: [
              {
                text: {
                  content:
                    nomeTarefa,
                },
              },
            ],
          },

          Status: {

            status: {
              name:
                'Não iniciado',
            },
          },

          Prazo: prazo

            ? {
                date: {
                  start:
                    prazo,
                },
              }

            : undefined,
        },
      })

      await chat.sendMessage(

`[FSP] ✅ Tarefa criada

🆔 ${novoID}
📌 ${nomeTarefa}
📅 ${prazo || 'Sem prazo'}
📊 Não iniciado`

      )

      console.log(
        '✅ Tarefa criada'
      )

    } catch (err) {

      console.log(
        '\n❌ ERRO DETECTADO:'
      )

      console.log(err)
    }

    console.log(
      '━━━━━━━━━━━━━━━━━━━━━━━\n'
    )
  }
)

// ======================
// LEMBRETE 08:00
// ======================

cron.schedule(

  '0 8 * * *',

  async () => {

    try {

      const grupo =
        await buscarGrupo()

      if (!grupo) return

      const tarefas =
        await buscarTarefasHoje()

      if (
        tarefas.length === 0
      ) {

        await grupo.sendMessage(

`[FSP] ✅ Nenhuma tarefa pendente hoje`

        )

        return
      }

      let mensagem =

`[FSP] 📋 TAREFAS PENDENTES - 08:00`

      tarefas.forEach(
        tarefa => {

          const id =
            tarefa.properties
              .ID.number

          const nome =
            tarefa.properties[
              'Nome da tarefa'
            ]
              .title[0]
              ?.plain_text ||
            'Sem nome'

          const status =
            tarefa.properties
              .Status.status.name

          mensagem +=

`\n
🆔 ${id}
📌 ${nome}
📊 ${status}
`
        }
      )

      await grupo.sendMessage(
        mensagem
      )

    } catch (err) {

      console.log(err)
    }

  },

  {
    timezone:
      'America/Sao_Paulo',
  }
)

// ======================
// LEMBRETE 13:00
// ======================

cron.schedule(

  '0 13 * * *',

  async () => {

    try {

      const grupo =
        await buscarGrupo()

      if (!grupo) return

      const tarefas =
        await buscarTarefasHoje()

      if (
        tarefas.length === 0
      ) {

        await grupo.sendMessage(

`[FSP] ✅ Nenhuma tarefa pendente hoje`

        )

        return
      }

      let mensagem =

`[FSP] 📋 TAREFAS PENDENTES - 13:00`

      tarefas.forEach(
        tarefa => {

          const id =
            tarefa.properties
              .ID.number

          const nome =
            tarefa.properties[
              'Nome da tarefa'
            ]
              .title[0]
              ?.plain_text ||
            'Sem nome'

          const status =
            tarefa.properties
              .Status.status.name

          mensagem +=

`\n
🆔 ${id}
📌 ${nome}
📊 ${status}
`
        }
      )

      await grupo.sendMessage(
        mensagem
      )

    } catch (err) {

      console.log(err)
    }

  },

  {
    timezone:
      'America/Sao_Paulo',
  }
)

// ======================
// RELATÓRIO 16:55
// ======================

cron.schedule(

  '55 16 * * *',

  async () => {

    try {

      const grupo =
        await buscarGrupo()

      if (!grupo) return

      const hoje =
        new Date()
          .toISOString()
          .split('T')[0]

      const response =
        await notion.databases.query({

          database_id:
            process.env.DATABASE_ID,

          filter: {
            property: 'Prazo',

            date: {
              equals: hoje,
            },
          },
        })

      const tarefas =
        response.results

      let concluidas = ''
      let andamento = ''
      let naoIniciado = ''

      tarefas.forEach(
        tarefa => {

          const id =
            tarefa.properties
              .ID.number

          const nome =
            tarefa.properties[
              'Nome da tarefa'
            ]
              .title[0]
              ?.plain_text ||
            'Sem nome'

          const status =
            tarefa.properties
              .Status.status.name

          const linha =

`\n🆔 ${id} - ${nome}`

          if (
            status ===
            'Concluído'
          ) {
            concluidas += linha
          }

          if (
            status ===
            'Em andamento'
          ) {
            andamento += linha
          }

          if (
            status ===
            'Não iniciado'
          ) {
            naoIniciado += linha
          }
        }
      )

      const mensagem =

`[FSP] 📊 RELATÓRIO FINAL DO DIA

✅ CONCLUÍDAS
${concluidas || '\nNenhuma'}

🟡 EM ANDAMENTO
${andamento || '\nNenhuma'}

❌ NÃO INICIADAS
${naoIniciado || '\nNenhuma'}`

      await grupo.sendMessage(
        mensagem
      )

    } catch (err) {

      console.log(err)
    }

  },

  {
    timezone:
      'America/Sao_Paulo',
  }
)

// ======================
// INICIAR
// ======================

console.log(
  '🕒 Horário atual:'
)

console.log(
  new Date().toString()
)

console.log(
  '🚀 Inicializando WhatsApp...'
)

client.initialize()
