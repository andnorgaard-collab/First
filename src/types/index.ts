export interface SmagsProfil {
  syre: number;       // Acidity 1-10
  bitterhed: number;  // Bitterness 1-10
  soedme: number;     // Sweetness 1-10
  fylde: number;      // Body 1-10
  aroma: number;      // Aroma 1-10
  eftersmag: number;  // Aftertaste 1-10
}

export interface KaffeVurdering {
  id: string;
  navn: string;           // Coffee name
  oprindelse: string;     // Origin/country
  risteringsgrad: 'Lys' | 'Medium' | 'Mørk' | 'Espresso';
  brygmetode: string;     // Brew method
  smag: SmagsProfil;
  samletScore: number;    // Overall score 1-10
  noter: string;          // Free text notes
  dato: string;           // ISO date string
  vurderedeAf: string;    // Rated by (name)
}

export type RisteringsGrad = 'Lys' | 'Medium' | 'Mørk' | 'Espresso';

export const BRYGMETODER = [
  'Filterkaffe',
  'Espresso',
  'Moka Pot',
  'French Press',
  'Pour Over',
  'AeroPress',
  'Cold Brew',
  'Kapselmaskine',
];

export const SMAGSNAVNE: Record<keyof SmagsProfil, string> = {
  syre: 'Syre',
  bitterhed: 'Bitterhed',
  soedme: 'Sødme',
  fylde: 'Fylde',
  aroma: 'Aroma',
  eftersmag: 'Eftersmag',
};

export const SMAGSBESKRIVELSER: Record<keyof SmagsProfil, string> = {
  syre: 'Frisk og levende syre',
  bitterhed: 'Behagelig bitterhed',
  soedme: 'Naturlig sødme',
  fylde: 'Kaffens krop og tykkelse',
  aroma: 'Duft og aroma',
  eftersmag: 'Lang og god eftersmag',
};
