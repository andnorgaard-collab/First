import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { FARVER } from '../theme';

interface Props {
  score: number;
  onAendr?: (score: number) => void;
  stoerrelse?: 'lille' | 'normal' | 'stor';
}

export function StjerneVurdering({ score, onAendr, stoerrelse = 'normal' }: Props) {
  const stoerrelseMap = { lille: 20, normal: 32, stor: 44 };
  const stjerneStoerrelse = stoerrelseMap[stoerrelse];

  return (
    <View style={styles.container}>
      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(tal => (
        <TouchableOpacity
          key={tal}
          onPress={() => onAendr?.(tal)}
          disabled={!onAendr}
          style={styles.kopper}
        >
          <Text style={{ fontSize: stjerneStoerrelse * 0.7 }}>
            {tal <= score ? '☕' : '🫗'}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

export function ScoreBadge({ score }: { score: number }) {
  const farve =
    score >= 8 ? FARVER.groen :
    score >= 6 ? FARVER.kaffeAccent :
    score >= 4 ? FARVER.syre :
    FARVER.roed;

  const tekst =
    score >= 9 ? 'Fremragende' :
    score >= 7 ? 'Meget god' :
    score >= 5 ? 'God' :
    score >= 3 ? 'Middel' :
    'Ikke min kop';

  return (
    <View style={[styles.badge, { backgroundColor: farve }]}>
      <Text style={styles.badgeScore}>{score}/10</Text>
      <Text style={styles.badgeTekst}>{tekst}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 2,
  },
  kopper: {
    padding: 2,
  },
  badge: {
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignItems: 'center',
  },
  badgeScore: {
    color: '#FFF',
    fontSize: 22,
    fontWeight: '800',
  },
  badgeTekst: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
    opacity: 0.9,
  },
});
