import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { supabase } from '../src/lib/supabase';
import { FARVER } from '../src/theme';

type BrugerRaekke = {
  username: string;
  antal_vurderinger: number;
};

export default function SoegScreen() {
  const [soegeTekst, setSoegeTekst] = useState('');
  const [topBrugere, setTopBrugere] = useState<BrugerRaekke[]>([]);
  const [soegResultater, setSoegResultater] = useState<BrugerRaekke[]>([]);
  const [indlaeser, setIndlaeser] = useState(false);

  useEffect(() => {
    hentTopBrugere();
  }, []);

  useEffect(() => {
    if (soegeTekst.trim().length === 0) {
      setSoegResultater([]);
      return;
    }
    const timer = setTimeout(() => soegBrugere(soegeTekst.trim()), 300);
    return () => clearTimeout(timer);
  }, [soegeTekst]);

  async function hentTopBrugere() {
    setIndlaeser(true);
    const { data, error } = await supabase
      .from('bruger_kaffe_antal')
      .select('username, antal_vurderinger')
      .order('antal_vurderinger', { ascending: false })
      .limit(10);
    if (!error && data) setTopBrugere(data);
    setIndlaeser(false);
  }

  async function soegBrugere(tekst: string) {
    const { data, error } = await supabase
      .from('bruger_kaffe_antal')
      .select('username, antal_vurderinger')
      .ilike('username', `%${tekst}%`)
      .order('antal_vurderinger', { ascending: false })
      .limit(20);
    if (!error && data) setSoegResultater(data);
  }

  const visData = soegeTekst.trim().length > 0 ? soegResultater : topBrugere;

  return (
    <View style={styles.container}>
      <View style={styles.soegContainer}>
        <TextInput
          style={styles.soegFelt}
          placeholder="Søg på brugernavn..."
          placeholderTextColor={FARVER.tekstSekund}
          value={soegeTekst}
          onChangeText={setSoegeTekst}
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      {soegeTekst.trim().length === 0 && (
        <Text style={styles.sektionTitel}>Top 10 kaffedrikere</Text>
      )}

      {indlaeser ? (
        <ActivityIndicator color={FARVER.kaffeAccent} style={{ marginTop: 32 }} />
      ) : (
        <FlatList
          data={visData}
          keyExtractor={item => item.username}
          renderItem={({ item, index }) => (
            <View style={styles.brugerRaekke}>
              {soegeTekst.trim().length === 0 && (
                <Text style={styles.placering}>#{index + 1}</Text>
              )}
              <View style={styles.brugerInfo}>
                <Text style={styles.brugernavn}>{item.username}</Text>
                <Text style={styles.antal}>{item.antal_vurderinger} kaffe{item.antal_vurderinger !== 1 ? 'r' : ''} smagt</Text>
              </View>
              <Text style={styles.kaffeEmoji}>☕</Text>
            </View>
          )}
          ListEmptyComponent={
            soegeTekst.trim().length > 0 ? (
              <Text style={styles.ingenResultater}>Ingen brugere fundet</Text>
            ) : null
          }
          contentContainerStyle={styles.liste}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: FARVER.baggrund,
  },
  soegContainer: {
    backgroundColor: FARVER.kaffe,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  soegFelt: {
    backgroundColor: FARVER.kortBaggrund,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 16,
    color: FARVER.tekst,
  },
  sektionTitel: {
    fontSize: 13,
    fontWeight: '700',
    color: FARVER.tekstSekund,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginHorizontal: 16,
    marginTop: 20,
    marginBottom: 8,
  },
  liste: {
    paddingBottom: 32,
  },
  brugerRaekke: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: FARVER.kortBaggrund,
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: FARVER.border,
  },
  placering: {
    fontSize: 16,
    fontWeight: '800',
    color: FARVER.kaffeAccent,
    width: 36,
  },
  brugerInfo: {
    flex: 1,
  },
  brugernavn: {
    fontSize: 16,
    fontWeight: '600',
    color: FARVER.tekst,
  },
  antal: {
    fontSize: 13,
    color: FARVER.tekstSekund,
    marginTop: 2,
  },
  kaffeEmoji: {
    fontSize: 20,
  },
  ingenResultater: {
    textAlign: 'center',
    color: FARVER.tekstSekund,
    marginTop: 40,
    fontSize: 16,
  },
});
