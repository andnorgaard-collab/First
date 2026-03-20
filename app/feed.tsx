import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
  Modal,
  ScrollView,
} from 'react-native';
import { supabase } from '../src/lib/supabase';
import { FARVER, SKYGGE } from '../src/theme';
import { ScoreBadge } from '../src/components/StjerneVurdering';
import { SmagsProfil, SMAGSNAVNE } from '../src/types';

type FeedKaffe = {
  id: string;
  username: string;
  navn: string;
  oprindelse: string;
  brygmetode: string;
  risteringsgrad: string;
  smag: SmagsProfil;
  samlet_score: number;
  noter: string;
  dato: string;
};

const RISTER_FARVER: Record<string, string> = {
  Lys: '#F5C842',
  Medium: '#C87941',
  Mørk: '#6B3A1F',
  Espresso: '#3D1F00',
};

const SMAGS_FARVER: Record<keyof SmagsProfil, string> = {
  syre: FARVER.syre,
  bitterhed: FARVER.bitterhed,
  soedme: FARVER.soedme,
  fylde: FARVER.fylde,
  aroma: FARVER.aroma,
  eftersmag: FARVER.eftersmag,
};

export default function FeedScreen() {
  const [kaffer, setKaffer] = useState<FeedKaffe[]>([]);
  const [indlaeser, setIndlaeser] = useState(true);
  const [opdaterer, setOpdaterer] = useState(false);
  const [valgtKaffe, setValgtKaffe] = useState<FeedKaffe | null>(null);
  const [erLoggetInd, setErLoggetInd] = useState(false);

  const hentFeed = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setErLoggetInd(false);
      setIndlaeser(false);
      setOpdaterer(false);
      return;
    }

    setErLoggetInd(true);

    const { data, error } = await supabase.rpc('hent_foelgers_kaffer', {
      limit_n: 50,
    });

    if (!error && data) {
      setKaffer(data as FeedKaffe[]);
    }

    setIndlaeser(false);
    setOpdaterer(false);
  }, []);

  useEffect(() => {
    hentFeed();
  }, [hentFeed]);

  const onOpdater = () => {
    setOpdaterer(true);
    hentFeed();
  };

  const formatDato = (dato: string) =>
    new Date(dato).toLocaleDateString('da-DK', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

  const renderKaffe = ({ item }: { item: FeedKaffe }) => {
    const risterFarve = RISTER_FARVER[item.risteringsgrad] ?? FARVER.kaffeAccent;

    return (
      <TouchableOpacity
        style={[styles.kort, SKYGGE.lille]}
        onPress={() => setValgtKaffe(item)}
        activeOpacity={0.8}
      >
        {/* Bruger-header */}
        <View style={styles.brugerHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarTekst}>
              {item.username.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.brugerInfo}>
            <Text style={styles.brugernavn}>{item.username}</Text>
            <Text style={styles.dataTekst}>{formatDato(item.dato)}</Text>
          </View>
        </View>

        {/* Kaffe-info */}
        <View style={styles.kaffeInfo}>
          <View style={styles.kaffeNavn}>
            <Text style={styles.navn} numberOfLines={1}>
              {item.navn}
            </Text>
            <View style={[styles.risterTag, { backgroundColor: risterFarve }]}>
              <Text style={styles.risterTekst}>{item.risteringsgrad}</Text>
            </View>
          </View>
          {item.oprindelse ? (
            <Text style={styles.meta}>{item.oprindelse} · {item.brygmetode}</Text>
          ) : (
            <Text style={styles.meta}>{item.brygmetode}</Text>
          )}
        </View>

        {/* Score + smagsprofil */}
        <View style={styles.scoreRaekke}>
          <ScoreBadge score={item.samlet_score} />
          <View style={styles.smagsBar}>
            {(Object.entries(item.smag) as [keyof SmagsProfil, number][]).map(
              ([key, val]) => (
                <View key={key} style={styles.smags}>
                  <View style={styles.smagsLinjeContainer}>
                    <View
                      style={[
                        styles.smagsLinje,
                        { flex: val, backgroundColor: SMAGS_FARVER[key] },
                      ]}
                    />
                    <View
                      style={[
                        styles.smagsLinje,
                        { flex: 10 - val, backgroundColor: FARVER.kaffeLys },
                      ]}
                    />
                  </View>
                </View>
              )
            )}
          </View>
        </View>

        <Text style={styles.seDetaljer}>Tryk for detaljer →</Text>
      </TouchableOpacity>
    );
  };

  // ── Modal: fuld kaffe-detalje ──
  const DetaljeModal = () => {
    if (!valgtKaffe) return null;
    const risterFarve =
      RISTER_FARVER[valgtKaffe.risteringsgrad] ?? FARVER.kaffeAccent;

    return (
      <Modal
        visible={!!valgtKaffe}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setValgtKaffe(null)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <View style={styles.avatar}>
              <Text style={styles.avatarTekst}>
                {valgtKaffe.username.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.modalBrugernavn}>{valgtKaffe.username}</Text>
              <Text style={styles.modalDato}>{formatDato(valgtKaffe.dato)}</Text>
            </View>
            <TouchableOpacity
              onPress={() => setValgtKaffe(null)}
              style={styles.lukKnap}
            >
              <Text style={styles.lukTekst}>Luk</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.modalIndhold}
            contentContainerStyle={{ paddingBottom: 40 }}
          >
            {/* Navn og tags */}
            <Text style={styles.modalNavn}>{valgtKaffe.navn}</Text>
            <View style={styles.tagsRaekke}>
              <View
                style={[styles.risterTag, { backgroundColor: risterFarve }]}
              >
                <Text style={styles.risterTekst}>
                  {valgtKaffe.risteringsgrad}
                </Text>
              </View>
              <View style={styles.brygTag}>
                <Text style={styles.brygTekst}>{valgtKaffe.brygmetode}</Text>
              </View>
            </View>

            {valgtKaffe.oprindelse ? (
              <Text style={styles.modalMeta}>
                Oprindelse: {valgtKaffe.oprindelse}
              </Text>
            ) : null}

            {/* Score */}
            <View style={styles.scoreCenter}>
              <ScoreBadge score={valgtKaffe.samlet_score} />
            </View>

            {/* Smagsprofil */}
            <Text style={styles.sektionTitel}>Smagsprofil</Text>
            {(
              Object.entries(valgtKaffe.smag) as [keyof SmagsProfil, number][]
            ).map(([key, val]) => (
              <View key={key} style={styles.smagsRaekke}>
                <Text style={styles.smagsNavn}>{SMAGSNAVNE[key]}</Text>
                <View style={styles.smagsBarFull}>
                  <View
                    style={[
                      styles.smagsBarFyld,
                      {
                        flex: val,
                        backgroundColor: SMAGS_FARVER[key],
                      },
                    ]}
                  />
                  <View
                    style={[
                      styles.smagsBarFyld,
                      {
                        flex: 10 - val,
                        backgroundColor: FARVER.kaffeLys,
                      },
                    ]}
                  />
                </View>
                <Text style={styles.smagsVaerdi}>{val}/10</Text>
              </View>
            ))}

            {/* Noter */}
            {valgtKaffe.noter ? (
              <View style={styles.noterBoks}>
                <Text style={styles.sektionTitel}>Noter</Text>
                <Text style={styles.noterTekst}>{valgtKaffe.noter}</Text>
              </View>
            ) : null}
          </ScrollView>
        </View>
      </Modal>
    );
  };

  // ── Ikke logget ind ──
  if (!erLoggetInd && !indlaeser) {
    return (
      <View style={styles.centreret}>
        <Text style={styles.emptyEmoji}>☕</Text>
        <Text style={styles.emptyTitel}>Log ind for at se feed</Text>
        <Text style={styles.emptyTekst}>
          Du skal være logget ind for at se kaffer fra dem du følger.
        </Text>
      </View>
    );
  }

  // ── Indlæser ──
  if (indlaeser) {
    return (
      <View style={styles.centreret}>
        <ActivityIndicator color={FARVER.kaffeAccent} size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={kaffer}
        keyExtractor={item => item.id}
        renderItem={renderKaffe}
        contentContainerStyle={styles.liste}
        refreshControl={
          <RefreshControl
            refreshing={opdaterer}
            onRefresh={onOpdater}
            tintColor={FARVER.kaffeAccent}
          />
        }
        ListHeaderComponent={
          <Text style={styles.feedTitel}>
            Kaffer fra dem du følger
          </Text>
        }
        ListEmptyComponent={
          <View style={styles.centreret}>
            <Text style={styles.emptyEmoji}>👥</Text>
            <Text style={styles.emptyTitel}>Ingen kaffer endnu</Text>
            <Text style={styles.emptyTekst}>
              Følg andre brugere under Søg, for at se deres kaffevurderinger her.
            </Text>
          </View>
        }
      />
      <DetaljeModal />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: FARVER.baggrund,
  },
  liste: {
    paddingBottom: 32,
    flexGrow: 1,
  },
  feedTitel: {
    fontSize: 13,
    fontWeight: '700',
    color: FARVER.tekstSekund,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginHorizontal: 16,
    marginTop: 20,
    marginBottom: 8,
  },
  kort: {
    backgroundColor: FARVER.kortBaggrund,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: FARVER.border,
  },
  brugerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: FARVER.kaffeAccent,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  avatarTekst: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  brugerInfo: {
    flex: 1,
  },
  brugernavn: {
    fontSize: 15,
    fontWeight: '700',
    color: FARVER.tekst,
  },
  dataTekst: {
    fontSize: 12,
    color: FARVER.tekstSekund,
    marginTop: 1,
  },
  kaffeInfo: {
    marginBottom: 12,
  },
  kaffeNavn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  navn: {
    fontSize: 17,
    fontWeight: '700',
    color: FARVER.tekst,
    flex: 1,
  },
  meta: {
    fontSize: 13,
    color: FARVER.tekstSekund,
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
  scoreRaekke: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  smagsBar: {
    flex: 1,
    flexDirection: 'row',
    gap: 3,
    height: 32,
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
  seDetaljer: {
    fontSize: 12,
    color: FARVER.kaffeAccent,
    textAlign: 'right',
    fontWeight: '600',
    marginTop: 2,
  },
  centreret: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    paddingTop: 80,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitel: {
    fontSize: 18,
    fontWeight: '700',
    color: FARVER.tekst,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyTekst: {
    fontSize: 15,
    color: FARVER.tekstSekund,
    textAlign: 'center',
    lineHeight: 22,
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: FARVER.baggrund,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: FARVER.kaffe,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  modalBrugernavn: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
  },
  modalDato: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 1,
  },
  lukKnap: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 8,
  },
  lukTekst: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 14,
  },
  modalIndhold: {
    flex: 1,
    padding: 20,
  },
  modalNavn: {
    fontSize: 26,
    fontWeight: '800',
    color: FARVER.tekst,
    marginBottom: 10,
  },
  tagsRaekke: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  brygTag: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    backgroundColor: FARVER.kaffeLys,
    borderWidth: 1,
    borderColor: FARVER.border,
  },
  brygTekst: {
    color: FARVER.tekst,
    fontSize: 11,
    fontWeight: '600',
  },
  modalMeta: {
    fontSize: 14,
    color: FARVER.tekstSekund,
    marginBottom: 12,
  },
  scoreCenter: {
    alignItems: 'flex-start',
    marginVertical: 16,
  },
  sektionTitel: {
    fontSize: 13,
    fontWeight: '700',
    color: FARVER.tekstSekund,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 12,
    marginTop: 8,
  },
  smagsRaekke: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 10,
  },
  smagsNavn: {
    width: 80,
    fontSize: 13,
    color: FARVER.tekst,
    fontWeight: '500',
  },
  smagsBarFull: {
    flex: 1,
    flexDirection: 'row',
    height: 10,
    borderRadius: 5,
    overflow: 'hidden',
  },
  smagsBarFyld: {
    height: '100%',
  },
  smagsVaerdi: {
    width: 36,
    fontSize: 12,
    color: FARVER.tekstSekund,
    textAlign: 'right',
    fontWeight: '600',
  },
  noterBoks: {
    marginTop: 16,
    backgroundColor: FARVER.kortBaggrund,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: FARVER.border,
  },
  noterTekst: {
    fontSize: 15,
    color: FARVER.tekst,
    lineHeight: 22,
  },
});
