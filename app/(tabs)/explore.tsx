import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import {
  Alert,
  Keyboard,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

import { currentRules, setRules } from '../rules';

export default function RulesScreen() {
  const [rules, updateRules] = useState(currentRules);
  useEffect(() => {
    const loadRules = async () => {
      const savedRules = await AsyncStorage.getItem(STORAGE_KEY);

      if (savedRules !== null) {
        updateRules(savedRules);
        setRules(savedRules);
      }
    };

    loadRules();
  }, []);
  const STORAGE_KEY = 'conversation_rules';

  const saveRules = async () => {
    await AsyncStorage.setItem(STORAGE_KEY, rules);
    setRules(rules);
    Keyboard.dismiss();
    Alert.alert('保存完了', 'ルールを保存しました');
  };

  return (
  <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
    <View style={styles.container}>
      <Text style={styles.title}>会話ルール設定</Text>

      <TextInput
        style={styles.input}
        multiline
        value={rules}
        onChangeText={updateRules}
        placeholder="AIのルールを入力"
      />

      <Pressable style={styles.button} onPress={saveRules}>
        <Text style={styles.buttonText}>保存</Text>
      </Pressable>
    </View>
  </TouchableWithoutFeedback>
);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    height: 250,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 12,
    textAlignVertical: 'top',
  },
  button: {
    marginTop: 20,
    backgroundColor: '#4f46e5',
    padding: 15,
    borderRadius: 10,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
  },
});