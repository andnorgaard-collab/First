import AsyncStorage from '@react-native-async-storage/async-storage';
import { KaffeVurdering } from '../types';

const STORAGE_KEY = '@kaffeklub_vurderinger';

export async function hentAlleVurderinger(): Promise<KaffeVurdering[]> {
  try {
    const json = await AsyncStorage.getItem(STORAGE_KEY);
    return json ? JSON.parse(json) : [];
  } catch {
    return [];
  }
}

export async function gemVurdering(vurdering: KaffeVurdering): Promise<void> {
  const alle = await hentAlleVurderinger();
  const eksisterendeIndex = alle.findIndex(v => v.id === vurdering.id);
  if (eksisterendeIndex >= 0) {
    alle[eksisterendeIndex] = vurdering;
  } else {
    alle.unshift(vurdering);
  }
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(alle));
}

export async function sletVurdering(id: string): Promise<void> {
  const alle = await hentAlleVurderinger();
  const filtreret = alle.filter(v => v.id !== id);
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filtreret));
}
