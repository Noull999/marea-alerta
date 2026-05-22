import * as cheerio from 'cheerio'

export interface FANEventoIFOP {
  zona: string
  fecha: string
  especie: string
  toxicidad: number
  notas?: string
}

export async function fetchFANHistoricoIFOP(): Promise<FANEventoIFOP[]> {
  try {
    const res = await fetch('https://www.ifop.cl/', { next: { revalidate: 86400 } })
    if (!res.ok) return []

    const html = await res.text()
    const $ = cheerio.load(html)

    const eventos: FANEventoIFOP[] = []

    // Buscar cualquier tabla o sección con datos de FAN
    $('table tbody tr, div[data-fan] tr').each((_i, row) => {
      const cells = $(row).find('td')
      if (cells.length >= 3) {
        const zonaText = $(cells[0]).text().trim()
        const fechaText = $(cells[1]).text().trim()
        const toxText = $(cells[2]).text().trim()

        if (zonaText && fechaText && toxText) {
          eventos.push({
            zona: zonaText,
            fecha: fechaText,
            especie: 'Moluscos',
            toxicidad: parseFloat(toxText) || 0,
            notas: $(cells[3])?.text()?.trim(),
          })
        }
      }
    })

    return eventos.slice(0, 100) // Últimos 100 registros
  } catch (error) {
    console.error('Error scraping IFOP:', error)
    return []
  }
}

export async function fetchFANPorZonaIFOP(zona: string): Promise<FANEventoIFOP[]> {
  const todos = await fetchFANHistoricoIFOP()
  return todos.filter(e => e.zona.toLowerCase().includes(zona.toLowerCase()))
}
