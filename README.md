# ☕ Kaffeklub - Smagsregistrering

En iPhone-app til kaffeklubber, der ønsker at kortlægge og sammenligne kaffe-smagsprofiler.

## Funktioner

### 📋 Mine kaffer
- Liste over alle vurderede kaffer med smagsoversigt
- Hurtig adgang til score og oprindelse
- Slet eller rediger eksisterende vurderinger

### ➕ Tilføj kaffe
Registrer en ny kaffe med:
- **Kaffe-info**: Navn, oprindelse, risteringsgrad (Lys/Medium/Mørk/Espresso), brygmetode
- **6 smagsdimensioner** på skala 1-10:
  - Syre – frisk og levende syre
  - Bitterhed – behagelig bitterhed
  - Sødme – naturlig sødme
  - Fylde – kaffens krop og tykkelse
  - Aroma – duft og aroma
  - Eftersmag – lang og god eftersmag
- **Samlet vurdering** 1-10 (Hvor godt kan du lide den?)
- **Personlige noter**

### 📊 Smagsprofil
- Din gennemsnitlige smagsprofil baseret på alle vurderinger
- Automatisk detekterede præferencer (risteringsgrad, brygmetode)
- Top-5 bedste kaffer
- Samlet gennemsnitsscore

## Kom i gang

### Installation
```bash
npm install
npx expo start
```

### Til iPhone
1. Download **Expo Go** fra App Store
2. Scan QR-koden der vises i terminalen
3. Appen kører direkte på din iPhone!

### Til produktion (App Store)
```bash
npx expo build:ios
```
Kræver Apple Developer konto.

## Brygmetoder der understøttes
Filterkaffe, Espresso, Moka Pot, French Press, Pour Over, AeroPress, Cold Brew, Kapselmaskine

## Teknisk stack
- **Expo** (React Native) med TypeScript
- **expo-router** til navigation
- **AsyncStorage** til lokal datalagring (ingen server nødvendig)
- Kører på iOS og Android
