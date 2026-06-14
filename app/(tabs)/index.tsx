import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { currentRules, setRules } from '../rules';

type Message = {
  id: string;
  role: 'user' | 'ai';
  text: string;
};

const SERVER_URL = 'https://ai-chat-server-rkys.onrender.com/chat';

const INITIAL_MESSAGE: Message = {
  id: '1',
  role: 'ai',
  text: 'くるいどり会話へようこそ。何か話しかけてみてください。',
};

export default function HomeScreen() {
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const flatListRef = useRef<FlatList<Message>>(null);

  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);

  const MESSAGE_STORAGE_KEY = 'chat_messages';

  const RULE_STORAGE_KEY = 'conversation_rules';

useEffect(() => {
  const loadRules = async () => {
    const savedRules = await AsyncStorage.getItem(RULE_STORAGE_KEY);

    if (savedRules !== null) {
      setRules(savedRules);
    }
  };

  loadRules();
}, []);

  useEffect(() => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages]);

  useEffect(() => {
    const loadMessages = async () => {
      const savedMessages = await AsyncStorage.getItem(MESSAGE_STORAGE_KEY);

      if (savedMessages !== null) {
        setMessages(JSON.parse(savedMessages));
      }
    };

    loadMessages();
  }, []);

  useEffect(() => {
    AsyncStorage.setItem(MESSAGE_STORAGE_KEY, JSON.stringify(messages));
  }, [messages]);

  const clearMessages = () => {
    Alert.alert(
      '会話を削除',
      'すべての会話履歴を削除しますか？',
      [
        {
          text: 'キャンセル',
          style: 'cancel',
        },
        {
          text: '削除',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.removeItem(MESSAGE_STORAGE_KEY);
            setMessages([INITIAL_MESSAGE]);
          },
        },
      ]
    );
  };

  const sendMessage = async () => {
    if (inputText.trim() === '' || isLoading) return;

    const userText = inputText;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: userText,
    };

    const thinkingId = (Date.now() + 1).toString();

    const thinkingMessage: Message = {
      id: thinkingId,
      role: 'ai',
      text: '考え中...',
    };

setMessages((prev) => [...prev, userMessage, thinkingMessage]);
    setInputText('');
    setIsLoading(true);
    Keyboard.dismiss();

    try {
      const response = await fetch(SERVER_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userText,
          rules: currentRules,
        }),
      });

      const data = await response.json();

      setMessages((prev) =>
        prev.map((msg) =>
        msg.id === thinkingId
          ? {
              ...msg,
              text: data.reply ?? data.text ?? JSON.stringify(data),
            }
          : msg
      )
    );
    } catch (error) {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === thinkingId
            ? {
                ...msg,
                text: 'サーバーにつながらなかったっす。',
              }
            : msg
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}
      >
      <View style={styles.header}>
        <Text style={styles.title}>くるいどり会話🤪</Text>

        <Pressable style={styles.clearButton} onPress={clearMessages}>
          <Text style={styles.clearButtonText}>削除</Text>
        </Pressable>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        style={styles.messageList}
        renderItem={({ item }) => (
          <View
            style={[
              styles.messageBubble,
              item.role === 'user' ? styles.userBubble : styles.aiBubble,
            ]}
          >
            <Text
              style={[
                styles.messageText,
                item.role === 'user' && styles.userText,
              ]}
            >
              {item.text}
            </Text>
          </View>
        )}
      />

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder="メッセージを入力"
          returnKeyType="send"
          onSubmitEditing={sendMessage}
        />

        <Pressable
          style={[styles.sendButton, isLoading && styles.disabledButton]}
          onPress={sendMessage}
        >
          <Text style={styles.sendButtonText}>
            {isLoading ? '送信中' : '送信'}
          </Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  clearButton: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  clearButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  container: {
    flex: 1,
    paddingTop: 70,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
  },
  messageList: {
    flex: 1,
    marginBottom: 12,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    marginBottom: 10,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#4f46e5',
  },
  aiBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#f3f4f6',
  },
  messageText: {
    fontSize: 16,
    color: '#111827',
  },
  userText: {
    color: '#fff',
  },
  inputRow: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 8,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  sendButton: {
    backgroundColor: '#4f46e5',
    borderRadius: 12,
    paddingHorizontal: 18,
    justifyContent: 'center',
  },
  disabledButton: {
    backgroundColor: '#9ca3af',
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});