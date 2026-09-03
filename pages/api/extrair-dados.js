import axios from 'axios'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  const { mapsLink } = req.body

  if (!mapsLink) {
    return res.status(400).json({ error: 'Link do Google Maps é obrigatório.' })
  }

  try {
    // 1. Usar a Bright Data para acessar o link e obter o HTML
    const brightDataResponse = await axios.post(
      'https://api.brightdata.com/request',
      {
        zone: 'web_unlocker',
        url: mapsLink,
        format: 'raw',
        data_format: 'html'
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.BRIGHT_DATA_API_KEY}`
        },
        timeout: 60000 // 60 segundos
      }
    )

    const html = brightDataResponse.data

    // 2. Extrair dados estruturados (JSON-LD)
    // O Google Maps coloca os dados em tags <script type="application/ld+json">
    const jsonLdRegex = /<script type="application\/ld\+json">(.*?)<\/script>/s
    const match = html.match(jsonLdRegex)

    if (!match) {
      return res.status(404).json({ 
        success: false,
        error: 'Não foi possível encontrar dados estruturados na página.' 
      })
    }

    // 3. Parsear o JSON
    const jsonData = JSON.parse(match[1])
    
    // 4. Extrair as informações necessárias
    // O JSON pode ter diferentes estruturas, vamos percorrer os principais campos
    let nome = ''
    let telefone = ''
    let endereco = ''
    let site = ''
    let foto = ''

    // Nome
    if (jsonData.name) {
      nome = jsonData.name
    } else if (jsonData.legalName) {
      nome = jsonData.legalName
    }

    // Telefone
    if (jsonData.telephone) {
      telefone = jsonData.telephone
    } else if (jsonData.contactPoint && jsonData.contactPoint.telephone) {
      telefone = jsonData.contactPoint.telephone
    }

    // Endereço
    if (jsonData.address) {
      if (typeof jsonData.address === 'string') {
        endereco = jsonData.address
      } else if (jsonData.address.streetAddress) {
        endereco = jsonData.address.streetAddress
        if (jsonData.address.addressLocality) {
          endereco += `, ${jsonData.address.addressLocality}`
        }
        if (jsonData.address.addressRegion) {
          endereco += ` - ${jsonData.address.addressRegion}`
        }
        if (jsonData.address.postalCode) {
          endereco += `, ${jsonData.address.postalCode}`
        }
      }
    }

    // Site
    if (jsonData.url) {
      site = jsonData.url
    } else if (jsonData.sameAs && jsonData.sameAs.length > 0) {
      site = jsonData.sameAs[0]
    }

    // Foto (imagem de perfil)
    if (jsonData.image) {
      if (typeof jsonData.image === 'string') {
        foto = jsonData.image
      } else if (jsonData.image.url) {
        foto = jsonData.image.url
      } else if (jsonData.image.contentUrl) {
        foto = jsonData.image.contentUrl
      }
    }

    // Se não encontrou nome ou telefone, tenta uma segunda estratégia
    // Usar expressões regulares para capturar dados diretamente do HTML
    if (!nome || !telefone) {
      // Tenta capturar o nome do título da página
      const titleMatch = html.match(/<title>(.*?)<\/title>/)
      if (titleMatch) {
        const title = titleMatch[1].replace(' - Google Maps', '').trim()
        if (!nome) nome = title
      }

      // Tenta capturar telefone com regex
      if (!telefone) {
        const phoneRegex = /\(?\d{2}\)?\s*\d{4,5}-\d{4}/
        const phoneMatch = html.match(phoneRegex)
        if (phoneMatch) telefone = phoneMatch[0]
      }

      // Tenta capturar endereço com regex
      if (!endereco) {
        const addressRegex = /<span[^>]*class="[^"]*address[^"]*"[^>]*>(.*?)<\/span>/i
        const addressMatch = html.match(addressRegex)
        if (addressMatch) endereco = addressMatch[1].trim()
      }
    }

    const dadosExtraidos = {
      nome: nome || 'Nome não encontrado',
      telefone: telefone || 'Telefone não informado',
      endereco: endereco || 'Endereço não informado',
      site: site || '',
      foto: foto || ''
    }

    // Se ainda assim não encontrou nada, retorna erro
    if (dadosExtraidos.nome === 'Nome não encontrado' && dadosExtraidos.telefone === 'Telefone não informado') {
      return res.status(404).json({
        success: false,
        error: 'Não foi possível extrair os dados. O link pode ser inválido ou privado.'
      })
    }

    return res.status(200).json({ success: true, dados: dadosExtraidos })

  } catch (error) {
    console.error('Erro detalhado:', error.message)
    return res.status(500).json({
      error: 'Erro ao buscar dados. Verifique o link e seus créditos Bright Data.'
    })
  }
}
