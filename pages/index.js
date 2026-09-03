import { useState } from 'react'

export default function Home() {
  const [mapsLink, setMapsLink] = useState('')
  const [carregando, setCarregando] = useState(false)
  const [nome, setNome] = useState('')
  const [segmento, setSegmento] = useState('')
  const [diferencial, setDiferencial] = useState('')
  const [endereco, setEndereco] = useState('')
  const [telefone, setTelefone] = useState('')
  const [imagens, setImagens] = useState('')
  const [prompt, setPrompt] = useState('')
  const [copiado, setCopiado] = useState(false)

  const buscarDadosDoLink = async () => {
    if (!mapsLink) {
      alert('Cole o link do Google Maps primeiro!')
      return
    }
    setCarregando(true)
    try {
      const response = await fetch('/api/extrair-dados', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mapsLink })
      })
      const data = await response.json()
      if (data.success) {
        setNome(data.dados.nome || '')
        setTelefone(data.dados.telefone || '')
        setEndereco(data.dados.endereco || '')
        alert('✅ Dados extraídos com sucesso!')
      } else {
        alert('❌ ' + (data.error || 'Erro ao extrair dados.'))
      }
    } catch (error) {
      alert('Erro ao buscar dados. Tente novamente.')
    } finally {
      setCarregando(false)
    }
  }

  const gerarPrompt = () => {
    const texto = `**INSTRUÇÕES PARA CRIAÇÃO DE SITE PROFISSIONAL**

1. **CURADORIA PRÉVIA:**
Antes de codificar, pesquise mentalmente os 5 maiores sites de ${segmento || 'advogados'} do Brasil. Liste características visuais comuns: paleta de cores, estrutura de navegação, disposição de seções (depoimentos, equipe, contato), tipografia. Extraia a essência do que torna um site desse segmento confiável e premium.

2. **CONSTRUÇÃO:**
Com base nessa curadoria, crie um site moderno utilizando componentes de alto nível (shadcn/ui ou similares) com as seguintes diretrizes:
- Cores sólidas e elegantes (evite gradientes chamativos)
- Espaçamento amplo (padding/margin generosos)
- Fontes clássicas (Inter, Roboto ou Playfair Display para títulos)
- Evite bordas arredondadas exageradas e animações desnecessárias

3. **CONTEÚDO DO SITE:**
- Nome: ${nome || 'Cliente'}
- Telefone: ${telefone || 'Não informado'}
- Endereço: ${endereco || 'Não informado'}
- Segmento: ${segmento || 'Não informado'}
- Diferencial: ${diferencial || 'Não informado'}

4. **IMAGENS:**
${imagens ? `Utilize as seguintes imagens como referência: ${imagens}` : 'Use imagens genéricas do Unsplash com temática relacionada ao segmento.'}

5. **ESTRUTURA MÍNIMA:**
- Hero Section (com chamada principal)
- Sobre / Diferenciais
- Serviços (3 a 4 itens)
- Depoimentos (fictícios, mas realistas)
- Rodapé com endereço, telefone e redes sociais

6. **ENTREGA FINAL:**
Gere o código HTML completo em um único arquivo, pronto para ser hospedado no GitHub Pages ou similar.`

    setPrompt(texto)
    setCopiado(false)
  }

  const copiarPrompt = () => {
    navigator.clipboard.writeText(prompt)
    setCopiado(true)
    setTimeout(() => setCopiado(false), 3000)
  }

  return (
    <div style={{ padding: '20px 20px 60px', maxWidth: '900px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
      <header className="neon-border" style={{ padding: '16px 24px', marginBottom: '40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '2rem', filter: 'drop-shadow(0 0 15px #b026ff)' }}>⚔️</span>
          <h1 className="glow-text" style={{ fontSize: '1.6rem', background: 'linear-gradient(90deg, #00f0ff, #b026ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            VALQUÍRIA
          </h1>
          <span style={{ fontSize: '0.6rem', color: '#00f0ff', opacity: 0.5, fontFamily: 'Orbitron', letterSpacing: '2px' }}>
            PROMPT GENERATOR
          </span>
        </div>
        <span className="pulse-glow" style={{ color: '#00f0ff', fontSize: '0.6rem', fontFamily: 'Orbitron' }}>
          ● ONLINE
        </span>
      </header>

      <div className="neon-card fade-in-up" style={{ padding: '32px', borderRadius: '12px' }}>
        <h2 className="glow-text" style={{ fontSize: '1.3rem', color: '#00f0ff', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '1.8rem' }}>⚡</span> GERAR PROMPT PARA SITE
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* Link do Google Maps */}
          <div>
            <label style={{ fontSize: '0.65rem', color: '#888', fontFamily: 'Orbitron', display: 'block', marginBottom: '6px', letterSpacing: '1px' }}>
              🔗 LINK DO GOOGLE MAPS
            </label>
            <div style={{ display: 'flex', gap: '12px' }}>
              <input
                type="text"
                className="input-neon"
                value={mapsLink}
                onChange={(e) => setMapsLink(e.target.value)}
                placeholder="Cole o link do Google Maps (ex: https://maps.app.goo.gl/...)"
                style={{ flex: 1 }}
              />
              <button 
                className="btn-neon" 
                onClick={buscarDadosDoLink}
                disabled={carregando}
                style={{ width: 'auto', padding: '12px 24px' }}
              >
                {carregando ? '⏳ BUSCANDO...' : '🔍 BUSCAR'}
              </button>
            </div>
          </div>

          {/* Campos do formulário */}
          <div>
            <label style={{ fontSize: '0.65rem', color: '#888', fontFamily: 'Orbitron', display: 'block', marginBottom: '6px', letterSpacing: '1px' }}>
              NOME DO CLIENTE
            </label>
            <input
              type="text"
              className="input-neon"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Dra. Maria Silva"
            />
          </div>

          <div>
            <label style={{ fontSize: '0.65rem', color: '#888', fontFamily: 'Orbitron', display: 'block', marginBottom: '6px', letterSpacing: '1px' }}>
              SEGMENTO
            </label>
            <input
              type="text"
              className="input-neon"
              value={segmento}
              onChange={(e) => setSegmento(e.target.value)}
              placeholder="Ex: Advogado Trabalhista, Dentista, Imobiliária..."
            />
          </div>

          <div>
            <label style={{ fontSize: '0.65rem', color: '#888', fontFamily: 'Orbitron', display: 'block', marginBottom: '6px', letterSpacing: '1px' }}>
              DIFERENCIAL
            </label>
            <input
              type="text"
              className="input-neon"
              value={diferencial}
              onChange={(e) => setDiferencial(e.target.value)}
              placeholder="Ex: 20 anos de experiência, especialista em..."
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '0.65rem', color: '#888', fontFamily: 'Orbitron', display: 'block', marginBottom: '6px', letterSpacing: '1px' }}>
                ENDEREÇO
              </label>
              <input
                type="text"
                className="input-neon"
                value={endereco}
                onChange={(e) => setEndereco(e.target.value)}
                placeholder="Av. Paulista, 1000"
              />
            </div>
            <div>
              <label style={{ fontSize: '0.65rem', color: '#888', fontFamily: 'Orbitron', display: 'block', marginBottom: '6px', letterSpacing: '1px' }}>
                TELEFONE
              </label>
              <input
                type="text"
                className="input-neon"
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
                placeholder="(11) 99999-9999"
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.65rem', color: '#888', fontFamily: 'Orbitron', display: 'block', marginBottom: '6px', letterSpacing: '1px' }}>
              IMAGENS (URLs separadas por vírgula)
            </label>
            <input
              type="text"
              className="input-neon"
              value={imagens}
              onChange={(e) => setImagens(e.target.value)}
              placeholder="https://instagram.com/foto1, https://instagram.com/foto2"
            />
          </div>

          <button className="btn-neon" onClick={gerarPrompt} style={{ marginTop: '8px' }}>
            ⚡ GERAR PROMPT
          </button>

          {prompt && (
            <div style={{ marginTop: '32px', animation: 'fadeInUp 0.5s ease-out' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <label style={{ fontSize: '0.7rem', color: '#b026ff', fontFamily: 'Orbitron', letterSpacing: '1px' }}>
                  📋 PROMPT GERADO
                </label>
                <button
                  className="btn-neon btn-neon-purple"
                  onClick={copiarPrompt}
                  style={{ padding: '8px 20px', fontSize: '0.7rem', width: 'auto' }}
                >
                  {copiado ? '✅ COPIADO!' : '📋 COPIAR'}
                </button>
              </div>
              <textarea
                className="textarea-neon typing-effect"
                value={prompt}
                readOnly
                rows={14}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
