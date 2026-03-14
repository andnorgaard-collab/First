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
import { KaffeVurdering } from '../src/types';
import { FARVER } from '../src/theme';

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

  if (vurderinger.length === 0 && !indlaeser) {
    return (
      <View style={styles.tom}>
        <Text style={styles.tomEmoji}>☕</Text>
        <Text style={styles.tomTitel}>Ingen kaffer endnu</Text>
        <Text style={styles.tomTekst}>
          Tilføj din første kaffevurdering og begynd at kortlægge din smagsprofil!
        </Text>
        <TouchableOpacity
          style={styles.tilfoejKnap}
          onPress={() => router.push('/ny')}
        >
          <Text style={styles.tilfoejKnapTekst}>Tilføj første kaffe</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const gennemsnit =
    vurderinger.length > 0
      ? (vurderinger.reduce((sum, v) => sum + v.samletScore, 0) / vurderinger.length).toFixed(1)
      : '–';

  return (
    <View style={styles.container}>
      <View style={styles.oversigt}>
        <View style={styles.oversigtKort}>
          <Text style={styles.oversigtTal}>{vurderinger.length}</Text>
          <Text style={styles.oversigtLabel}>Kaffer smagt</Text>
        </View>
        <View style={styles.oversigtDeler} />
        <View style={styles.oversigtKort}>
          <Text style={styles.oversigtTal}>{gennemsnit}</Text>
          <Text style={styles.oversigtLabel}>Gns. score</Text>
        </View>
        <View style={styles.oversigtDeler} />
        <View style={styles.oversigtKort}>
          <Text style={styles.oversigtTal}>
            {vurderinger.length > 0
              ? Math.max(...vurderinger.map(v => v.samletScore))
              : '–'}
          </Text>
          <Text style={styles.oversigtLabel}>Bedste score</Text>
        </View>
      </View>

      <FlatList
        data={vurderinger}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <KaffeKort
            vurdering={item}
            onTryk={() => router.push({ pathname: '/ny', params: { id: item.id } })}
            onSlet={() => haandterSlet(item.id, item.navn)}
          />
        )}
        refreshControl={
          <RefreshControl refreshing={indlaeser} onRefresh={indlaes} tintColor={FARVER.kaffeAccent} />
        }
        contentContainerStyle={styles.liste}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: FARVER.baggrund,
  },
  oversigt: {
    flexDirection: 'row',
    backgroundColor: FARVER.kaffe,
    paddingVertical: 16,
    paddingHorizontal: 24,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  oversigtKort: {
    alignItems: 'center',
  },
  oversigtTal: {
    fontSize: 28,
    fontWeight: '800',
    color: FARVER.kaffeAccent,
  },
  oversigtLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
  },
  oversigtDeler: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  liste: {
    paddingTop: 16,
    paddingBottom: 32,
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
    marginBottom: 32,
  },
  tilfoejKnap: {
    backgroundColor: FARVER.kaffeAccent,
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 14,
  },
  tilfoejKnapTekst: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
