import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SmagsSlider } from '../src/components/SmagsSlider';
import { ScoreBadge } from '../src/components/StjerneVurdering';
import { gemVurdering, hentAlleVurderinger } from '../src/storage/storage';
import {
  BRYGMETODER,
  KaffeVurdering,
  RisteringsGrad,
  SmagsProfil,
  SMAGSBESKRIVELSER,
  SMAGSNAVNE,
} from '../src/types';
import { FARVER } from '../src/theme';

const SMAGS_FARVER: Record<keyof SmagsProfil, string> = {
  syre: FARVER.syre,
  bitterhed: FARVER.bitterhed,
  soedme: FARVER.soedme,
  fylde: FARVER.fylde,
  aroma: FARVER.aroma,
  eftersmag: FARVER.eftersmag,
};

const DEFAULT_SMAG: SmagsProfil = {
  syre: 5,
  bitterhed: 5,
  soedme: 5,
  fylde: 5,
  aroma: 5,
  eftersmag: 5,
};

const RISTERINGSGRADER: RisteringsGrad[] = ['Lys', 'Medium', 'Mørk', 'Espresso'];
const RISTER_FARVER: Record<RisteringsGrad, string> = {
  Lys: '#F5C842',
  Medium: '#C87941',
  Mørk: '#6B3A1F',
  Espresso: '#3D1F00',
};

export default function NyVurderingScreen() {
  const params = useLocalSearchParams<{ id?: string }>();
  // useLocalSearchParams can return string | string[] — normalise to string | undefined
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const router = useRouter();
  const erRedigering = !!id;

  const [navn, setNavn] = useState('');
  const [oprindelse, setOprindelse] = useState('');
  const [risteringsgrad, setRisteringsgrad] = useState<RisteringsGrad>('Medium');
  const [brygmetode, setBrygmetode] = useState('Filterkaffe');
  const [vurderedeAf, setVurderedeAf] = useState('');
  const [smag, setSmag] = useState<SmagsProfil>(DEFAULT_SMAG);
  const [samletScore, setSamletScore] = useState(7);
  const [noter, setNoter] = useState('');
  const [originalDato, setOriginalDato] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (id) {
      hentAlleVurderinger().then(alle => {
        const eksisterende = alle.find(v => v.id === id);
        if (eksisterende) {
          setNavn(eksisterende.navn);
          setOprindelse(eksisterende.oprindelse);
          setRisteringsgrad(eksisterende.risteringsgrad);
          setBrygmetode(eksisterende.brygmetode);
          setVurderedeAf(eksisterende.vurderedeAf);
          setSmag({ ...eksisterende.smag });
          setSamletScore(eksisterende.samletScore);
          setNoter(eksisterende.noter);
          setOriginalDato(eksisterende.dato);
        }
      });
    } else {
      // Reset form when navigating to "add new coffee"
      setNavn('');
      setOprindelse('');
      setRisteringsgrad('Medium');
      setBrygmetode('Filterkaffe');
      setVurderedeAf('');
      setSmag({ ...DEFAULT_SMAG });
      setSamletScore(7);
      setNoter('');
      setOriginalDato(undefined);
    }
  }, [id]);

  const aendrSmag = (felt: keyof SmagsProfil, vaerdi: number) => {
    setSmag(prev => ({ ...prev, [felt]: vaerdi }));
  };

  const gem = async () => {
    if (!navn.trim()) {
      Alert.alert('Mangler navn', 'Angiv venligst kaffens navn.');
      return;
    }

    const vurdering: KaffeVurdering = {
      id: id ?? Date.now().toString(),
      navn: navn.trim(),
      oprindelse: oprindelse.trim(),
      risteringsgrad,
      brygmetode,
      vurderedeAf: vurderedeAf.trim(),
      smag,
      samletScore,
      noter: noter.trim(),
      dato: originalDato ?? new Date().toISOString(),
    };

    await gemVurdering(vurdering);
    router.back();
  };

  return (
    <KeyboardAvoidingView
      style={styles.ydre}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Kaffe-info */}
        <View style={styles.sektion}>
          <Text style={styles.sektionTitel}>Kaffe-information</Text>

          <Text style={styles.feltLabel}>Kaffens navn *</Text>
          <TextInput
            style={styles.input}
            value={navn}
            onChangeText={setNavn}
            placeholder="f.eks. Ethiopia Yirgacheffe"
            placeholderTextColor={FARVER.border}
          />

          <Text style={styles.feltLabel}>Oprindelse / Producent</Text>
          <TextInput
            style={styles.input}
            value={oprindelse}
            onChangeText={setOprindelse}
            placeholder="f.eks. Etiopien, La Cabra"
            placeholderTextColor={FARVER.border}
          />

          <Text style={styles.feltLabel}>Ristersningsgrad</Text>
          <View style={styles.valgRaekke}>
            {RISTERINGSGRADER.map(grad => (
              <TouchableOpacity
                key={grad}
                style={[
                  styles.valgKnap,
                  risteringsgrad === grad && {
                    backgroundColor: RISTER_FARVER[grad],
                    borderColor: RISTER_FARVER[grad],
                  },
                ]}
                onPress={() => setRisteringsgrad(grad)}
              >
                <Text
                  style={[
                    styles.valgKnapTekst,
                    risteringsgrad === grad && styles.valgKnapAktivTekst,
                  ]}
                >
                  {grad}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.feltLabel}>Brygmetode</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.brygScroll}>
            <View style={styles.valgRaekke}>
              {BRYGMETODER.map(metode => (
                <TouchableOpacity
                  key={metode}
                  style={[
                    styles.valgKnap,
                    brygmetode === metode && {
                      backgroundColor: FARVER.kaffeAccent,
                      borderColor: FARVER.kaffeAccent,
                    },
                  ]}
                  onPress={() => setBrygmetode(metode)}
                >
                  <Text
                    style={[
                      styles.valgKnapTekst,
                      brygmetode === metode && styles.valgKnapAktivTekst,
                    ]}
                  >
                    {metode}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          <Text style={styles.feltLabel}>Vurderet af</Text>
          <TextInput
            style={styles.input}
            value={vurderedeAf}
            onChangeText={setVurderedeAf}
            placeholder="Dit navn"
            placeholderTextColor={FARVER.border}
          />
        </View>

        {/* Smagsvurdering */}
        <View style={styles.sektion}>
          <Text style={styles.sektionTitel}>Smagsvurdering</Text>
          <Text style={styles.sektionUnderTekst}>
            Vurder kaffens smagsprofil på en skala fra 1 (svag) til 10 (intens)
          </Text>

          {(Object.keys(DEFAULT_SMAG) as Array<keyof SmagsProfil>).map(felt => (
            <SmagsSlider
              key={felt}
              label={SMAGSNAVNE[felt]}
              beskrivelse={SMAGSBESKRIVELSER[felt]}
              vaerdi={smag[felt]}
              farve={SMAGS_FARVER[felt]}
              onAendr={val => aendrSmag(felt, val)}
            />
          ))}
        </View>

        {/* Samlet vurdering */}
        <View style={styles.sektion}>
          <Text style={styles.sektionTitel}>Samlet vurdering</Text>
          <Text style={styles.sektionUnderTekst}>Hvor godt kan du lide denne kaffe?</Text>

          <View style={styles.samletContainer}>
            <ScoreBadge score={samletScore} />
            <View style={styles.scoreKnapper}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(tal => (
                <TouchableOpacity
                  key={tal}
                  style={[
                    styles.scoreKnap,
                    samletScore === tal && styles.scoreKnapAktiv,
                  ]}
                  onPress={() => setSamletScore(tal)}
                >
                  <Text
                    style={[
                      styles.scoreTekst,
                      samletScore === tal && styles.scoreTekstAktiv,
                    ]}
                  >
                    {tal}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Noter */}
        <View style={styles.sektion}>
          <Text style={styles.sektionTitel}>Noter</Text>
          <TextInput
            style={[styles.input, styles.noterInput]}
            value={noter}
            onChangeText={setNoter}
            placeholder="Dine personlige noter om denne kaffe..."
            placeholderTextColor={FARVER.border}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* Gem-knap */}
        <TouchableOpacity style={styles.gemKnap} onPress={gem}>
          <Text style={styles.gemKnapTekst}>
            {erRedigering ? '💾 Opdater vurdering' : '☕ Gem vurdering'}
          </Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  ydre: {
    flex: 1,
    backgroundColor: FARVER.baggrund,
  },
  container: {
    flex: 1,
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
    marginBottom: 4,
  },
  sektionUnderTekst: {
    fontSize: 13,
    color: FARVER.tekstSekund,
    marginBottom: 16,
  },
  feltLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: FARVER.tekst,
    marginBottom: 6,
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: FARVER.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: FARVER.tekst,
    backgroundColor: FARVER.baggrund,
  },
  noterInput: {
    height: 100,
  },
  brygScroll: {
    marginBottom: 4,
  },
  valgRaekke: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 4,
  },
  valgKnap: {
    borderWidth: 1.5,
    borderColor: FARVER.border,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
    backgroundColor: FARVER.baggrund,
  },
  valgKnapTekst: {
    fontSize: 13,
    fontWeight: '600',
    color: FARVER.tekstSekund,
  },
  valgKnapAktivTekst: {
    color: '#FFF',
  },
  samletContainer: {
    alignItems: 'center',
    gap: 16,
  },
  scoreKnapper: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  scoreKnap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: FARVER.border,
    backgroundColor: FARVER.kaffeLys,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreKnapAktiv: {
    backgroundColor: FARVER.kaffeAccent,
    borderColor: FARVER.kaffeAccent,
  },
  scoreTekst: {
    fontSize: 15,
    fontWeight: '700',
    color: FARVER.tekstSekund,
  },
  scoreTekstAktiv: {
    color: '#FFF',
  },
  gemKnap: {
    backgroundColor: FARVER.kaffe,
    marginHorizontal: 16,
    marginTop: 24,
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
  },
  gemKnapTekst: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
  },
});
