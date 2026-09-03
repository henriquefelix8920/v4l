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
    // Usando a zona 'serp_api1' (disponível no plano gratuito)
    const brightDataResponse = await axios.post(
      'https://api.brightdata.com/request',
      {
        zone: 'serp_api1',
        url: mapsLink,
        format: 'raw',
        data_format: 'html'
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.BRIGHT_DATA_API_KEY}`
        },
        timeout: 30000
      }
    )

    const html = brightDataResponse.data

    // Extrair dados com regex (simplificado)
    const nameMatch = html.match(/<h1[^>]*>(.*?)<\/h1>/i) || 
                     html.match(/<meta property="og:title" content="(.*?)"/i)
    const nome = nameMatch ? nameMatch[1].trim() : 'Nome não encontrado'

    const phoneMatch = html.match(/\(?\d{2}\)?\s*\d{4,5}-\d{4}/)
    const telefone = phoneMatch ? phoneMatch[0] : 'Telefone não informado'

    const addressMatch = html.match(/<span[^>]*class="[^"]*address[^"]*"[^>]*>(.*?)<\/span>/i) ||
                         html.match(/<div[^>]*class="[^"]*section-info[^"]*"[^>]*>(.*?)<\/div>/i)
    const endereco = addressMatch ? addressMatch[1].trim() : 'Endereço não informado'

    const photoMatch = html.match(/<img[^>]*src="(https:\/\/lh3\.googleusercontent\.com\/[^"]+)"[^>]*>/i)
    const foto = photoMatch ? photoMatch[1] : ''

    // Se não encontrou nada, retorna erro amigável
    if (nome === 'Nome não encontrado' && telefone === 'Telefone não informado') {
      return res.status(200).json({ 
        success: false, 
        error: 'Não foi possível extrair dados. O link pode ser privado ou o Google Maps mudou o layout.' 
      })
    }

    return res.status(200).json({ 
      success: true, 
      dados: { nome, telefone, endereco, foto } 
    })

  } catch (error) {
    console.error('Erro Bright Data:', error.message)
    return res.status(500).json({ 
      error: 'Erro ao buscar dados. Verifique sua chave API e créditos Bright Data.' 
    })
  }
}
