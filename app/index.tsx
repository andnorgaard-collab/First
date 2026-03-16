import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Alert,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { KaffeKort } from '../src/components/KaffeKort';
import { hentAlleVurderinger, sletVurdering } from '../src/storage/storage';
import { KaffeVurdering, SmagsProfil, SMAGSNAVNE } from '../src/types';
import { FARVER, SKYGGE } from '../src/theme';

function gennemsnit(tal: number[]): number {
  if (tal.length === 0) return 0;
  return tal.reduce((a, b) => a + b, 0) / tal.length;
}

function scorefarve(score: number): string {
  if (score >= 8) return FARVER.groen;
  if (score >= 6) return FARVER.kaffeAccent;
  if (score >= 4) return FARVER.syre;
  return FARVER.roed;
}

const SMAGS_FARVER: Record<keyof SmagsProfil, string> = {
  syre: FARVER.syre,
  bitterhed: FARVER.bitterhed,
  soedme: FARVER.soedme,
  fylde: FARVER.fylde,
  aroma: FARVER.aroma,
  eftersmag: FARVER.eftersmag,
};

function ProfilHeader({ vurderinger }: { vurderinger: KaffeVurdering[] }) {
  const router = useRouter();

  if (vurderinger.length === 0) {
    return (
      <View style={headerStyles.tomContainer}>
        <Text style={headerStyles.tomEmoji}>☕</Text>
        <Text style={headerStyles.tomTitel}>Velkommen til Kaffeklub!</Text>
        <Text style={headerStyles.tomTekst}>
          Tilføj din første kaffevurdering og begynd at kortlægge din smagsprofil.
        </Text>
        <TouchableOpacity
          style={headerStyles.ctaKnap}
          onPress={() => router.push('/ny')}
        >
          <Text style={headerStyles.ctaKnapTekst}>☕ Tilføj første kaffe</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const smagsGennemsnit = (Object.keys(SMAGSNAVNE) as Array<keyof SmagsProfil>).reduce(
    (acc, felt) => {
      acc[felt] = gennemsnit(vurderinger.map(v => v.smag[felt]));
      return acc;
    },
    {} as Record<keyof SmagsProfil, number>
  );

  const sorteretSmag = (Object.entries(smagsGennemsnit) as Array<[keyof SmagsProfil, number]>)
    .sort(([, a], [, b]) => b - a);
  const topSmag = sorteretSmag[0];
  const andenSmag = sorteretSmag[1];

  const gnsScore = gennemsnit(vurderinger.map(v => v.samletScore));
  const bedsteScore = Math.max(...vurderinger.map(v => v.samletScore));

  // Risteringsgrad-præferencer
  const risterPraef: Record<string, { antal: number; gnsScore: number }> = {};
  for (const v of vurderinger) {
    if (!risterPraef[v.risteringsgrad]) risterPraef[v.risteringsgrad] = { antal: 0, gnsScore: 0 };
    risterPraef[v.risteringsgrad].antal += 1;
    risterPraef[v.risteringsgrad].gnsScore += v.samletScore;
  }
  for (const grad of Object.keys(risterPraef)) {
    risterPraef[grad].gnsScore = risterPraef[grad].gnsScore / risterPraef[grad].antal;
  }
  const bedsteRister = Object.entries(risterPraef).sort(([, a], [, b]) => b.gnsScore - a.gnsScore)[0];

  // Brygmetode-præferencer
  const brygPraef: Record<string, { antal: number; gnsScore: number }> = {};
  for (const v of vurderinger) {
    if (!brygPraef[v.brygmetode]) brygPraef[v.brygmetode] = { antal: 0, gnsScore: 0 };
    brygPraef[v.brygmetode].antal += 1;
    brygPraef[v.brygmetode].gnsScore += v.samletScore;
  }
  for (const metode of Object.keys(brygPraef)) {
    brygPraef[metode].gnsScore = brygPraef[metode].gnsScore / brygPraef[metode].antal;
  }
  const bedsteBryg = Object.entries(brygPraef).sort(([, a], [, b]) => b.gnsScore - a.gnsScore)[0];

  return (
    <View>
      {/* Smagsprofil-header */}
      <View style={headerStyles.profilBaggrund}>
        <Text style={headerStyles.titel}>Din smagsprofil</Text>
        <Text style={headerStyles.underTitel}>
          Baseret på {vurderinger.length} vurdering{vurderinger.length !== 1 ? 'er' : ''}
        </Text>
        <View style={headerStyles.profilTekstBoks}>
          <Text style={headerStyles.profilTekst}>
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

        {/* Stats-række */}
        <View style={headerStyles.statsRaekke}>
          <View style={headerStyles.statKort}>
            <Text style={headerStyles.statTal}>{vurderinger.length}</Text>
            <Text style={headerStyles.statLabel}>Kaffer smagt</Text>
          </View>
          <View style={headerStyles.statDeler} />
          <View style={headerStyles.statKort}>
            <Text style={headerStyles.statTal}>{gnsScore.toFixed(1)}</Text>
            <Text style={headerStyles.statLabel}>Gns. score</Text>
          </View>
          <View style={headerStyles.statDeler} />
          <View style={headerStyles.statKort}>
            <Text style={headerStyles.statTal}>{bedsteScore}</Text>
            <Text style={headerStyles.statLabel}>Bedste score</Text>
          </View>
        </View>
      </View>

      {/* Præferencer */}
      <View style={[headerStyles.sektion, SKYGGE.lille]}>
        <Text style={headerStyles.sektionTitel}>Dine præferencer</Text>
        <View style={headerStyles.praefRaekke}>
          <View style={[headerStyles.praefKort, { backgroundColor: FARVER.kaffe }]}>
            <Text style={headerStyles.praefEmoji}>🔥</Text>
            <Text style={headerStyles.praefLabel}>Bedste ristering</Text>
            <Text style={headerStyles.praefVaerdi}>{bedsteRister?.[0] ?? '–'}</Text>
            {bedsteRister && (
              <Text style={headerStyles.praefScore}>{bedsteRister[1].gnsScore.toFixed(1)}/10 gns.</Text>
            )}
          </View>
          <View style={[headerStyles.praefKort, { backgroundColor: FARVER.kaffeAccent }]}>
            <Text style={headerStyles.praefEmoji}>☕</Text>
            <Text style={headerStyles.praefLabel}>Bedste brygmetode</Text>
            <Text style={headerStyles.praefVaerdi}>{bedsteBryg?.[0] ?? '–'}</Text>
            {bedsteBryg && (
              <Text style={headerStyles.praefScore}>{bedsteBryg[1].gnsScore.toFixed(1)}/10 gns.</Text>
            )}
          </View>
        </View>
      </View>

      {/* Tilføj kaffe CTA */}
      <View style={headerStyles.ctaContainer}>
        <TouchableOpacity
          style={headerStyles.ctaKnap}
          onPress={() => router.push('/ny')}
        >
          <Text style={headerStyles.ctaKnapTekst}>+ Tilføj ny kaffe</Text>
        </TouchableOpacity>
      </View>

      {/* Liste-overskrift */}
      <Text style={headerStyles.listeOverskrift}>Mine kaffer</Text>
    </View>
  );
}

export default function HomeScreen() {
  const [vurderinger, setVurderinger] = useState<KaffeVurdering[]>([]);
  const [indlaeser, setIndlaeser] = useState(false);
  const router = useRouter();

  const indlaes = useCallback(async () => {
    setIndlaeser(true);
    const data = await hentAlleVurderinger();
    setVurderinger(data);
    setIndlaeser(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      indlaes();
    }, [indlaes])
  );

  const haandterSlet = (id: string, navn: string) => {
    Alert.alert(
      'Slet vurdering',
      `Er du sikker på at du vil slette "${navn}"?`,
      [
        { text: 'Annuller', style: 'cancel' },
        {
          text: 'Slet',
          style: 'destructive',
          onPress: async () => {
            await sletVurdering(id);
            await indlaes();
          },
        },
      ]
    );
  };

  return (
    <FlatList
      style={styles.container}
      data={vurderinger}
      keyExtractor={item => item.id}
      renderItem={({ item }) => (
        <KaffeKort
          vurdering={item}
          onTryk={() => router.push({ pathname: '/ny', params: { id: item.id } })}
          onSlet={() => haandterSlet(item.id, item.navn)}
        />
      )}
      ListHeaderComponent={<ProfilHeader vurderinger={vurderinger} />}
      refreshControl={
        <RefreshControl refreshing={indlaeser} onRefresh={indlaes} tintColor={FARVER.kaffeAccent} />
      }
      contentContainerStyle={styles.listeIndhold}
      showsVerticalScrollIndicator={false}
    />
  );
}

const headerStyles = StyleSheet.create({
  profilBaggrund: {
    backgroundColor: FARVER.kaffe,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  titel: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFF',
    marginBottom: 4,
  },
  underTitel: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 12,
  },
  profilTekstBoks: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  profilTekst: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 22,
  },
  statsRaekke: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statKort: {
    alignItems: 'center',
  },
  statTal: {
    fontSize: 26,
    fontWeight: '800',
    color: FARVER.kaffeAccent,
  },
  statLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
  },
  statDeler: {
    width: 1,
    height: 36,
    backgroundColor: 'rgba(255,255,255,0.2)',
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
    fontSize: 16,
    fontWeight: '700',
    color: FARVER.kaffe,
    marginBottom: 12,
  },
  praefRaekke: {
    flexDirection: 'row',
    gap: 12,
  },
  praefKort: {
    flex: 1,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  praefEmoji: {
    fontSize: 22,
    marginBottom: 4,
  },
  praefLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginBottom: 4,
  },
  praefVaerdi: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFF',
    textAlign: 'center',
  },
  praefScore: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
  },
  ctaContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  ctaKnap: {
    backgroundColor: FARVER.kaffeAccent,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  ctaKnapTekst: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  listeOverskrift: {
    fontSize: 18,
    fontWeight: '700',
    color: FARVER.kaffe,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 4,
  },
  tomContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingVertical: 80,
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
    marginBottom: 32,
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: FARVER.baggrund,
  },
  listeIndhold: {
    paddingBottom: 32,
  },
});
