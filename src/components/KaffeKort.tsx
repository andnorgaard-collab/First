import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { KaffeVurdering } from '../types';
import { FARVER, SKYGGE } from '../theme';
import { ScoreBadge } from './StjerneVurdering';

interface Props {
  vurdering: KaffeVurdering;
  onTryk: () => void;
  onSlet: () => void;
}

const RISTER_FARVER: Record<string, string> = {
  Lys: '#F5C842',
  Medium: '#C87941',
  Mørk: '#6B3A1F',
  Espresso: '#3D1F00',
};

export function KaffeKort({ vurdering, onTryk, onSlet }: Props) {
  const risterFarve = RISTER_FARVER[vurdering.risteringsgrad] ?? FARVER.kaffeAccent;
  const dato = new Date(vurdering.dato).toLocaleDateString('da-DK', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <TouchableOpacity style={[styles.kort, SKYGGE.lille]} onPress={onTryk} activeOpacity={0.8}>
      <View style={styles.topRaekke}>
        <View style={styles.info}>
          <Text style={styles.navn} numberOfLines={1}>{vurdering.navn}</Text>
          <Text style={styles.meta}>{vurdering.oprindelse} · {vurdering.brygmetode}</Text>
          <View style={styles.tagsRaekke}>
            <View style={[styles.risterTag, { backgroundColor: risterFarve }]}>
              <Text style={styles.risterTekst}>{vurdering.risteringsgrad}</Text>
            </View>
            {vurdering.vurderedeAf ? (
              <Text style={styles.vurderedeAf}>af {vurdering.vurderedeAf}</Text>
            ) : null}
          </View>
        </View>
        <ScoreBadge score={vurdering.samletScore} />
      </View>

      <View style={styles.smagsBar}>
        {Object.entries(vurdering.smag).map(([key, val]) => (
          <View key={key} style={styles.smags}>
            <View style={[styles.smagsLinjeContainer]}>
              <View style={[styles.smagsLinje, { flex: val, backgroundColor: FARVER.kaffeAccent }]} />
              <View style={[styles.smagsLinje, { flex: 10 - val, backgroundColor: FARVER.kaffeLys }]} />
            </View>
          </View>
        ))}
      </View>

      <View style={styles.bundRaekke}>
        <Text style={styles.dato}>{dato}</Text>
        <TouchableOpacity onPress={onSlet} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Text style={styles.sletKnap}>Slet</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  kort: {
    backgroundColor: FARVER.kortBaggrund,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: FARVER.border,
  },
  topRaekke: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  info: {
    flex: 1,
    marginRight: 12,
  },
  navn: {
    fontSize: 18,
    fontWeight: '700',
    color: FARVER.tekst,
    marginBottom: 2,
  },
  meta: {
    fontSize: 13,
    color: FARVER.tekstSekund,
    marginBottom: 6,
  },
  tagsRaekke: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  risterTag: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  risterTekst: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '600',
  },
  vurderedeAf: {
    fontSize: 11,
    color: FARVER.tekstSekund,
    fontStyle: 'italic',
  },
  smagsBar: {
    flexDirection: 'row',
    gap: 3,
    marginBottom: 10,
  },
  smags: {
    flex: 1,
  },
  smagsLinjeContainer: {
    flexDirection: 'column',
    height: 32,
    borderRadius: 4,
    overflow: 'hidden',
  },
  smagsLinje: {
    width: '100%',
  },
  bundRaekke: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dato: {
    fontSize: 12,
    color: FARVER.tekstSekund,
  },
  sletKnap: {
    fontSize: 13,
    color: FARVER.roed,
    fontWeight: '600',
  },
});
