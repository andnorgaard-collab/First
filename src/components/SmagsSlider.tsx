import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { FARVER } from '../theme';

interface Props {
  label: string;
  beskrivelse: string;
  vaerdi: number;
  farve: string;
  onAendr: (vaerdi: number) => void;
}

export function SmagsSlider({ label, beskrivelse, vaerdi, farve, onAendr }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.label}>{label}</Text>
        <View style={[styles.vaerdiBadge, { backgroundColor: farve }]}>
          <Text style={styles.vaerdiTekst}>{vaerdi}</Text>
        </View>
      </View>
      <Text style={styles.beskrivelse}>{beskrivelse}</Text>
      <View style={styles.skalaContainer}>
        {Array.from({ length: 10 }, (_, i) => i + 1).map(tal => (
          <TouchableOpacity
            key={tal}
            style={[
              styles.skalaKnap,
              tal <= vaerdi && { backgroundColor: farve },
              tal === vaerdi && styles.aktivKnap,
            ]}
            onPress={() => onAendr(tal)}
            activeOpacity={0.7}
          >
            <Text style={[styles.skalaTekst, tal <= vaerdi && styles.aktivSkalaTekst]}>
              {tal}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={styles.etiketter}>
        <Text style={styles.etiketTekst}>Svag</Text>
        <Text style={styles.etiketTekst}>Intens</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
    backgroundColor: FARVER.kortBaggrund,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: FARVER.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  label: {
    fontSize: 16,
    fontWeight: '700',
    color: FARVER.tekst,
  },
  vaerdiBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  vaerdiTekst: {
    color: '#FFF',
    fontWeight: '800',
    fontSize: 14,
  },
  beskrivelse: {
    fontSize: 12,
    color: FARVER.tekstSekund,
    marginBottom: 10,
  },
  skalaContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 3,
  },
  skalaKnap: {
    flex: 1,
    height: 36,
    borderRadius: 6,
    backgroundColor: FARVER.kaffeLys,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: FARVER.border,
  },
  aktivKnap: {
    transform: [{ scaleY: 1.1 }],
  },
  skalaTekst: {
    fontSize: 11,
    fontWeight: '600',
    color: FARVER.tekstSekund,
  },
  aktivSkalaTekst: {
    color: '#FFF',
  },
  etiketter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  etiketTekst: {
    fontSize: 10,
    color: FARVER.tekstSekund,
  },
});
