/**
 * REGIONAL ZONES CONFIGURATION
 * Central configuration for all monitoring zones across Peru and Chile
 * Maps regions to upwelling points and monitoring coordinates
 */

export interface RegionalZone {
  id: string
  nombre: string
  pais: 'Peru' | 'Chile'
  region: string
  lat: number
  lon: number
  tipo: 'puerto' | 'cultivo' | 'referencia'
  upwellingPoint: string // NOAA point ID (e.g., "150", "160")
  cultivos: string[] // Tipos de cultivos
}

export interface Region {
  id: string
  nombre: string
  pais: 'Peru' | 'Chile'
  upwellingPoint: string
  descripcion: string
  zonas: RegionalZone[]
}

// ZONAS DE PERÚ - PRINCIPALES
const PERU_NORTE: RegionalZone[] = [
  {
    id: 'peru_tumbes',
    nombre: 'Tumbes',
    pais: 'Peru',
    region: 'Perú Norte',
    lat: -3.57,
    lon: -80.45,
    tipo: 'puerto',
    upwellingPoint: '161',
    cultivos: ['Ostras', 'Concha negra']
  },
  {
    id: 'peru_piura',
    nombre: 'Piura (Paita)',
    pais: 'Peru',
    region: 'Perú Norte',
    lat: -5.20,
    lon: -80.63,
    tipo: 'cultivo',
    upwellingPoint: '161',
    cultivos: ['Concha negra', 'Choritos']
  },
  {
    id: 'peru_paita',
    nombre: 'Paita',
    pais: 'Peru',
    region: 'Perú Norte',
    lat: -5.09,
    lon: -81.11,
    tipo: 'puerto',
    upwellingPoint: '161',
    cultivos: ['Moluscos varios']
  }
]

const PERU_CENTRAL: RegionalZone[] = [
  {
    id: 'peru_callao',
    nombre: 'Callao',
    pais: 'Peru',
    region: 'Perú Central',
    lat: -12.05,
    lon: -77.12,
    tipo: 'puerto',
    upwellingPoint: '160',
    cultivos: ['Ostras', 'Choros', 'Almejas']
  },
  {
    id: 'peru_paracas',
    nombre: 'Paracas (Ica)',
    pais: 'Peru',
    region: 'Perú Central',
    lat: -13.53,
    lon: -76.13,
    tipo: 'cultivo',
    upwellingPoint: '160',
    cultivos: ['Concha negra', 'Ostras en balsas']
  },
  {
    id: 'peru_chincha',
    nombre: 'Chincha',
    pais: 'Peru',
    region: 'Perú Central',
    lat: -13.42,
    lon: -76.14,
    tipo: 'cultivo',
    upwellingPoint: '160',
    cultivos: ['Concha negra', 'Choritos']
  }
]

const PERU_SUR: RegionalZone[] = [
  {
    id: 'peru_moquegua',
    nombre: 'Moquegua',
    pais: 'Peru',
    region: 'Perú Sur',
    lat: -17.19,
    lon: -70.94,
    tipo: 'cultivo',
    upwellingPoint: '151',
    cultivos: ['Mariscos varios']
  },
  {
    id: 'peru_tacna',
    nombre: 'Tacna',
    pais: 'Peru',
    region: 'Perú Sur',
    lat: -18.01,
    lon: -70.25,
    tipo: 'puerto',
    upwellingPoint: '151',
    cultivos: ['Concha negra']
  }
]

// ZONAS DE CHILE - REGIÓN DE LOS LAGOS
const CHILE_LAGOS: RegionalZone[] = [
  // Chiloé Norte (ya cubierto)
  {
    id: 'chile_puerto_montt',
    nombre: 'Puerto Montt',
    pais: 'Chile',
    region: 'Los Lagos',
    lat: -41.33,
    lon: -72.76,
    tipo: 'puerto',
    upwellingPoint: '150',
    cultivos: ['Ostras', 'Choros', 'Almejas']
  },
  {
    id: 'chile_calbuco',
    nombre: 'Calbuco',
    pais: 'Chile',
    region: 'Los Lagos',
    lat: -41.77,
    lon: -73.15,
    tipo: 'cultivo',
    upwellingPoint: '150',
    cultivos: ['Ostras', 'Choros']
  },
  {
    id: 'chile_ancud',
    nombre: 'Ancud',
    pais: 'Chile',
    region: 'Los Lagos',
    lat: -41.87,
    lon: -73.82,
    tipo: 'puerto',
    upwellingPoint: '150',
    cultivos: ['Ostras', 'Cholgas']
  },
  {
    id: 'chile_dalcahue',
    nombre: 'Dalcahue',
    pais: 'Chile',
    region: 'Los Lagos',
    lat: -42.39,
    lon: -73.69,
    tipo: 'cultivo',
    upwellingPoint: '150',
    cultivos: ['Ostras', 'Choros']
  },
  {
    id: 'chile_castro',
    nombre: 'Castro',
    pais: 'Chile',
    region: 'Los Lagos',
    lat: -42.48,
    lon: -73.77,
    tipo: 'puerto',
    upwellingPoint: '150',
    cultivos: ['Ostras', 'Choros', 'Almejas']
  },
  {
    id: 'chile_achao',
    nombre: 'Achao',
    pais: 'Chile',
    region: 'Los Lagos',
    lat: -42.45,
    lon: -73.89,
    tipo: 'cultivo',
    upwellingPoint: '150',
    cultivos: ['Ostras', 'Choros']
  },
  {
    id: 'chile_quellon',
    nombre: 'Quellón',
    pais: 'Chile',
    region: 'Los Lagos',
    lat: -43.12,
    lon: -73.62,
    tipo: 'puerto',
    upwellingPoint: '150',
    cultivos: ['Ostras', 'Choros', 'Cholgas']
  },
  {
    id: 'chile_puerto_varas',
    nombre: 'Puerto Varas',
    pais: 'Chile',
    region: 'Los Lagos',
    lat: -41.31,
    lon: -72.37,
    tipo: 'puerto',
    upwellingPoint: '150',
    cultivos: ['Ostras', 'Trucha']
  },
  {
    id: 'chile_la_union',
    nombre: 'La Unión',
    pais: 'Chile',
    region: 'Los Lagos',
    lat: -43.15,
    lon: -72.58,
    tipo: 'cultivo',
    upwellingPoint: '150',
    cultivos: ['Ostras', 'Choros']
  },
  // Chiloé Sur (nuevo)
  {
    id: 'chile_futaleufu',
    nombre: 'Futaleufú',
    pais: 'Chile',
    region: 'Los Lagos',
    lat: -43.85,
    lon: -71.90,
    tipo: 'cultivo',
    upwellingPoint: '151',
    cultivos: ['Ostras', 'Choros']
  },
  {
    id: 'chile_palena',
    nombre: 'Palena',
    pais: 'Chile',
    region: 'Los Lagos',
    lat: -43.80,
    lon: -72.20,
    tipo: 'puerto',
    upwellingPoint: '151',
    cultivos: ['Mariscos']
  }
]

// ZONAS DE CHILE - REGIÓN DE AYSÉN (PATAGONIA NORTE)
const CHILE_AYSEN: RegionalZone[] = [
  {
    id: 'chile_cisnes',
    nombre: 'Cisnes',
    pais: 'Chile',
    region: 'Aysén',
    lat: -43.99,
    lon: -72.41,
    tipo: 'cultivo',
    upwellingPoint: '151',
    cultivos: ['Ostras', 'Choros', 'Salmón']
  },
  {
    id: 'chile_cerro_castillo',
    nombre: 'Cerro Castillo',
    pais: 'Chile',
    region: 'Aysén',
    lat: -44.60,
    lon: -71.87,
    tipo: 'cultivo',
    upwellingPoint: '151',
    cultivos: ['Mariscos']
  },
  {
    id: 'chile_aysen_puerto',
    nombre: 'Puerto Aysén',
    pais: 'Chile',
    region: 'Aysén',
    lat: -45.40,
    lon: -72.67,
    tipo: 'puerto',
    upwellingPoint: '151',
    cultivos: ['Ostras', 'Choros', 'Salmón']
  }
]

// ZONAS DE CHILE - REGIÓN DE MAGALLANES (PATAGONIA SUR)
const CHILE_MAGALLANES: RegionalZone[] = [
  {
    id: 'chile_puerto_natales',
    nombre: 'Puerto Natales',
    pais: 'Chile',
    region: 'Magallanes',
    lat: -51.73,
    lon: -72.51,
    tipo: 'puerto',
    upwellingPoint: '151',
    cultivos: ['Ostras', 'Choros', 'Salmón']
  },
  {
    id: 'chile_punta_arenas',
    nombre: 'Punta Arenas',
    pais: 'Chile',
    region: 'Magallanes',
    lat: -53.16,
    lon: -70.92,
    tipo: 'puerto',
    upwellingPoint: '151',
    cultivos: ['Ostras', 'Moluscos']
  }
]

// ZONAS DE CHILE - REGIÓN DE LOS RÍOS (NORTE)
const CHILE_RIOS: RegionalZone[] = [
  {
    id: 'chile_valdivia',
    nombre: 'Valdivia',
    pais: 'Chile',
    region: 'Los Ríos',
    lat: -39.81,
    lon: -73.25,
    tipo: 'puerto',
    upwellingPoint: '150',
    cultivos: ['Ostras', 'Choros', 'Almejas']
  },
  {
    id: 'chile_pucatrihue',
    nombre: 'Pucatrihue',
    pais: 'Chile',
    region: 'Los Ríos',
    lat: -40.44,
    lon: -73.39,
    tipo: 'cultivo',
    upwellingPoint: '150',
    cultivos: ['Ostras']
  },
  {
    id: 'chile_osorno',
    nombre: 'Osorno',
    pais: 'Chile',
    region: 'Los Ríos',
    lat: -40.58,
    lon: -72.53,
    tipo: 'puerto',
    upwellingPoint: '150',
    cultivos: ['Ostras', 'Choros']
  }
]

// ZONAS DE CHILE - REGIÓN DEL BIOBÍO (CENTRO-SUR)
const CHILE_BIOBIO: RegionalZone[] = [
  {
    id: 'chile_talcahuano',
    nombre: 'Talcahuano',
    pais: 'Chile',
    region: 'Biobío',
    lat: -36.72,
    lon: -72.64,
    tipo: 'puerto',
    upwellingPoint: '145',
    cultivos: ['Choros', 'Ostras', 'Almejas']
  },
  {
    id: 'chile_concepcion',
    nombre: 'Concepción',
    pais: 'Chile',
    region: 'Biobío',
    lat: -36.83,
    lon: -73.04,
    tipo: 'cultivo',
    upwellingPoint: '145',
    cultivos: ['Choros', 'Ostras']
  }
]

// ZONAS DE CHILE - REGIÓN DE LA ARAUCANÍA (CENTRO)
const CHILE_ARAUCANIA: RegionalZone[] = [
  {
    id: 'chile_puerto_saavedra',
    nombre: 'Puerto Saavedra',
    pais: 'Chile',
    region: 'La Araucanía',
    lat: -38.76,
    lon: -73.38,
    tipo: 'cultivo',
    upwellingPoint: '145',
    cultivos: ['Choros', 'Ostras']
  }
]

// REGIONES PRINCIPALES
export const REGIONS: Region[] = [
  {
    id: 'peru_norte',
    nombre: 'Perú - Región Norte',
    pais: 'Peru',
    upwellingPoint: '161',
    descripcion: 'Zona de máximo upwelling. Cultivos de ostras, concha negra, choritos',
    zonas: PERU_NORTE
  },
  {
    id: 'peru_central',
    nombre: 'Perú - Región Central',
    pais: 'Peru',
    upwellingPoint: '160',
    descripcion: 'Mayor producción de moluscos. Bahía de Paracas, Callao, Chincha',
    zonas: PERU_CENTRAL
  },
  {
    id: 'peru_sur',
    nombre: 'Perú - Región Sur',
    pais: 'Peru',
    upwellingPoint: '151',
    descripcion: 'Cultivos de concha negra y mariscos',
    zonas: PERU_SUR
  },
  {
    id: 'chile_lagos',
    nombre: 'Chile - Los Lagos (Chiloé)',
    pais: 'Chile',
    upwellingPoint: '150',
    descripcion: 'Principal zona de cultivo de moluscos en Chile',
    zonas: CHILE_LAGOS
  },
  {
    id: 'chile_aysen',
    nombre: 'Chile - Aysén (Patagonia Norte)',
    pais: 'Chile',
    upwellingPoint: '151',
    descripcion: 'Fjordos productivos con cultivos de ostras y salmón',
    zonas: CHILE_AYSEN
  },
  {
    id: 'chile_magallanes',
    nombre: 'Chile - Magallanes (Patagonia Sur)',
    pais: 'Chile',
    upwellingPoint: '151',
    descripcion: 'Cultivos en fjordos patagónicos',
    zonas: CHILE_MAGALLANES
  },
  {
    id: 'chile_rios',
    nombre: 'Chile - Los Ríos',
    pais: 'Chile',
    upwellingPoint: '150',
    descripcion: 'Cultivos costeros de ostras y choros',
    zonas: CHILE_RIOS
  },
  {
    id: 'chile_biobio',
    nombre: 'Chile - Biobío',
    pais: 'Chile',
    upwellingPoint: '145',
    descripcion: 'Cultivos de choros y ostras en zona central-sur',
    zonas: CHILE_BIOBIO
  },
  {
    id: 'chile_araucania',
    nombre: 'Chile - La Araucanía',
    pais: 'Chile',
    upwellingPoint: '145',
    descripcion: 'Cultivos costeros centro',
    zonas: CHILE_ARAUCANIA
  }
]

// TODAS LAS ZONAS FLATTEN
export function getAllZones(): RegionalZone[] {
  return REGIONS.flatMap(r => r.zonas)
}

// GET ZONES BY REGION ID
export function getRegionZones(regionId: string): RegionalZone[] {
  const region = REGIONS.find(r => r.id === regionId)
  return region?.zonas || []
}

// GET REGION BY ID
export function getRegion(regionId: string): Region | undefined {
  return REGIONS.find(r => r.id === regionId)
}

// GET ALL REGIONS BY COUNTRY
export function getRegionsByCountry(pais: 'Peru' | 'Chile'): Region[] {
  return REGIONS.filter(r => r.pais === pais)
}

// GET UPWELLING POINT FOR REGION
export function getUpwellingPointForRegion(regionId: string): string {
  const region = REGIONS.find(r => r.id === regionId)
  return region?.upwellingPoint || '150' // Default to Chiloé
}
