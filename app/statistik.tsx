import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { hentAlleVurderinger } from '../src/storage/storage';
import { KaffeVurdering, SmagsProfil, SMAGSNAVNE } from '../src/types';
import { FARVER, SKYGGE } from '../src/theme';

function gennemsnit(tal: number[]): number {
  if (tal.length === 0) return 0;
  return tal.reduce((a, b) => a + b, 0) / tal.length;
}

function SmagsProfilBar({
  label,
  vaerdi,
  max = 10,
  farve,
}: {
  label: string;
  vaerdi: number;
  max?: number;
  farve: string;
}) {
  const procent = (vaerdi / max) * 100;
  return (
    <View style={barStyles.container}>
      <View style={barStyles.labelRaekke}>
        <Text style={barStyles.label}>{label}</Text>
        <Text style={[barStyles.vaerdi, { color: farve }]}>{vaerdi.toFixed(1)}</Text>
      </View>
      <View style={barStyles.spor}>
        <View style={[barStyles.fyldning, { width: `${procent}%`, backgroundColor: farve }]} />
      </View>
    </View>
  );
}

const barStyles = StyleSheet.create({
  container: { marginBottom: 12 },
  labelRaekke: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  label: { fontSize: 14, fontWeight: '600', color: FARVER.tekst },
  vaerdi: { fontSize: 14, fontWeight: '700' },
  spor: {
    height: 12,
    backgroundColor: FARVER.kaffeLys,
    borderRadius: 6,
    overflow: 'hidden',
  },
  fyldning: { height: '100%', borderRadius: 6 },
});

const SMAGS_FARVER: Record<keyof SmagsProfil, string> = {
  syre: FARVER.syre,
  bitterhed: FARVER.bitterhed,
  soedme: FARVER.soedme,
  fylde: FARVER.fylde,
  aroma: FARVER.aroma,
  eftersmag: FARVER.eftersmag,
};

export default function StatistikScreen() {
  const [vurderinger, setVurderinger] = useState<KaffeVurdering[]>([]);

  useFocusEffect(
    useCallback(() => {
      hentAlleVurderinger().then(setVurderinger);
    }, [])
  );

  if (vurderinger.length === 0) {
    return (
      <View style={styles.tom}>
        <Text style={styles.tomEmoji}>📊</Text>
        <Text style={styles.tomTitel}>Ingen data endnu</Text>
        <Text style={styles.tomTekst}>
          Tilføj mindst én kaffevurdering for at se din smagsprofil.
        </Text>
      </View>
    );
  }

  // Beregn gennemsnit for alle smagsdimensioner
  const smagsGennemsnit = (Object.keys(SMAGSNAVNE) as Array<keyof SmagsProfil>).reduce(
    (acc, felt) => {
      acc[felt] = gennemsnit(vurderinger.map(v => v.smag[felt]));
      return acc;
    },
    {} as Record<keyof SmagsProfil, number>
  );

  // Find dominerende smagsnoter
  const sorteretSmag = (Object.entries(smagsGennemsnit) as Array<[keyof SmagsProfil, number]>)
    .sort(([, a], [, b]) => b - a);

  const topSmag = sorteretSmag[0];
  const andenSmag = sorteretSmag[1];

  // Top-kaffer
  const topKaffer = [...vurderinger]
    .sort((a, b) => b.samletScore - a.samletScore)
    .slice(0, 5);

  // Risteringsgrad-præferencer
  const risterPraef: Record<string, { antal: number; gnsScore: number }> = {};
  for (const v of vurderinger) {
    if (!risterPraef[v.risteringsgrad]) {
      risterPraef[v.risteringsgrad] = { antal: 0, gnsScore: 0 };
    }
    risterPraef[v.risteringsgrad].antal += 1;
    risterPraef[v.risteringsgrad].gnsScore += v.samletScore;
  }
  for (const grad of Object.keys(risterPraef)) {
    risterPraef[grad].gnsScore = risterPraef[grad].gnsScore / risterPraef[grad].antal;
  }
  const bedsteRister = Object.entries(risterPraef).sort(
    ([, a], [, b]) => b.gnsScore - a.gnsScore
  )[0];

  // Brygmetode-præferencer
  const brygPraef: Record<string, { antal: number; gnsScore: number }> = {};
  for (const v of vurderinger) {
    if (!brygPraef[v.brygmetode]) {
      brygPraef[v.brygmetode] = { antal: 0, gnsScore: 0 };
    }
    brygPraef[v.brygmetode].antal += 1;
    brygPraef[v.brygmetode].gnsScore += v.samletScore;
  }
  for (const metode of Object.keys(brygPraef)) {
    brygPraef[metode].gnsScore = brygPraef[metode].gnsScore / brygPraef[metode].antal;
  }
  const bedsteBryg = Object.entries(brygPraef).sort(
    ([, a], [, b]) => b.gnsScore - a.gnsScore
  )[0];

  const gnsScore = gennemsnit(vurderinger.map(v => v.samletScore));

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Smagsprofil-oversigt */}
      <View style={styles.smagsProfil}>
        <Text style={styles.smags}>Din smagsprofil</Text>
        <Text style={styles.smagsUnder}>
          Baseret på {vurderinger.length} vurdering{vurderinger.length !== 1 ? 'er' : ''}
        </Text>
        <View style={styles.profilContainer}>
          <Text style={styles.profilText}>
            Du foretrækker kaffe med{' '}
            <Text style={{ color: SMAGS_FARVER[topSmag[0]], fontWeight: '700' }}>
              {SMAGSNAVNE[topSmag[0]].toLowerCase()} ({topSmag[1].toFixed(1)}/10)
            </Text>
            {andenSmag && (
              <>
                {' '}og{' '}
                <Text style={{ color: SMAGS_FARVER[andenSmag[0]], fontWeight: '700' }}>
                  {SMAGSNAVNE[andenSmag[0]].toLowerCase()} ({andenSmag[1].toFixed(1)}/10)
                </Text>
              </>
            )}
            {' '}som fremtrædende egenskaber.
          </Text>
        </View>
      </View>

      {/* Smagsdimensioner */}
      <View style={[styles.sektion, SKYGGE.lille]}>
        <Text style={styles.sektionTitel}>Gennemsnitlig smagsprofil</Text>
        {(Object.keys(SMAGSNAVNE) as Array<keyof SmagsProfil>).map(felt => (
          <SmagsProfilBar
            key={felt}
            label={SMAGSNAVNE[felt]}
            vaerdi={smagsGennemsnit[felt]}
            farve={SMAGS_FARVER[felt]}
          />
        ))}
      </View>

      {/* Præferencer */}
      <View style={[styles.sektion, SKYGGE.lille]}>
        <Text style={styles.sektionTitel}>Dine præferencer</Text>
        <View style={styles.praefRaekke}>
          <View style={[styles.praefKort, { backgroundColor: FARVER.kaffe }]}>
            <Text style={styles.praefEmoji}>🔥</Text>
            <Text style={styles.praefLabel}>Bedste ristering</Text>
            <Text style={styles.praefVaerdi}>{bedsteRister?.[0] ?? '–'}</Text>
            {bedsteRister && (
              <Text style={styles.praefScore}>{bedsteRister[1].gnsScore.toFixed(1)}/10 gns.</Text>
            )}
          </View>
          <View style={[styles.praefKort, { backgroundColor: FARVER.kaffeAccent }]}>
            <Text style={styles.praefEmoji}>☕</Text>
            <Text style={styles.praefLabel}>Bedste brygmetode</Text>
            <Text style={styles.praefVaerdi}>{bedsteBryg?.[0] ?? '–'}</Text>
            {bedsteBryg && (
              <Text style={styles.praefScore}>{bedsteBryg[1].gnsScore.toFixed(1)}/10 gns.</Text>
            )}
          </View>
        </View>
        <View style={[styles.praefKort, styles.praefKortFuld, { backgroundColor: FARVER.kaffeLight }]}>
          <Text style={styles.praefEmoji}>⭐</Text>
          <Text style={styles.praefLabel}>Samlet gennemsnitsscore</Text>
          <Text style={styles.praefVaerdi}>{gnsScore.toFixed(1)}/10</Text>
        </View>
      </View>

      {/* Top-5 kaffer */}
      <View style={[styles.sektion, SKYGGE.lille]}>
        <Text style={styles.sektionTitel}>Dine bedste kaffer</Text>
        {topKaffer.map((v, i) => (
          <View key={v.id} style={styles.topKaffeRaekke}>
            <Text style={styles.topNummer}>#{i + 1}</Text>
            <View style={styles.topKaffeInfo}>
              <Text style={styles.topKaffeNavn} numberOfLines={1}>{v.navn}</Text>
              <Text style={styles.topKaffeMeta}>{v.oprindelse} · {v.brygmetode}</Text>
            </View>
            <View style={[styles.topScore, { backgroundColor: scorefarve(v.samletScore) }]}>
              <Text style={styles.topScoreTekst}>{v.samletScore}</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

function scorefarve(score: number): string {
  if (score >= 8) return FARVER.groen;
  if (score >= 6) return FARVER.kaffeAccent;
  if (score >= 4) return FARVER.syre;
  return FARVER.roed;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: FARVER.baggrund,
  },
  smagsProfil: {
    backgroundColor: FARVER.kaffe,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  smags: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFF',
    marginBottom: 4,
  },
  smagsUnder: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 12,
  },
  profilContainer: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 12,
  },
  profilText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 22,
  },
  sektion: {
    backgroundColor: FARVER.kortBaggrund,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: FARVER.border,
  },
  sektionTitel: {
    fontSize: 18,
    fontWeight: '700',
    color: FARVER.kaffe,
    marginBottom: 16,
  },
  praefRaekke: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  praefKort: {
    flex: 1,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  praefKortFuld: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  praefEmoji: {
    fontSize: 24,
    marginBottom: 6,
  },
  praefLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginBottom: 4,
  },
  praefVaerdi: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFF',
    textAlign: 'center',
  },
  praefScore: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
  },
  topKaffeRaekke: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: FARVER.border,
  },
  topNummer: {
    fontSize: 16,
    fontWeight: '800',
    color: FARVER.kaffeAccent,
    width: 36,
  },
  topKaffeInfo: {
    flex: 1,
    marginRight: 12,
  },
  topKaffeNavn: {
    fontSize: 15,
    fontWeight: '600',
    color: FARVER.tekst,
  },
  topKaffeMeta: {
    fontSize: 12,
    color: FARVER.tekstSekund,
  },
  topScore: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  topScoreTekst: {
    color: '#FFF',
    fontWeight: '800',
    fontSize: 16,
  },
  tom: {
    flex: 1,
    backgroundColor: FARVER.baggrund,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  tomEmoji: {
    fontSize: 72,
    marginBottom: 16,
  },
  tomTitel: {
    fontSize: 24,
    fontWeight: '700',
    color: FARVER.tekst,
    marginBottom: 12,
    textAlign: 'center',
  },
  tomTekst: {
    fontSize: 16,
    color: FARVER.tekstSekund,
    textAlign: 'center',
    lineHeight: 24,
  },
});
