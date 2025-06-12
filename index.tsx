/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI, Chat, GenerateContentResponse, Part } from "@google/genai";

// Type declarations for global variables
declare global {
    // --- Speech API Types ---
    interface SpeechRecognitionEventMap {
        "audiostart": Event;
        "audioend": Event;
        "end": Event;
        "error": SpeechRecognitionErrorEvent;
        "nomatch": SpeechRecognitionEvent;
        "result": SpeechRecognitionEvent;
        "soundstart": Event;
        "soundend": Event;
        "speechstart": Event;
        "speechend": Event;
        "start": Event;
    }

    interface SpeechRecognition extends EventTarget {
        grammars: SpeechGrammarList;
        lang: string;
        continuous: boolean;
        interimResults: boolean;
        maxAlternatives: number;
        serviceURI: string; 

        onaudiostart: ((this: SpeechRecognition, ev: Event) => any) | null;
        onaudioend: ((this: SpeechRecognition, ev: Event) => any) | null;
        onend: ((this: SpeechRecognition, ev: Event) => any) | null;
        onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null;
        onnomatch: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
        onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
        onsoundstart: ((this: SpeechRecognition, ev: Event) => any) | null;
        onsoundend: ((this: SpeechRecognition, ev: Event) => any) | null;
        onspeechstart: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
        onspeechend: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null; 
        onstart: ((this: SpeechRecognition, ev: Event) => any) | null;

        abort(): void;
        start(): void;
        stop(): void;

        addEventListener<K extends keyof SpeechRecognitionEventMap>(type: K, listener: (this: SpeechRecognition, ev: SpeechRecognitionEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
        addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
        removeEventListener<K extends keyof SpeechRecognitionEventMap>(type: K, listener: (this: SpeechRecognition, ev: SpeechRecognitionEventMap[K]) => any, options?: boolean | EventListenerOptions): void;
        removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
    }

    interface SpeechRecognitionErrorEvent extends Event {
        readonly error: string; 
        readonly message: string;
    }

    interface SpeechRecognitionEvent extends Event {
        readonly resultIndex: number;
        readonly results: SpeechRecognitionResultList;
    }

    interface SpeechRecognitionResultList {
        readonly length: number;
        item(index: number): SpeechRecognitionResult;
        [index: number]: SpeechRecognitionResult;
    }

    interface SpeechRecognitionResult {
        readonly length: number;
        item(index: number): SpeechRecognitionAlternative;
        [index: number]: SpeechRecognitionAlternative;
        readonly isFinal: boolean;
    }

    interface SpeechRecognitionAlternative {
        readonly transcript: string;
        readonly confidence: number;
    }

    interface SpeechGrammar {
        src: string;
        weight: number;
    }

    interface SpeechGrammarList {
        readonly length: number;
        item(index: number): SpeechGrammar;
        [index: number]: SpeechGrammar;
        addFromString(string: string, weight?: number): void;
        addFromURI(src: string, weight?: number): void;
    }

    var SpeechRecognition: {
        prototype: SpeechRecognition;
        new(): SpeechRecognition;
    };
    var webkitSpeechRecognition: {
        prototype: SpeechRecognition; 
        new(): SpeechRecognition;
    };
    
    namespace React {
      type ReactNode = any; 
      type Dispatch<A> = (value: A) => void;
      type SetStateAction<S> = S | ((prevState: S) => S);
      function useState<S>(initialState: S | (() => S)): [S, Dispatch<SetStateAction<S>>];
      function useEffect(effect: () => (void | (() => void)), deps?: readonly any[]): void;
      function useCallback<T extends (...args: any[]) => any>(callback: T, deps: readonly any[]): T;
      interface RefObject<T> { current: T | null; }
      function useRef<T>(initialValue: T): RefObject<T>; 
      function useRef<T>(initialValue: T | null): RefObject<T | null>;
      const Fragment: any; 

      interface ChangeEvent<T = Element> extends Event { currentTarget: EventTarget & T; target: EventTarget & T; }
      interface KeyboardEvent<T = Element> extends Event { key: string; preventDefault: () => void; shiftKey: boolean; }
      interface MouseEvent<T = Element> extends Event { clientX: number, clientY: number } 
      interface TextareaHTMLAttributes<T> {
        rows?: number;
      }
    }

  interface Window {
    React: {
        createElement: (...args: any[]) => React.ReactNode;
        useState: typeof React.useState;
        useEffect: typeof React.useEffect;
        useRef: typeof React.useRef;
        useCallback: typeof React.useCallback;
        Fragment: typeof React.Fragment;
    };
    ReactDOM: {
        createRoot: (container: Element | DocumentFragment) => ({ render: (element: React.ReactNode) => void });
    };
    SpeechRecognition?: new () => SpeechRecognition;
    webkitSpeechRecognition?: new () => SpeechRecognition;
    process?: { // Keep process for type safety, vite.config defines it.
      env: {
        API_KEY: string;
        [key: string]: string | undefined;
      };
    };
    marked: { 
        parse: (markdownString: string, options?: object) => string;
    };
    Chart: any; // Added for Chart.js
    XLSX: any; // Added for SheetJS (XLSX export)
  }

  const htm: {
    bind: (createElement: any) => (...args: any[]) => any;
  };
}

export {};

const réalité = window.React;
const { useState, useEffect, useRef, useCallback, Fragment } = réalité;
const { createRoot } = window.ReactDOM;
const html = htm.bind(réalité.createElement);
const marked = window.marked; 

const SpeechRecognitionGlobal = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition: SpeechRecognition | undefined;
if (SpeechRecognitionGlobal) {
    recognition = new SpeechRecognitionGlobal();
    recognition.continuous = false;
    // recognition.lang will be set dynamically
    recognition.interimResults = true; 
    recognition.maxAlternatives = 1;
} else {
    console.warn("Speech Recognition API is not supported in this browser.");
}

interface Message {
    id: string;
    sender: 'user' | 'ai' | 'system';
    text: string;
    timestamp: number;
    imageBase64?: string; // For persistent image storage
    imageMimeType?: string; // MIME type for the base64 image
    chartData?: string; // For Chart.js JSON data
}

interface QuickQuestionItem {
  id: string;
  title: string;
  recommendedPrompt: string;
}

interface DashboardCardData {
  id: string;
  title: string;
  value?: string; // Made optional as some cards like RecommendedAction will build complex values/details
  unit?: string;
  details?: string | string[] | React.ReactNode; 
  icon?: string; 
  dataLoader?: () => Promise<any>; 
}

type Language = 'ja' | 'en';
type AvatarState = 'neutral' | 'thinking' | 'happy' | 'concerned';
type LeftPaneView = 'assistant' | 'dashboard';


interface Farm {
    id: string;
    name: string;
    latitude?: number;  // Added for weather forecast
    longitude?: number; // Added for weather forecast
}

interface UIDescriptions {
    headerTitle: string;
    appSuffixTitle: string; 
    agriChanName: string;
    agriChanAvatarAlt: string; 
    initialAiMessage: string;
    quickQuestionsTitle: string;
    loadingSuggestions: string; 
    noSuggestions: string;
    inputPlaceholder: string;
    sendButton: string;
    sendButtonAriaLabel: string;
    attachImageLabel: string;
    clearImageLabel: string;
    screenShareStartLabel: string;
    screenShareStopLabel: string;
    screenShareStopButtonText: string;
    micStartLabel: string;
    micStopLabel: string;
    micStopButtonText: string;
    userSenderName: string;
    aiTyping: string;
    hamburgerMenuLabel: string;
    langNameJa: string;
    langNameEn: string;
    farmMenuLabel: string;
    selectFarmPlaceholder: string;
    farms: Farm[];
    errorApiKeyNotSet: string; 
    errorAiInitFailed: string; 
    errorSpeechRecognition: (errorType: string) => string;
    errorSpeechNoSpeech: string;
    errorSpeechAudioCapture: string;
    errorSpeechNotAllowed: string;
    errorSpeechGeneric: string;
    errorImageFileNotImage: string;
    errorSendMessageFailed: string;
    errorBrowserNoSpeechRecognition: string;
    errorSpeechRecognitionStartFailed: string;
    errorScreenShareStartFailed: string;
    systemScreenShareStarted: string;
    systemScreenShareStopped: string;
    aiSystemInstruction: (aiName: string) => string;
    aiQuickQuestionPrompt: (lastAiResponse: string, numSuggestions: number) => string;
    aiImageOnlyText: string;
    initialQuickQuestionItems: QuickQuestionItem[];
    scrollToBottomLabel: string;
    todayLabel: string;
    yesterdayLabel: string;
    chartRenderError: string;
    avatarNeutralSrc: string;
    avatarNeutralAlt: string;
    avatarThinkingSrc: string;
    avatarThinkingAlt: string;
    avatarHappySrc: string;
    avatarHappyAlt: string;
    avatarConcernedSrc: string;
    avatarConcernedAlt: string;
    clearChatHistoryLabel: string;
    confirmClearChatTitle: string;
    confirmClearChatMessage: string;
    confirmClearChatButtonDelete: string;
    confirmClearChatButtonCancel: string;
    chatHistoryClearedMessage: string;
    downloadXlsxButtonText: string;
    resizeHandleAriaLabel: string;
    leftPaneTabAssistant: string;
    leftPaneTabDashboard: string;
    dashboardTitle: string;
    dashboardData: {
      pesticideNeeded: DashboardCardData;
      diseaseRisk: DashboardCardData;
      managedFields: DashboardCardData;
      avgGrowthProgress: DashboardCardData;
      fieldsToReviewToday: DashboardCardData;
      recommendedActionToday: DashboardCardData;
    };
    fieldsUnit: string;
    dashboardFieldsToReviewTableName: string;
    dashboardFieldsToReviewTableCrop: string;
    dashboardFieldsToReviewTableStatus: string; // Will become unused for this table, but kept for now
    dashboardFieldsToReviewTableLastCheck: string; // Will become unused for this table
    dashboardFieldsToReviewTableAssignee: string; // Will become unused for this table
    dashboardFieldsToReviewTableNotes: string; // Will become unused for this table
    dashboardFieldsToReviewTableNoData: string;
    dashboardFieldsToReviewTableLoading: string;
    dashboardFieldsToReviewTableError: string;
    // New for Recommended Action Today card
    recActionDateLabel: string;
    recActionLocationLabel: string;
    recActionWeatherLabel: string;
    recActionAILabel: string;
    recActionNoFarmSelected: string;
    recActionNoCoordinates: string;
    recActionWeatherLoading: string;
    recActionWeatherError: string;
    recActionAILoading: string;
    recActionAIError: string;
    recActionTempMax: string;
    recActionTempMin: string;
    recActionPrecipitationProb: string;
    aiPromptForDailyRecommendation: (date: string, farmName: string, weather: string) => string;
    weatherConditions: Record<number, string>; // For WMO codes
}

const defaultKittyGif = "https://storage.googleapis.com/market_view_useritems/46638/images/kitty_20220608014936.gif";

const translations: Record<Language, UIDescriptions> = {
    ja: {
        headerTitle: "ザルビオチャット",
        appSuffixTitle: "農業支援AI",
        agriChanName: "ザルビーナちゃん",
        agriChanAvatarAlt: "ザルビーナちゃん アバター",
        initialAiMessage: "こんにちは、ザルビーナちゃんです！農作業に関するご質問や記録のお手伝いをします。お気軽にご質問ください。PCからは画像をアップロードできますよ！必要であれば、グラフも表示できます。",
        quickQuestionsTitle: "クイック質問",
        loadingSuggestions: "更新中...", 
        noSuggestions: "現在、提案はありません。",
        inputPlaceholder: "メッセージを入力するか、マイクボタンを押して話しかけてください...",
        sendButton: "送信",
        sendButtonAriaLabel: "送信",
        attachImageLabel: "画像を添付",
        clearImageLabel: "選択した画像をクリア",
        screenShareStartLabel: "画面共有を開始",
        screenShareStopLabel: "画面共有を停止",
        screenShareStopButtonText: "停止",
        micStartLabel: "音声入力開始",
        micStopLabel: "録音停止",
        micStopButtonText: "停止中...",
        userSenderName: "あなた",
        aiTyping: "考えています...",
        hamburgerMenuLabel: "メニューを開く",
        langNameJa: "日本語",
        langNameEn: "English",
        farmMenuLabel: "農場選択メニュー",
        selectFarmPlaceholder: "農場を選択",
        farms: [
            { id: 'farm_1_ja', name: '農場A (大規模)', latitude: 35.6895, longitude: 139.6917 }, // Tokyo
            { id: 'farm_2_ja', name: '試験農場B', latitude: 34.6937, longitude: 135.5023 }, // Osaka
            { id: 'farm_3_ja', name: '佐藤農園', latitude: 43.0618, longitude: 141.3545 }, // Sapporo
            { id: 'farm_4_ja', name: 'みどり牧場', latitude: 33.5902, longitude: 130.4017 }, // Fukuoka
        ],
        errorApiKeyNotSet: "APIキーが設定されていません。アプリケーションが正しく動作しない可能性があります。", 
        errorAiInitFailed: "AIチャットの初期化に失敗しました。後でもう一度お試しください。", 
        errorSpeechRecognition: (errorType: string) => `音声認識エラー: ${errorType}`,
        errorSpeechNoSpeech: "音声が検出されませんでした。",
        errorSpeechAudioCapture: "マイク接続に問題があります。",
        errorSpeechNotAllowed: "マイクへのアクセスが拒否されました。",
        errorSpeechGeneric: "不明なエラーが発生しました。",
        errorImageFileNotImage: "画像ファイルを選択してください。",
        errorSendMessageFailed: "メッセージの送信中にエラーが発生しました。後でもう一度お試しください。",
        errorBrowserNoSpeechRecognition: "お使いのブラウザは音声認識をサポートしていません。",
        errorSpeechRecognitionStartFailed: "音声認識を開始できませんでした。マイクが接続され、アクセスが許可されているか確認してください。",
        errorScreenShareStartFailed: "画面共有を開始できませんでした。権限が拒否されたか、キャンセルされた可能性があります。",
        systemScreenShareStarted: "画面共有が開始されました。ザルビーナちゃんに共有された内容を説明してください。",
        systemScreenShareStopped: "画面共有が停止しました。",
        aiSystemInstruction: (aiName: string) => `あなたはフレンドリーな農業サポートアシスタント「${aiName}」です。ユーザーの質問に日本語で答えてください。農業に関する専門知識を持ち、具体的で実用的なアドバイスを心がけてください。
応答は必ず以下のJSON形式で提供してください:
{
  "response_text": "ここにユーザーへのメッセージを記述します。",
  "sentiment": "neutral" 
}
sentimentには、あなたの応答の主な感情を表すため、"neutral"、"positive"、"negative" のいずれかを指定してください。
ユーザーが画像をアップロードした場合は、その画像の内容についても言及し、関連するサポートを提供してください。画面共有が開始されたら、共有された内容について説明するようユーザーに促してください。
グラフを表示する必要がある場合は、JSON応答に "chartjs" フィールドを追加してください:
{
  "response_text": "グラフはこちらです。",
  "sentiment": "neutral",
  "chartjs": { /* Chart.jsのJSONデータ... */ }
}
以前使用していた \`\`\`chartjs ブロックは使用せず、代わりに上記のJSON構造内の "chartjs" フィールドを使用してください。`,
        aiQuickQuestionPrompt: (lastAiResponse: string, numSuggestions: number) => `
あなたはユーザーを支援するAIです。ユーザーは農業アシスタント「ザルビーナちゃん」と会話しています。
ザルビーナちゃんの最後の発言は次のとおりです:
"${lastAiResponse}"

ザルビーナちゃんの発言に基づいて、ユーザーが次に尋ねる可能性のある関連性の高い「クイック質問」を${numSuggestions}つ提案してください。
各質問を短い「タイトル」と、ユーザーが実際に尋ねる「プロンプト」として日本語で提供してください。
以下のJSON形式で、キー名 "suggestions", "title", "prompt" を使用して応答してください。

例:
{
  "suggestions": [
    { "title": "詳細情報", "prompt": "それについてもっと詳しく教えて。" }
  ]
}`,
        aiImageOnlyText: "画像を確認してください。",
        initialQuickQuestionItems: [
          { id: 'field_management_initial_ja', title: '管理圃場', recommendedPrompt: '注意すべき圃場を教えて' },
          { id: 'crop_records_initial_ja', title: '作物の記録', recommendedPrompt: '最近の生育状況を教えて' },
          { id: 'pest_disease_initial_ja', title: '病害虫情報', recommendedPrompt: '最近注意すべき病害虫は？' }
        ],
        scrollToBottomLabel: "一番下へスクロール",
        todayLabel: "今日",
        yesterdayLabel: "昨日",
        chartRenderError: "グラフの描画に失敗しました。",
        avatarNeutralSrc: defaultKittyGif,
        avatarNeutralAlt: "ザルビーナちゃん (普通)",
        avatarThinkingSrc: defaultKittyGif, 
        avatarThinkingAlt: "ザルビーナちゃん (考え中)",
        avatarHappySrc: defaultKittyGif,    
        avatarHappyAlt: "ザルビーナちゃん (嬉しい)",
        avatarConcernedSrc: defaultKittyGif, 
        avatarConcernedAlt: "ザルビーナちゃん (心配)",
        clearChatHistoryLabel: "チャット履歴を削除",
        confirmClearChatTitle: "確認",
        confirmClearChatMessage: "チャット履歴を削除してよろしいですか？この操作は取り消せません。",
        confirmClearChatButtonDelete: "削除",
        confirmClearChatButtonCancel: "キャンセル",
        chatHistoryClearedMessage: "チャット履歴が削除されました。",
        downloadXlsxButtonText: "Excel形式でダウンロード",
        resizeHandleAriaLabel: "チャットパネルのサイズを変更",
        leftPaneTabAssistant: "アシスタント",
        leftPaneTabDashboard: "ダッシュボード",
        dashboardTitle: "農場サマリー",
        fieldsUnit: "圃場",
        dashboardData: {
          pesticideNeeded: { id: 'dash_pest_needed_ja', title: '要農薬対応', value: '3', unit: '圃場', icon: '⚠️', details: 'うち1圃場は緊急性が高いです。' },
          diseaseRisk: { id: 'dash_disease_risk_ja', title: '病害リスク警戒', value: '高', icon: '🔬', details: ['いもち病 (高)', '紋枯病 (中)'] },
          managedFields: { id: 'dash_managed_fields_ja', title: '管理圃場数', value: '15', unit: '/ 20 圃場', icon: '🏞️' },
          avgGrowthProgress: { id: 'dash_avg_growth_ja', title: '平均生育進捗', value: '75%', icon: '📊', details: '目標比 +5%' },
          fieldsToReviewToday: { id: 'dash_fields_review_ja', title: '本日確認すべき圃場', icon: '👀', details: null },
          recommendedActionToday: { id: 'dash_rec_action_ja', title: '本日の推奨アクション', icon: '💡', details: null }, // Details will be dynamically generated
        },
        dashboardFieldsToReviewTableName: "圃場名",
        dashboardFieldsToReviewTableCrop: "作物",
        dashboardFieldsToReviewTableStatus: "ステータス",
        dashboardFieldsToReviewTableLastCheck: "最終確認日",
        dashboardFieldsToReviewTableAssignee: "担当者",
        dashboardFieldsToReviewTableNotes: "備考",
        dashboardFieldsToReviewTableNoData: "本日確認すべき圃場データはありません。",
        dashboardFieldsToReviewTableLoading: "圃場データを読み込み中...",
        dashboardFieldsToReviewTableError: "圃場データの読み込みに失敗しました。",
        recActionDateLabel: "日付",
        recActionLocationLabel: "場所",
        recActionWeatherLabel: "天気",
        recActionAILabel: "推奨アクション",
        recActionNoFarmSelected: "農場が選択されていません。農場を選択すると、推奨アクションが表示されます。",
        recActionNoCoordinates: "選択された農場に位置情報がありません。天気予報と推奨アクションは表示できません。",
        recActionWeatherLoading: "天気予報を読み込み中...",
        recActionWeatherError: "天気予報の取得に失敗しました。",
        recActionAILoading: "AIからの推奨を読み込み中...",
        recActionAIError: "推奨アクションの取得に失敗しました。",
        recActionTempMax: "最高",
        recActionTempMin: "最低",
        recActionPrecipitationProb: "降水確率",
        aiPromptForDailyRecommendation: (date, farmName, weather) => `${date}の${farmName}の天気は${weather}です。この情報に基づいて、今日行うべき具体的な農作業の推奨を1つか2つ、簡潔に提案してください。`,
        weatherConditions: {
            0: "快晴", 1: "概ね晴れ", 2: "部分的に曇り", 3: "曇り",
            45: "霧", 48: "霧氷",
            51: "霧雨 (弱)", 53: "霧雨", 55: "霧雨 (強)",
            56: "凍結性霧雨 (弱)", 57: "凍結性霧雨 (強)",
            61: "雨 (弱)", 63: "雨", 65: "雨 (強)",
            66: "凍結性雨 (弱)", 67: "凍結性雨 (強)",
            71: "雪 (弱)", 73: "雪", 75: "雪 (強)",
            77: "霧雪",
            80: "にわか雨 (弱)", 81: "にわか雨", 82: "にわか雨 (強)",
            85: "雪しぐれ (弱)", 86: "雪しぐれ (強)",
            95: "雷雨 (弱または並)",
            96: "雷雨と雹 (弱)", 99: "雷雨と雹 (強)"
        },
    },
    en: {
        headerTitle: "Xarvio Chat",
        appSuffixTitle: "Farming Support AI",
        agriChanName: "Xarvina-chan",
        agriChanAvatarAlt: "Xarvina-chan Avatar",
        initialAiMessage: "Hello, I'm Xarvina-chan! I can help you with farming questions and record keeping. Feel free to ask me anything. You can upload images from your PC! If needed, I can also display charts.",
        quickQuestionsTitle: "Quick Questions",
        loadingSuggestions: "Updating...", 
        noSuggestions: "No suggestions at the moment.",
        inputPlaceholder: "Type a message or press the mic button to talk...",
        sendButton: "Send",
        sendButtonAriaLabel: "Send message",
        attachImageLabel: "Attach Image",
        clearImageLabel: "Clear selected image",
        screenShareStartLabel: "Start Screen Sharing",
        screenShareStopLabel: "Stop Screen Sharing",
        screenShareStopButtonText: "Stop",
        micStartLabel: "Start Voice Input",
        micStopLabel: "Stop Recording",
        micStopButtonText: "Stopping...",
        userSenderName: "You",
        aiTyping: "Xarvina-chan is thinking...",
        hamburgerMenuLabel: "Open menu",
        langNameJa: "日本語",
        langNameEn: "English",
        farmMenuLabel: "Farm Selection Menu",
        selectFarmPlaceholder: "Select Farm",
        farms: [
            { id: 'farm_1_en', name: 'Farm A (Large Scale)', latitude: 40.7128, longitude: -74.0060 }, // New York
            { id: 'farm_2_en', name: 'Test Farm B', latitude: 34.0522, longitude: -118.2437 }, // Los Angeles
            { id: 'farm_3_en', name: 'Sato Farm', latitude: 51.5074, longitude: -0.1278 }, // London
            { id: 'farm_4_en', name: 'Green Pastures Dairy', latitude: 48.8566, longitude: 2.3522 }, // Paris
        ],
        errorApiKeyNotSet: "API Key is not configured. The application may not function correctly.", 
        errorAiInitFailed: "Failed to initialize AI Chat. Please try again later.", 
        errorSpeechRecognition: (errorType: string) => `Speech recognition error: ${errorType}`,
        errorSpeechNoSpeech: "No speech was detected.",
        errorSpeechAudioCapture: "There's a problem with your microphone connection.",
        errorSpeechNotAllowed: "Access to the microphone was denied.",
        errorSpeechGeneric: "An unknown error occurred.",
        errorImageFileNotImage: "Please select an image file.",
        errorSendMessageFailed: "An error occurred while sending the message. Please try again later.",
        errorBrowserNoSpeechRecognition: "Your browser does not support speech recognition.",
        errorSpeechRecognitionStartFailed: "Could not start voice recognition. Please ensure your microphone is connected and access is permitted.",
        errorScreenShareStartFailed: "Could not start screen sharing. Permission may have been denied or cancelled.",
        systemScreenShareStarted: "Screen sharing has started. Please describe the shared content to Xarvina-chan.",
        systemScreenShareStopped: "Screen sharing has stopped.",
        aiSystemInstruction: (aiName: string) => `You are a friendly agricultural support assistant named "${aiName}". Please answer the user's questions in English. You have specialized knowledge in agriculture and strive to provide specific, practical advice.
You must provide your response in the following JSON format:
{
  "response_text": "Your message to the user goes here.",
  "sentiment": "neutral"
}
For the sentiment, please specify one of "neutral", "positive", "negative" that best describes the dominant emotion of your response.
If the user uploads an image, please also comment on the content of the image and provide relevant support. If screen sharing is initiated, prompt the user to describe the shared content.
If you need to display a chart, add a "chartjs" field to your JSON response:
{
  "response_text": "Here is your chart.",
  "sentiment": "neutral",
  "chartjs": { /* Chart.js JSON data... */ }
}
Do not use the \`\`\`chartjs blocks as before; instead, use the "chartjs" field within the JSON structure shown above.`,
        aiQuickQuestionPrompt: (lastAiResponse: string, numSuggestions: number) => `
You are an AI assisting the user. The user is conversing with an agricultural assistant named "Xarvina-chan".
Xarvina-chan's last statement was:
"${lastAiResponse}"

Based on Xarvina-chan's statement, propose ${numSuggestions} relevant "Quick Questions" that the user might ask next.
Provide each question as a short "title" and a "prompt" that the user would actually ask, in English.
Respond in the following JSON format, using the key names "suggestions", "title", "prompt".

Example:
{
  "suggestions": [
    { "title": "More Details", "prompt": "Tell me more about that." }
  ]
}`,
        aiImageOnlyText: "Please check the image.",
        initialQuickQuestionItems: [
          { id: 'field_management_initial_en', title: 'Field Management', recommendedPrompt: 'Which fields need attention?' },
          { id: 'crop_records_initial_en', title: 'Crop Records', recommendedPrompt: 'What\'s the recent growth status?' },
          { id: 'pest_disease_initial_en', title: 'Pest & Disease Info', recommendedPrompt: 'Any recent pest/disease warnings?' }
        ],
        scrollToBottomLabel: "Scroll to bottom",
        todayLabel: "Today",
        yesterdayLabel: "Yesterday",
        chartRenderError: "Failed to render chart.",
        avatarNeutralSrc: defaultKittyGif,
        avatarNeutralAlt: "Xarvina-chan (Neutral)",
        avatarThinkingSrc: defaultKittyGif, 
        avatarThinkingAlt: "Xarvina-chan (Thinking)",
        avatarHappySrc: defaultKittyGif,    
        avatarHappyAlt: "Xarvina-chan (Happy)",
        avatarConcernedSrc: defaultKittyGif, 
        avatarConcernedAlt: "Xarvina-chan (Concerned)",
        clearChatHistoryLabel: "Clear Chat History",
        confirmClearChatTitle: "Confirm",
        confirmClearChatMessage: "Are you sure you want to delete the chat history? This action cannot be undone.",
        confirmClearChatButtonDelete: "Delete",
        confirmClearChatButtonCancel: "Cancel",
        chatHistoryClearedMessage: "Chat history has been cleared.",
        downloadXlsxButtonText: "Download as Excel",
        resizeHandleAriaLabel: "Resize chat panes",
        leftPaneTabAssistant: "Assistant",
        leftPaneTabDashboard: "Dashboard",
        dashboardTitle: "Farm Summary",
        fieldsUnit: "fields",
        dashboardData: {
          pesticideNeeded: { id: 'dash_pest_needed_en', title: 'Pesticide Action', value: '3', unit: 'fields', icon: '⚠️', details: '1 field requires urgent attention.' },
          diseaseRisk: { id: 'dash_disease_risk_en', title: 'Disease Risk Alert', value: 'High', icon: '🔬', details: ['Leaf Blight (High)', 'Sheath Blight (Medium)'] },
          managedFields: { id: 'dash_managed_fields_en', title: 'Managed Fields', value: '15', unit: '/ 20 fields', icon: '🏞️' },
          avgGrowthProgress: { id: 'dash_avg_growth_en', title: 'Avg. Growth Progress', value: '75%', icon: '📊', details: '+5% vs target' },
          fieldsToReviewToday: { id: 'dash_fields_review_en', title: 'Fields to Review Today', icon: '👀', details: null },
          recommendedActionToday: { id: 'dash_rec_action_en', title: 'Recommended Action Today', icon: '💡', details: null }, // Details will be dynamically generated
        },
        dashboardFieldsToReviewTableName: "Field Name",
        dashboardFieldsToReviewTableCrop: "Crop",
        dashboardFieldsToReviewTableStatus: "Status",
        dashboardFieldsToReviewTableLastCheck: "Last Checked",
        dashboardFieldsToReviewTableAssignee: "Assignee",
        dashboardFieldsToReviewTableNotes: "Notes",
        dashboardFieldsToReviewTableNoData: "No fields to review today.",
        dashboardFieldsToReviewTableLoading: "Loading field data...",
        dashboardFieldsToReviewTableError: "Failed to load field data.",
        recActionDateLabel: "Date",
        recActionLocationLabel: "Location",
        recActionWeatherLabel: "Weather",
        recActionAILabel: "Recommended Actions",
        recActionNoFarmSelected: "No farm selected. Select a farm to view recommended actions.",
        recActionNoCoordinates: "Location data is missing for the selected farm. Weather forecast and recommendations cannot be displayed.",
        recActionWeatherLoading: "Loading weather forecast...",
        recActionWeatherError: "Failed to load weather forecast.",
        recActionAILoading: "Loading AI recommendations...",
        recActionAIError: "Failed to load recommendations.",
        recActionTempMax: "Max",
        recActionTempMin: "Min",
        recActionPrecipitationProb: "Precip. Prob.",
        aiPromptForDailyRecommendation: (date, farmName, weather) => `The weather for ${farmName} on ${date} is ${weather}. Based on this information, please provide one or two concise, specific farming task recommendations for today.`,
        weatherConditions: {
            0: "Clear sky", 1: "Mainly clear", 2: "Partly cloudy", 3: "Overcast",
            45: "Fog", 48: "Depositing rime fog",
            51: "Light drizzle", 53: "Moderate drizzle", 55: "Dense drizzle",
            56: "Light freezing drizzle", 57: "Dense freezing drizzle",
            61: "Slight rain", 63: "Moderate rain", 65: "Heavy rain",
            66: "Light freezing rain", 67: "Heavy freezing rain",
            71: "Slight snow fall", 73: "Moderate snow fall", 75: "Heavy snow fall",
            77: "Snow grains",
            80: "Slight rain showers", 81: "Moderate rain showers", 82: "Violent rain showers",
            85: "Slight snow showers", 86: "Heavy snow showers",
            95: "Thunderstorm: Slight or moderate",
            96: "Thunderstorm with slight hail", 99: "Thunderstorm with heavy hail"
        },
    }
};

interface WeatherData {
    temperature_2m_max: number;
    temperature_2m_min: number;
    precipitation_probability_max: number;
    weather_code: number; // WMO Weather interpretation codes
}

interface RecommendedActionState {
    date: string;
    farmName: string | null;
    weather: {
        data: WeatherData | null;
        loading: boolean;
        error: string | null;
        icon: string | null;
        description: string | null;
    };
    aiRecommendation: {
        text: string | null;
        loading: boolean;
        error: string | null;
    };
}

const getWeatherIcon = (wmoCode: number): string => {
    if (wmoCode === 0) return '☀️'; // Clear sky
    if (wmoCode >= 1 && wmoCode <= 2) return '🌤️'; // Mainly clear, partly cloudy
    if (wmoCode === 3) return '☁️'; // Overcast
    if (wmoCode === 45 || wmoCode === 48) return '🌫️'; // Fog
    if ((wmoCode >= 51 && wmoCode <= 57) || (wmoCode >= 61 && wmoCode <= 67) || (wmoCode >= 80 && wmoCode <= 82)) return '🌧️'; // Drizzle, Rain, Rain showers
    if ((wmoCode >= 71 && wmoCode <= 77) || (wmoCode >= 85 && wmoCode <= 86)) return '❄️'; // Snow
    if (wmoCode >= 95 && wmoCode <= 99) return '⛈️'; // Thunderstorm
    return '❓'; // Unknown
};


const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve((reader.result as string).split(',')[1]); 
        reader.onerror = error => reject(error);
    });
};

const tableToXlsx = (tableEl: HTMLTableElement, filename: string) => {
    if (!window.XLSX) {
        console.error("SheetJS (XLSX) library not loaded.");
        return;
    }
    const wb = window.XLSX.utils.table_to_book(tableEl);
    window.XLSX.writeFile(wb, filename);
};


function ChartRenderer({ chartJsonData, errorText }: { chartJsonData: string, errorText: string }) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const chartInstanceRef = useRef<any | null>(null); 
    const [renderError, setRenderError] = useState<string | null>(null);

    useEffect(() => {
        setRenderError(null); 
        if (canvasRef.current) {
            let parsedConfig: any;
            try {
                parsedConfig = JSON.parse(chartJsonData);
            } catch (e) {
                console.error("Failed to parse chart JSON:", e);
                setRenderError(errorText + " (Invalid JSON)");
                return;
            }

            if (chartInstanceRef.current) {
                chartInstanceRef.current.destroy();
                chartInstanceRef.current = null;
            }

            try {
                if (!parsedConfig.options) {
                    parsedConfig.options = {};
                }
                parsedConfig.options.maintainAspectRatio = false;
                if (!parsedConfig.options.responsive) {
                    parsedConfig.options.responsive = true;
                }

                chartInstanceRef.current = new window.Chart(canvasRef.current, parsedConfig);
            } catch (e) {
                console.error("Failed to render chart with Chart.js:", e);
                setRenderError(errorText + " (Chart.js error)");
            }
        }

        return () => {
            if (chartInstanceRef.current) {
                chartInstanceRef.current.destroy();
                chartInstanceRef.current = null;
            }
        };
    }, [chartJsonData, errorText]);

    if (renderError) {
        return html`<div className="chart-error" role="alert">${renderError}</div>`;
    }

    return html`
        <div className="chart-canvas-container">
            <canvas ref=${canvasRef}></canvas>
        </div>
    `;
}

function MarkdownRenderer({ markdown, currentTranslations }: { markdown: string, currentTranslations: UIDescriptions }) {
    const contentRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (contentRef.current) {
            const rawHtml = marked.parse(markdown || '', { breaks: true, gfm: true });
            contentRef.current.innerHTML = rawHtml;

            const tables = contentRef.current.querySelectorAll('table');
            tables.forEach((tableEl, index) => {
                const existingActions = tableEl.parentElement?.querySelector(`.table-actions-container[data-table-idx="${index}"]`);
                if (existingActions) {
                    existingActions.remove();
                }

                const actionsContainer = document.createElement('div');
                actionsContainer.className = 'table-actions-container';
                actionsContainer.setAttribute('data-table-idx', String(index));

                if (window.XLSX) {
                    const xlsxButton = document.createElement('button');
                    xlsxButton.className = 'table-download-button xlsx-download';
                    xlsxButton.textContent = `💾 ${currentTranslations.downloadXlsxButtonText}`;
                    xlsxButton.title = currentTranslations.downloadXlsxButtonText;
                    xlsxButton.setAttribute('aria-label', currentTranslations.downloadXlsxButtonText);
                    xlsxButton.onclick = () => {
                        const timestamp = new Date().toISOString().replace(/[:.T-]/g, '').slice(0, 14);
                        tableToXlsx(tableEl, `table_export_${timestamp}_${index}.xlsx`);
                    };
                    actionsContainer.appendChild(xlsxButton);
                }
                
                if (tableEl.parentNode && actionsContainer.hasChildNodes()) { 
                    tableEl.parentNode.insertBefore(actionsContainer, tableEl.nextSibling);
                }
            });
        }
    }, [markdown, currentTranslations]);

    return html`<div className="markdown-content" ref=${contentRef}></div>`;
}

const formatTimestamp = (timestamp: number, language: Language, translations: UIDescriptions): string => {
    if (typeof timestamp !== 'number' || isNaN(timestamp)) {
        return '';
    }
    const date = new Date(timestamp);
    const now = new Date();

    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfYesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);

    const timeOptions: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit', hour12: language === 'en' };
    const timeStr = date.toLocaleTimeString(language === 'ja' ? 'ja-JP' : 'en-US', timeOptions);

    if (date.getTime() >= startOfToday.getTime()) {
        return `${translations.todayLabel} ${timeStr}`;
    } else if (date.getTime() >= startOfYesterday.getTime()) {
        return `${translations.yesterdayLabel} ${timeStr}`;
    } else {
        if (language === 'ja') {
            const dateOptionsJa: Intl.DateTimeFormatOptions = { year: 'numeric', month: '2-digit', day: '2-digit' };
            const dateStrJa = date.toLocaleDateString('ja-JP', dateOptionsJa);
            return `${dateStrJa} ${timeStr}`;
        } else { // 'en'
            const dateOptionsEn: Intl.DateTimeFormatOptions = { year: 'numeric', month: '2-digit', day: '2-digit' };
            const dateStrEn = date.toLocaleDateString('en-US', dateOptionsEn); 
            return `${dateStrEn}, ${timeStr}`;
        }
    }
};

const getAvatarProps = (avatarState: AvatarState, translations: UIDescriptions) => {
    switch (avatarState) {
        case 'thinking':
            return { src: translations.avatarThinkingSrc, alt: translations.avatarThinkingAlt };
        case 'happy':
            return { src: translations.avatarHappySrc, alt: translations.avatarHappyAlt };
        case 'concerned':
            return { src: translations.avatarConcernedSrc, alt: translations.avatarConcernedAlt };
        case 'neutral':
        default:
            return { src: translations.avatarNeutralSrc, alt: translations.avatarNeutralAlt };
    }
};

const parseCsvText = (csvText: string): string[][] => {
    if (!csvText || typeof csvText !== 'string') return [];
    const lines = csvText.trim().split('\n');
    return lines.map(line => line.split(',').map(cell => cell.trim()));
};


function App() {
    const [language, setLanguage] = useState<Language>('ja');
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [selectedFarmId, setSelectedFarmId] = useState<string | null>(null);
    const [isFarmMenuOpen, setIsFarmMenuOpen] = useState(false);
    const currentTranslations = translations[language];
    const [currentAvatarState, setCurrentAvatarState] = useState<AvatarState>('neutral');
    const [leftPaneView, setLeftPaneView] = useState<LeftPaneView>('assistant');

    const [chat, setChat] = useState<Chat | null>(null);
    const [aiInstance, setAiInstance] = useState<GoogleGenAI | null>(null);
    const [messages, setMessages] = useState<Message[]>([]); 
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isRecording, setIsRecording] = useState(false);
    const [quickQuestionItems, setQuickQuestionItems] = useState<QuickQuestionItem[]>(currentTranslations.initialQuickQuestionItems);
    const [isSharingScreen, setIsSharingScreen] = useState(false);
    const [screenShareStream, setScreenShareStream] = useState<MediaStream | null>(null);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
    const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null); 
    const [showScrollToBottom, setShowScrollToBottom] = useState(false);
    const [showClearHistoryConfirm, setShowClearHistoryConfirm] = useState(false);
    const [leftPaneWidth, setLeftPaneWidth] = useState<number>(20); 

    const chatHistoryRef = useRef<HTMLDivElement | null>(null);
    const chatInputRef = useRef<HTMLTextAreaElement | null>(null); 
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const selectedImageFileRef = useRef(selectedImageFile);
    const menuRef = useRef<HTMLDivElement | null>(null);
    const farmMenuRef = useRef<HTMLDivElement | null>(null);
    const isInitialMessagesSet = useRef(false);
    const mainContentRef = useRef<HTMLElement | null>(null);
    const isResizingRef = useRef(false);
    const startXRef = useRef(0);
    const startWidthRef = useRef(0);

    const [fieldsToReviewData, setFieldsToReviewData] = useState<{ headers: string[], rows: string[][], loading: boolean, error: string | null }>({
        headers: [],
        rows: [],
        loading: false,
        error: null,
    });

    const [recommendedActionData, setRecommendedActionData] = useState<RecommendedActionState>({
        date: '',
        farmName: null,
        weather: { data: null, loading: false, error: null, icon: null, description: null },
        aiRecommendation: { text: null, loading: false, error: null },
    });


    useEffect(() => {
        selectedImageFileRef.current = selectedImageFile;
    }, [selectedImageFile]);

     useEffect(() => {
        const handleResize = () => {
            const newIsMobile = window.innerWidth <= 768;
            if (newIsMobile && !isMobile && selectedImageFileRef.current) { 
                clearSelectedImage();
            }
            setIsMobile(newIsMobile);
             if (newIsMobile) setLeftPaneView('assistant'); 
        };
        
        const initialMobile = window.innerWidth <= 768;
        if (initialMobile && selectedImageFileRef.current) { 
            clearSelectedImage();
        }
        setIsMobile(initialMobile);
        if (initialMobile) setLeftPaneView('assistant');


        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [isMobile]); 

    useEffect(() => {
        isInitialMessagesSet.current = false;
        setError(null); 
        setCurrentAvatarState('neutral');
        setQuickQuestionItems(currentTranslations.initialQuickQuestionItems);


        try {
            if (!process.env.API_KEY) {
                console.error("API_KEY is not available in process.env.");
                setError(currentTranslations.errorApiKeyNotSet);
                setCurrentAvatarState('concerned');
                 setMessages([{ id: `intro-error-${Date.now()}-${language}`, sender: 'ai', text: currentTranslations.initialAiMessage, timestamp: Date.now() }]);
                isInitialMessagesSet.current = true;
                return;
            }

            const genAI = new GoogleGenAI({ apiKey: process.env.API_KEY });
            setAiInstance(genAI); 

            const chatInstance = genAI.chats.create({
                model: 'gemini-2.5-flash-preview-04-17',
            });
            setChat(chatInstance);
            
            const localStorageKey = `xarvioChatHistory_${language}`;
            const storedMessages = localStorage.getItem(localStorageKey);
            let loadedMessages = false;

            if (storedMessages) {
                try {
                    const parsedMessages = (JSON.parse(storedMessages) as Message[]).map(msg => ({
                        ...msg,
                        timestamp: msg.timestamp || Date.now() 
                    }));
                    if (Array.isArray(parsedMessages) && parsedMessages.length > 0) {
                        setMessages(parsedMessages);
                        loadedMessages = true;
                    }
                } catch (e) {
                    console.error("Failed to parse chat history from localStorage", e);
                    localStorage.removeItem(localStorageKey); 
                }
            }

            if (!loadedMessages) {
                setMessages([{ id: `intro-${Date.now()}-${language}`, sender: 'ai', text: currentTranslations.initialAiMessage, timestamp: Date.now() }]);
            }
            
            setInputValue(''); 
            isInitialMessagesSet.current = true;
            if (chatInputRef.current) chatInputRef.current.focus();

        } catch (err) {
            console.error("AI Chat initialization failed:", err);
            setError(currentTranslations.errorAiInitFailed);
            setCurrentAvatarState('concerned');
            setMessages([{ id: `intro-error-catch-${Date.now()}-${language}`, sender: 'ai', text: currentTranslations.initialAiMessage, timestamp: Date.now() }]); 
            isInitialMessagesSet.current = true;
        }
    }, [language, currentTranslations.initialAiMessage, currentTranslations.errorApiKeyNotSet, currentTranslations.errorAiInitFailed, currentTranslations.initialQuickQuestionItems]);

    useEffect(() => {
        if (!isInitialMessagesSet.current || messages.length === 0) {
            return; 
        }
        const isOnlyInitialMessage = messages.length === 1 &&
                                   messages[0].text === currentTranslations.initialAiMessage &&
                                   messages[0].id.startsWith('intro-');

        if (isOnlyInitialMessage && !localStorage.getItem(`xarvioChatHistory_${language}`)) {
            return;
        }
        const localStorageKey = `xarvioChatHistory_${language}`;
        localStorage.setItem(localStorageKey, JSON.stringify(messages));
    }, [messages, language, currentTranslations.initialAiMessage]);


    useEffect(() => {
        document.title = `${currentTranslations.headerTitle} - ${currentTranslations.appSuffixTitle}`;
        document.documentElement.lang = language;
         setQuickQuestionItems(currentTranslations.initialQuickQuestionItems); 
         setFieldsToReviewData({ headers: [], rows: [], loading: false, error: null });
         // Reset recommended action data on language change for re-fetch
         setRecommendedActionData(prev => ({
            ...prev,
            date: new Date().toLocaleDateString(language === 'ja' ? 'ja-JP' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
            weather: { data: null, loading: false, error: null, icon: null, description: null },
            aiRecommendation: { text: null, loading: false, error: null },
        }));
    }, [currentTranslations.headerTitle, currentTranslations.appSuffixTitle, language, currentTranslations.initialQuickQuestionItems]);

    useEffect(() => {
        const chatHistoryEl = chatHistoryRef.current;
        if (chatHistoryEl) {
            const isNearBottom = chatHistoryEl.scrollHeight - chatHistoryEl.scrollTop - chatHistoryEl.clientHeight < 100;
            const lastMessage = messages[messages.length - 1];
            
            if (isNearBottom || (lastMessage && lastMessage.sender === 'ai')) {
                 chatHistoryEl.scrollTop = chatHistoryEl.scrollHeight;
            }
        }
    }, [messages, isLoading, isLoadingSuggestions]); 

    useEffect(() => {
        const chatHistoryEl = chatHistoryRef.current;
        if (!chatHistoryEl) return;

        const handleScroll = () => {
            const { scrollTop, scrollHeight, clientHeight } = chatHistoryEl;
            if (scrollHeight - (scrollTop + clientHeight) > clientHeight * 0.5 || scrollHeight - (scrollTop + clientHeight) > 300) {
                setShowScrollToBottom(true);
            } else {
                setShowScrollToBottom(false);
            }
        };
        chatHistoryEl.addEventListener('scroll', handleScroll);
        handleScroll(); 
        return () => chatHistoryEl.removeEventListener('scroll', handleScroll);
    }, [messages]); 


    useEffect(() => {
        if (!recognition) return;

        recognition.onresult = (event: SpeechRecognitionEvent) => {
            let interimTranscript = '';
            let finalTranscript = '';

            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    finalTranscript += event.results[i][0].transcript;
                } else {
                    interimTranscript += event.results[i][0].transcript;
                }
            }
            
            setInputValue(finalTranscript || interimTranscript);

            if (finalTranscript) {
                sendMessageRef.current(finalTranscript.trim());
                 if (chatInputRef.current) { chatInputRef.current.style.height = 'auto';} 
            }
        };

        recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
            console.error('Speech recognition error:', event.error);
            setCurrentAvatarState('concerned');
            let specificError = currentTranslations.errorSpeechGeneric;
            if (event.error === 'no-speech') specificError = currentTranslations.errorSpeechNoSpeech;
            else if (event.error === 'audio-capture') specificError = currentTranslations.errorSpeechAudioCapture;
            else if (event.error === 'not-allowed') specificError = currentTranslations.errorSpeechNotAllowed;
            
            setError(currentTranslations.errorSpeechRecognition(specificError));
            setIsRecording(false);
        };

        recognition.onend = () => {
            setIsRecording(false);
        };
    }, [language, currentTranslations]); 

    useEffect(() => {
        const handleClickOutsideLanguageMenu = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutsideLanguageMenu as EventListener);
        return () => {
            document.removeEventListener('mousedown', handleClickOutsideLanguageMenu as EventListener);
        };
    }, []);

    useEffect(() => {
        const handleClickOutsideFarmMenu = (event: MouseEvent) => {
            if (farmMenuRef.current && !farmMenuRef.current.contains(event.target as Node)) {
                setIsFarmMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutsideFarmMenu as EventListener);
        return () => {
            document.removeEventListener('mousedown', handleClickOutsideFarmMenu as EventListener);
        };
    }, []);

    useEffect(() => {
        if (error) {
            setCurrentAvatarState('concerned');
        } else if (!isLoading) {
           // setCurrentAvatarState('neutral'); 
        }
    }, [error, isLoading]);

    useEffect(() => {
        if (!isMobile) {
            const storedWidth = localStorage.getItem('xarvioChatLeftPaneWidth');
            let initialWidth = 25; 
            if (storedWidth) {
                const parsedWidth = parseFloat(storedWidth);
                if (!isNaN(parsedWidth) && parsedWidth >= 15 && parsedWidth <= 50) { 
                    initialWidth = parsedWidth;
                } else {
                    localStorage.removeItem('xarvioChatLeftPaneWidth'); 
                }
            }
            setLeftPaneWidth(initialWidth);
        }
    }, [isMobile]);

    useEffect(() => {
        if (!isMobile && !isResizingRef.current && leftPaneWidth > 0) {
            localStorage.setItem('xarvioChatLeftPaneWidth', String(leftPaneWidth));
        }
    }, [leftPaneWidth, isMobile]);


    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (!isResizingRef.current || isMobile) return;

        const parent = mainContentRef.current;
        if (!parent) return;
        const parentWidth = parent.offsetWidth;
        if (parentWidth === 0) return; 

        const deltaX = e.clientX - startXRef.current;
        const currentStartPixelWidth = startWidthRef.current;

        let newPixelWidth = currentStartPixelWidth + deltaX;
        let newPercentageWidth = (newPixelWidth / parentWidth) * 100;

        newPercentageWidth = Math.max(15, Math.min(newPercentageWidth, 50)); 
        setLeftPaneWidth(newPercentageWidth);
    }, [isMobile]);

    const handleMouseUp = useCallback(() => {
        isResizingRef.current = false;
        document.removeEventListener('mousemove', handleMouseMove); 
        document.removeEventListener('mouseup', handleMouseUp);   
        document.body.style.userSelect = ''; 
        document.body.style.cursor = '';
    }, [handleMouseMove]); 

    const handleMouseDownOnResizeHandle = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        if (isMobile) return;
        isResizingRef.current = true;
        startXRef.current = e.clientX;

        const parent = mainContentRef.current;
        if (!parent) return;
        startWidthRef.current = (leftPaneWidth / 100) * parent.offsetWidth;

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        document.body.style.userSelect = 'none'; 
        document.body.style.cursor = 'col-resize';
        e.preventDefault();
    }, [isMobile, leftPaneWidth, handleMouseMove, handleMouseUp]);


    const addSystemMessage = (text: string) => {
        setMessages(prevMessages => [...prevMessages, { id: `${Date.now()}-system`, sender: 'system', text, timestamp: Date.now() }]);
    };
   
    const fetchAndUpdateQuickQuestions = async (lastAiResponseText: string) => {
        if (!aiInstance) {
            console.warn("AI instance not available for suggestions.");
            setQuickQuestionItems(currentTranslations.initialQuickQuestionItems); 
            return;
        }
        setIsLoadingSuggestions(true);
        try {
            const numSuggestions = isMobile ? 2 : 3;
            const suggestionPrompt = currentTranslations.aiQuickQuestionPrompt(lastAiResponseText, numSuggestions);
            
            const response: GenerateContentResponse = await aiInstance.models.generateContent({
                model: 'gemini-2.5-flash-preview-04-17',
                contents: suggestionPrompt,
                config: {
                    responseMimeType: "application/json",
                    thinkingConfig: { thinkingBudget: 0 } 
                }
            });

            let jsonStr = response.text.trim();
            const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
            const match = jsonStr.match(fenceRegex);
            if (match && match[2]) {
              jsonStr = match[2].trim();
            }

            const parsedData = JSON.parse(jsonStr);

            if (parsedData && Array.isArray(parsedData.suggestions)) {
                const newSuggestions: QuickQuestionItem[] = parsedData.suggestions.map((sug: {title: string, prompt: string}, index: number) => ({
                    id: `dynamic-${Date.now()}-${index}`,
                    title: sug.title,
                    recommendedPrompt: sug.prompt
                }));
                if (newSuggestions.length > 0) {
                    setQuickQuestionItems(newSuggestions);
                } else {
                     setQuickQuestionItems(currentTranslations.initialQuickQuestionItems); 
                }
            } else {
                console.warn("Unexpected format for suggestions:", parsedData);
                setQuickQuestionItems(currentTranslations.initialQuickQuestionItems); 
            }

        } catch (err) {
            console.error("Error fetching or parsing dynamic quick questions:", err);
            setQuickQuestionItems(currentTranslations.initialQuickQuestionItems); 
        } finally { 
            setIsLoadingSuggestions(false);
        }
    };

    const sendMessageRef = useRef(sendMessage);
    useEffect(() => {
        sendMessageRef.current = sendMessage;
    }, [sendMessage]); 
    
    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => { 
        setInputValue(e.target.value);
        const textarea = e.target;
        textarea.style.height = 'auto'; 
        const scrollHeight = textarea.scrollHeight;
        const maxHeight = 120; 
        if (scrollHeight > maxHeight) {
            textarea.style.height = `${maxHeight}px`;
            textarea.style.overflowY = 'auto'; 
        } else {
            textarea.style.height = `${scrollHeight}px`;
            textarea.style.overflowY = 'hidden'; 
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (!file.type.startsWith('image/')) {
                setError(currentTranslations.errorImageFileNotImage);
                setCurrentAvatarState('concerned');
                setSelectedImageFile(null);
                setImagePreviewUrl(null);
                if (fileInputRef.current) fileInputRef.current.value = ""; 
                return;
            }
            setSelectedImageFile(file);
            setImagePreviewUrl(URL.createObjectURL(file)); 
            setError(null);
            if (!isMobile && chatInputRef.current) chatInputRef.current.focus();
        }
    };

    const clearSelectedImage = () => {
        setSelectedImageFile(null);
        setImagePreviewUrl(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = ""; 
        }
        if (!isMobile && chatInputRef.current) chatInputRef.current.focus();
    };

    async function sendMessage(messageTextParam?: string) {
        const textToSend = (messageTextParam || inputValue).trim(); 
        
        if (!textToSend && !selectedImageFile) {
             console.warn("Attempted to send message without text or image.");
             return;
        }

        if (!chat || isLoading || isLoadingSuggestions) { 
             return; 
        }
        
        setIsLoading(true);
        setCurrentAvatarState('thinking');
        setError(null);

        let imageBase64Data: string | undefined = undefined;
        let imageMimeTypeData: string | undefined = undefined;
        let currentImageFile = selectedImageFile; 

        if (currentImageFile && !isMobile) {
            try {
                imageBase64Data = await convertFileToBase64(currentImageFile);
                imageMimeTypeData = currentImageFile.type;
            } catch (err) {
                console.error("Error converting image to base64:", err);
                setError(currentTranslations.errorSendMessageFailed); 
                setCurrentAvatarState('concerned');
                setIsLoading(false);
                return;
            }
        }
        
        const actualTextToSend = textToSend || (currentImageFile ? currentTranslations.aiImageOnlyText : "");
        if (!actualTextToSend && !currentImageFile) {
            setIsLoading(false);
            setCurrentAvatarState('neutral');
            return; 
        }

        const userMessage: Message = { 
            id: `${Date.now()}-user`, 
            sender: 'user', 
            text: actualTextToSend,
            timestamp: Date.now(),
            imageBase64: imageBase64Data,
            imageMimeType: imageMimeTypeData,
        };
        setMessages(prevMessages => [...prevMessages, userMessage]);
        
        if (!messageTextParam) { 
          setInputValue('');
          if (chatInputRef.current) { 
            chatInputRef.current.style.height = 'auto';
            chatInputRef.current.style.overflowY = 'hidden';
          }
        }
        
        clearSelectedImage(); 

        const aiMessageId = `${Date.now()}-ai-stream`;
        const aiMessageTimestamp = Date.now();
        setMessages(prevMessages => [...prevMessages, { id: aiMessageId, sender: 'ai', text: '', timestamp: aiMessageTimestamp }]);
        
        let accumulatedAiJsonResponse = "";
        let streamHasProcessedFirstChunk = false; 

        try {
            const messagePartsForAI: Part[] = [];
             if (actualTextToSend) {
                messagePartsForAI.push({ text: actualTextToSend });
            }

            if (imageBase64Data && imageMimeTypeData) { 
                messagePartsForAI.push({
                    inlineData: {
                        data: imageBase64Data,
                        mimeType: imageMimeTypeData
                    }
                });
            }
            
            const streamResponse = await chat.sendMessageStream({
                 message: [
                    {text: currentTranslations.aiSystemInstruction(currentTranslations.agriChanName)}, 
                    ...messagePartsForAI 
                 ],
                 config: { responseMimeType: "application/json" } 
            });
            
            for await (const chunk of streamResponse) {
                 if (!streamHasProcessedFirstChunk && chunk.text) { 
                    setIsLoading(false); 
                    setCurrentAvatarState('neutral'); 
                    streamHasProcessedFirstChunk = true;
                }
                accumulatedAiJsonResponse += chunk.text;
                setMessages(prevMessages => 
                    prevMessages.map(msg => 
                        msg.id === aiMessageId ? { ...msg, text: accumulatedAiJsonResponse } : msg
                    )
                );
            }
            
            if (!streamHasProcessedFirstChunk && isLoading) { 
                setIsLoading(false);
                setCurrentAvatarState('neutral');
            }

            try {
                let jsonStrToParse = accumulatedAiJsonResponse.trim();
                const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
                const matchFence = jsonStrToParse.match(fenceRegex);
                if (matchFence && matchFence[2]) {
                  jsonStrToParse = matchFence[2].trim();
                }

                const parsedResponse = JSON.parse(jsonStrToParse);
                const messageText = parsedResponse.response_text || "";
                const sentiment = parsedResponse.sentiment || 'neutral';
                const chartDataString = parsedResponse.chartjs ? JSON.stringify(parsedResponse.chartjs) : undefined;

                setMessages(prevMessages =>
                    prevMessages.map(msg =>
                        msg.id === aiMessageId ? { ...msg, text: messageText, chartData: chartDataString } : msg
                    )
                );

                if (sentiment === 'positive') setCurrentAvatarState('happy');
                else if (sentiment === 'negative') setCurrentAvatarState('concerned');
                else setCurrentAvatarState('neutral');
                
                if (leftPaneView === 'assistant') { 
                    await fetchAndUpdateQuickQuestions(messageText || (currentImageFile ? currentTranslations.aiImageOnlyText : ""));
                }


            } catch (parseError) {
                 console.error("Error parsing AI JSON response:", parseError, "Raw response:", accumulatedAiJsonResponse);
                 setError(currentTranslations.errorSendMessageFailed + " (AI response format error)");
                 setCurrentAvatarState('concerned');
                 setMessages(prevMessages =>
                    prevMessages.map(msg =>
                        msg.id === aiMessageId ? { ...msg, text: accumulatedAiJsonResponse + `\n\n[${currentTranslations.errorSendMessageFailed}]` } : msg
                    )
                );
            }

        } catch (err) {
            console.error("Error sending message to AI:", err);
            setError(currentTranslations.errorSendMessageFailed);
            setCurrentAvatarState('concerned');
            setMessages(prevMessages => prevMessages.filter(msg => msg.id !== aiMessageId)); 
            if (!currentImageFile && !messageTextParam) { 
                setInputValue(actualTextToSend); 
            }
            setIsLoading(false); 
            setIsLoadingSuggestions(false); 
        } finally {
            if (chatInputRef.current) chatInputRef.current.focus();
        }
    };
    
    const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => { 
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            const sendButtonDisabled = isLoading || isLoadingSuggestions || (!inputValue.trim() && !selectedImageFile) || isRecording || isSharingScreen;
            if (!sendButtonDisabled) {
                sendMessage();
            }
        }
    };

    const toggleVoiceRecording = () => {
        if (!recognition) {
            setError(currentTranslations.errorBrowserNoSpeechRecognition);
            setCurrentAvatarState('concerned');
            return;
        }
        if (isRecording) {
            recognition.stop();
        } else {
            setInputValue(''); 
            if (chatInputRef.current) { chatInputRef.current.style.height = 'auto';}
            clearSelectedImage();
            setError(null); 
            setCurrentAvatarState('neutral');
            try {
                recognition.lang = language === 'ja' ? 'ja-JP' : 'en-US'; 
                recognition.start();
                setIsRecording(true);
            } catch (err) {
                 console.error("Error starting voice recognition:", err);
                 setError(currentTranslations.errorSpeechRecognitionStartFailed);
                 setCurrentAvatarState('concerned');
                 setIsRecording(false);
            }
        }
    };
    
    const handleQuickQuestionClick = (prompt: string) => {
      clearSelectedImage(); 
      setInputValue(prompt); 
      if (chatInputRef.current) {
        chatInputRef.current.value = prompt; 
        const textarea = chatInputRef.current;
        textarea.style.height = 'auto'; 
        const scrollHeight = textarea.scrollHeight;
        const maxHeight = 120; 
        if (scrollHeight > maxHeight) {
            textarea.style.height = `${maxHeight}px`;
            textarea.style.overflowY = 'auto'; 
        } else {
            textarea.style.height = `${scrollHeight}px`;
            textarea.style.overflowY = 'hidden'; 
        }
      }
      sendMessage(prompt); 
      if (chatInputRef.current) {
        chatInputRef.current.focus();
      }
    };

    const stopScreenSharingEffects = () => {
        if (screenShareStream) {
            screenShareStream.getTracks().forEach(track => track.stop());
        }
        setIsSharingScreen(false);
        setScreenShareStream(null);
        addSystemMessage(currentTranslations.systemScreenShareStopped);
        if (chatInputRef.current) chatInputRef.current.focus();
    };

    const toggleScreenSharing = async () => {
        if (isSharingScreen) {
            stopScreenSharingEffects();
        } else {
            try {
                // @ts-ignore
                const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false });
                setScreenShareStream(stream);
                setIsSharingScreen(true);
                addSystemMessage(currentTranslations.systemScreenShareStarted);
                clearSelectedImage();

                if (stream.getVideoTracks().length > 0) {
                    const videoTrack = stream.getVideoTracks()[0];
                    videoTrack.onended = () => { 
                        stopScreenSharingEffects();
                    };
                }
            } catch (err) {
                console.error("Error starting screen sharing:", err);
                setError(currentTranslations.errorScreenShareStartFailed);
                setCurrentAvatarState('concerned');
                setIsSharingScreen(false);
                setScreenShareStream(null);
            }
        }
    };

    const handleClearChatHistory = () => {
        const localStorageKey = `xarvioChatHistory_${language}`;
        localStorage.removeItem(localStorageKey);
        setMessages([{ id: `intro-${Date.now()}-${language}`, sender: 'ai', text: currentTranslations.initialAiMessage, timestamp: Date.now() }]);
        setQuickQuestionItems(currentTranslations.initialQuickQuestionItems);
        setError(null);
        setInputValue('');
        setCurrentAvatarState('neutral');
        addSystemMessage(currentTranslations.chatHistoryClearedMessage);
        setShowClearHistoryConfirm(false);
        setIsMenuOpen(false);
        if (chatInputRef.current) {
            chatInputRef.current.style.height = 'auto';
            chatInputRef.current.focus();
        }
    };


    const HeaderAvatar = ({ isMobile, currentTranslations, avatarState }: { isMobile: boolean, currentTranslations: UIDescriptions, avatarState: AvatarState }) => {
        if (isMobile) {
            const mobileAvatar = getAvatarProps(avatarState, currentTranslations); 
            return html`<img src=${mobileAvatar.src} alt=${mobileAvatar.alt} className="header-avatar-gif-mobile" />`;
        }
        return html`<img src="https://www.xarvio-japan.jp/hubfs/Xarvio_February_2025/Images/logo.png" alt="Xarvio Logo" className="header-avatar-icon"/>`;
    };
    
    const itemsToDisplay = quickQuestionItems.length > 0 ? quickQuestionItems : currentTranslations.initialQuickQuestionItems;
    const itemsToRender = isMobile 
        ? itemsToDisplay.slice(0, 2)
        : itemsToDisplay.slice(0, 3);

    const scrollToChatBottom = () => {
        if (chatHistoryRef.current) {
            chatHistoryRef.current.scrollTo({
                top: chatHistoryRef.current.scrollHeight,
                behavior: 'smooth'
            });
             setShowScrollToBottom(false); 
        }
    };

    const animatedAvatarProps = getAvatarProps(currentAvatarState, currentTranslations);

    const fetchFieldsToReviewCsv = useCallback(async () => {
        setFieldsToReviewData(prev => ({ ...prev, loading: true, error: null }));
        try {
            const response = await fetch('/fields_to_review_today.csv');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const csvText = await response.text();
            const parsedData = parseCsvText(csvText);

            if (parsedData.length > 0) {
                const headers = parsedData[0];
                const rows = parsedData.slice(1);
                const translatedHeaders = headers.map(header => {
                    switch(header.toLowerCase()) { // Use toLowerCase for case-insensitive matching
                        case '圃場名': case 'field name': return currentTranslations.dashboardFieldsToReviewTableName;
                        case '作物': case 'crop': return currentTranslations.dashboardFieldsToReviewTableCrop;
                        // Removed cases for 'ステータス', '最終確認日', '担当者', '備考' as they are not in the new CSV
                        default: return header; // Display other headers as is
                    }
                });
                setFieldsToReviewData({ headers: translatedHeaders, rows, loading: false, error: null });
            } else {
                setFieldsToReviewData({ headers: [], rows: [], loading: false, error: null }); 
            }
        } catch (err) {
            console.error("Error fetching or parsing CSV:", err);
            setFieldsToReviewData({ headers: [], rows: [], loading: false, error: currentTranslations.dashboardFieldsToReviewTableError });
        }
    }, [language, currentTranslations]); 


    useEffect(() => {
        if (leftPaneView === 'dashboard' && !isMobile) {
            fetchFieldsToReviewCsv();
        }
    }, [leftPaneView, isMobile, fetchFieldsToReviewCsv]);

    // Fetch dynamic data for "Recommended Action Today" card
    useEffect(() => {
        const fetchRecommendedActionData = async () => {
            const currentFarm = currentTranslations.farms.find(f => f.id === selectedFarmId);
            const today = new Date();
            const formattedDate = today.toLocaleDateString(language === 'ja' ? 'ja-JP' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' });
            
            setRecommendedActionData(prev => ({
                ...prev,
                date: formattedDate,
                farmName: currentFarm?.name || null,
                weather: { data: null, loading: true, error: null, icon: null, description: null },
                aiRecommendation: { text: null, loading: true, error: null },
            }));

            if (!currentFarm) {
                setRecommendedActionData(prev => ({
                    ...prev,
                    weather: { ...prev.weather, loading: false },
                    aiRecommendation: { ...prev.aiRecommendation, loading: false }
                }));
                return;
            }

            if (!currentFarm.latitude || !currentFarm.longitude) {
                setRecommendedActionData(prev => ({
                    ...prev,
                    weather: { ...prev.weather, loading: false, error: currentTranslations.recActionNoCoordinates },
                    aiRecommendation: { ...prev.aiRecommendation, loading: false, error: currentTranslations.recActionNoCoordinates },
                }));
                return;
            }

            // Fetch Weather
            try {
                const weatherResponse = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${currentFarm.latitude}&longitude=${currentFarm.longitude}&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto`);
                if (!weatherResponse.ok) throw new Error(`Weather API error: ${weatherResponse.status}`);
                const weatherJson = await weatherResponse.json();
                
                if (weatherJson.daily && weatherJson.daily.weather_code && weatherJson.daily.weather_code.length > 0) {
                    const dailyData = weatherJson.daily;
                    const weatherData: WeatherData = {
                        weather_code: dailyData.weather_code[0],
                        temperature_2m_max: Math.round(dailyData.temperature_2m_max[0]),
                        temperature_2m_min: Math.round(dailyData.temperature_2m_min[0]),
                        precipitation_probability_max: dailyData.precipitation_probability_max[0],
                    };
                    const weatherDesc = currentTranslations.weatherConditions[weatherData.weather_code] || 'Unknown';
                    const weatherIcon = getWeatherIcon(weatherData.weather_code);

                    setRecommendedActionData(prev => ({
                        ...prev,
                        weather: { data: weatherData, loading: false, error: null, icon: weatherIcon, description: weatherDesc },
                    }));

                    // Fetch AI Recommendation if weather is successfully fetched
                    if (aiInstance) {
                        try {
                            const weatherString = `${weatherDesc}, ${currentTranslations.recActionTempMax}: ${weatherData.temperature_2m_max}°C, ${currentTranslations.recActionTempMin}: ${weatherData.temperature_2m_min}°C, ${currentTranslations.recActionPrecipitationProb}: ${weatherData.precipitation_probability_max}%`;
                            const prompt = currentTranslations.aiPromptForDailyRecommendation(formattedDate, currentFarm.name, weatherString);
                            
                            const aiResponse = await aiInstance.models.generateContent({
                                model: 'gemini-2.5-flash-preview-04-17',
                                contents: prompt,
                                config: { thinkingConfig: { thinkingBudget: 0 } }
                            });
                            setRecommendedActionData(prev => ({
                                ...prev,
                                aiRecommendation: { text: aiResponse.text || null, loading: false, error: null },
                            }));
                        } catch (aiErr) {
                            console.error("Error fetching AI recommendation:", aiErr);
                            setRecommendedActionData(prev => ({
                                ...prev,
                                aiRecommendation: { text: null, loading: false, error: currentTranslations.recActionAIError },
                            }));
                        }
                    } else {
                         setRecommendedActionData(prev => ({
                            ...prev,
                            aiRecommendation: { text: null, loading: false, error: currentTranslations.errorAiInitFailed }, // Or a specific message
                        }));
                    }

                } else {
                    throw new Error("Weather data format incorrect");
                }
            } catch (weatherErr) {
                console.error("Error fetching weather data:", weatherErr);
                setRecommendedActionData(prev => ({
                    ...prev,
                    weather: { data: null, loading: false, error: currentTranslations.recActionWeatherError, icon: null, description: null },
                    aiRecommendation: { ...prev.aiRecommendation, loading: false, error: currentTranslations.recActionWeatherError } // Also mark AI as error if weather fails
                }));
            }
        };

        if (leftPaneView === 'dashboard' && !isMobile && aiInstance) {
            fetchRecommendedActionData();
        } else if (leftPaneView === 'dashboard' && !isMobile && !aiInstance) {
             setRecommendedActionData(prev => ({
                ...prev,
                date: new Date().toLocaleDateString(language === 'ja' ? 'ja-JP' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
                farmName: currentTranslations.farms.find(f => f.id === selectedFarmId)?.name || null,
                weather: { data: null, loading: false, error: null, icon:null, description: null },
                aiRecommendation: { text: null, loading: false, error: currentTranslations.errorAiInitFailed },
            }));
        }

    }, [leftPaneView, isMobile, selectedFarmId, language, currentTranslations, aiInstance]);


    const DashboardView = () => {
        const dashboardCardsDataConfig = currentTranslations.dashboardData;
        
        const renderFieldsToReviewTable = () => {
            if (fieldsToReviewData.loading) {
                return html`<p className="dashboard-table-message">${currentTranslations.dashboardFieldsToReviewTableLoading}</p>`;
            }
            if (fieldsToReviewData.error) {
                return html`<p className="dashboard-table-message error">${fieldsToReviewData.error}</p>`;
            }
            if (!fieldsToReviewData.headers.length || !fieldsToReviewData.rows.length) {
                return html`<p className="dashboard-table-message">${currentTranslations.dashboardFieldsToReviewTableNoData}</p>`;
            }

            return html`
                <div className="dashboard-table-container">
                    <table className="dashboard-csv-table">
                        <thead>
                            <tr>
                                ${fieldsToReviewData.headers.map((header, idx) => html`<th key="header-${idx}">${header}</th>`)}
                            </tr>
                        </thead>
                        <tbody>
                            ${fieldsToReviewData.rows.map((row, rIdx) => html`
                                <tr key="row-${rIdx}">
                                    ${row.map((cell, cIdx) => html`<td key="cell-${rIdx}-${cIdx}">${cell}</td>`)}
                                </tr>
                            `)}
                        </tbody>
                    </table>
                </div>
            `;
        };

        const renderRecommendedActionTodayDetails = () => {
            const { date, farmName, weather, aiRecommendation } = recommendedActionData;

            if (!farmName) {
                return html`<p className="dashboard-card-detail-message">${currentTranslations.recActionNoFarmSelected}</p>`;
            }
             if (weather.error === currentTranslations.recActionNoCoordinates || aiRecommendation.error === currentTranslations.recActionNoCoordinates) {
                return html`
                    <div className="rec-action-section">
                        <strong>${currentTranslations.recActionDateLabel}:</strong> ${date}
                    </div>
                    <div className="rec-action-section">
                        <strong>${currentTranslations.recActionLocationLabel}:</strong> ${farmName}
                    </div>
                    <p className="dashboard-card-detail-message error">${currentTranslations.recActionNoCoordinates}</p>
                `;
            }

            return html`
                <div className="recommended-action-details">
                    <div className="rec-action-section">
                        <strong>${currentTranslations.recActionDateLabel}:</strong> ${date}
                    </div>
                    <div className="rec-action-section">
                        <strong>${currentTranslations.recActionLocationLabel}:</strong> ${farmName}
                    </div>
                    <div className="rec-action-section">
                        <strong>${currentTranslations.recActionWeatherLabel}:</strong>
                        ${weather.loading ? html`<span className="loading-text">${currentTranslations.recActionWeatherLoading}</span>` : ''}
                        ${!weather.loading && weather.error && html`<span className="error-text">${weather.error}</span>`}
                        ${!weather.loading && !weather.error && weather.data && html`
                            <span className="weather-info">
                                <span className="weather-icon">${weather.icon}</span>
                                ${weather.description}, 
                                ${currentTranslations.recActionTempMax} ${weather.data.temperature_2m_max}°C, 
                                ${currentTranslations.recActionTempMin} ${weather.data.temperature_2m_min}°C, 
                                ${currentTranslations.recActionPrecipitationProb} ${weather.data.precipitation_probability_max}%
                            </span>
                        `}
                    </div>
                    <div className="rec-action-section">
                        <strong>${currentTranslations.recActionAILabel}:</strong>
                        ${aiRecommendation.loading ? html`<span className="loading-text">${currentTranslations.recActionAILoading}</span>` : ''}
                        ${!aiRecommendation.loading && aiRecommendation.error && html`<span className="error-text">${aiRecommendation.error}</span>`}
                        ${!aiRecommendation.loading && !aiRecommendation.error && aiRecommendation.text && html`
                            <${MarkdownRenderer} markdown=${aiRecommendation.text} currentTranslations=${currentTranslations} />
                        `}
                         ${!aiRecommendation.loading && !aiRecommendation.error && !aiRecommendation.text && html`<span>-</span>`}
                    </div>
                </div>
            `;
        };


        return html`
            <div className="dashboard-view">
                <h2 className="dashboard-main-title">${currentTranslations.dashboardTitle}</h2>
                <div className="dashboard-cards-grid">
                    ${Object.values(dashboardCardsDataConfig).map(card => {
                        let cardDetails = card.details;
                        let cardValue = card.value; // Use `value` from config as default

                        if (card.id.includes('_fields_review_')) {
                            cardDetails = renderFieldsToReviewTable();
                            cardValue = undefined; 
                        } else if (card.id.includes('_rec_action_')) {
                            cardDetails = renderRecommendedActionTodayDetails();
                            cardValue = undefined; 
                        } else if (Array.isArray(card.details)) {
                            cardDetails = html`<ul>${card.details.map((item, idx) => html`<li key="${card.id}-detail-${idx}">${item}</li>`)}</ul>`;
                        }

                        return html`
                            <div key=${card.id} className="dashboard-summary-card ${card.id.includes('_fields_review_') || card.id.includes('_rec_action_') ? 'full-width-card' : ''}">
                                <div className="dashboard-card-header">
                                    ${card.icon && html`<span className="dashboard-card-icon">${card.icon}</span>`}
                                    <h3 className="dashboard-card-title">${card.title}</h3>
                                </div>
                                ${cardValue && html`
                                    <p className="dashboard-card-value">
                                        ${cardValue}
                                        ${card.unit && html`<span className="dashboard-card-unit">${card.unit}</span>`}
                                    </p>
                                `}
                                ${cardDetails && html`
                                    <div className="dashboard-card-details">
                                        ${typeof cardDetails === 'string' ? html`<p>${cardDetails}</p>` : cardDetails}
                                    </div>
                                `}
                            </div>
                        `;
                    })}
                </div>
            </div>
        `;
    };

    let leftPaneCurrentContent;
    if (leftPaneView === 'assistant' || isMobile) {
        leftPaneCurrentContent = html`
            <${Fragment} key="aside-assistant-content-wrapper">
                <div className="avatar-container-mobile">
                    <div className="avatar-display">
                        <img src=${animatedAvatarProps.src} alt=${animatedAvatarProps.alt} />
                        <div className="avatar-emotion-debug">${currentAvatarState}</div>
                    </div>
                    <h2 className="avatar-name">${currentTranslations.agriChanName}</h2>
                </div>
                
                ${!isMobile && html`
                    <${Fragment}> 
                        <div className="avatar-display desktop-avatar-display">
                            <img src=${animatedAvatarProps.src} alt=${animatedAvatarProps.alt} />
                            <div className="avatar-emotion-debug">${currentAvatarState}</div>
                        </div>
                        <h2 className="avatar-name desktop-avatar-name">${currentTranslations.agriChanName}</h2>
                    </${Fragment}>
                `}

                <section className="quick-questions-section">
                    <h2 className="quick-questions-title">
                        ${currentTranslations.quickQuestionsTitle} 
                    </h2>
                    ${itemsToRender.length > 0 ? itemsToRender.map(item => html`
                        <div
                            key=${item.id}
                            className="quick-question-card clickable"
                            onClick=${() => handleQuickQuestionClick(item.recommendedPrompt)}
                            onKeyPress=${(e: React.KeyboardEvent<HTMLDivElement>) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleQuickQuestionClick(item.recommendedPrompt); }}}
                            role="button"
                            tabIndex=${0}
                            aria-label="${item.title}: 「${item.recommendedPrompt}」と質問する"
                        >
                            <h3>${item.title}</h3>
                            <p className="prompt-text">▶ "${item.recommendedPrompt}"</p>
                        </div>
                    `) : html`<p className="no-suggestions">${currentTranslations.noSuggestions}</p>`}
                </section>
            </${Fragment}>
        `;
    } else { 
        leftPaneCurrentContent = html`
            <${DashboardView} key="aside-dashboard-content-wrapper" />
        `;
    }


    return html`
        <div className="app-container">
            <header className="header">
                <div className="farm-selector-container" ref=${farmMenuRef}>
                    <button
                        className="farm-selector-button"
                        onClick=${() => setIsFarmMenuOpen(!isFarmMenuOpen)}
                        aria-label=${currentTranslations.farmMenuLabel}
                        aria-expanded=${isFarmMenuOpen}
                        aria-haspopup="listbox"
                        id="farm-select-button-label"
                    >
                        <span>
                            ${selectedFarmId
                                ? currentTranslations.farms.find(f => f.id === selectedFarmId)?.name
                                : currentTranslations.selectFarmPlaceholder
                            }
                        </span>
                        <span className="farm-dropdown-arrow">${isFarmMenuOpen ? '▲' : '▼'}</span>
                    </button>
                    ${isFarmMenuOpen && html`
                        <ul className="farm-menu" role="listbox" aria-labelledby="farm-select-button-label">
                            ${currentTranslations.farms.map(farm => html`
                                <li
                                    key=${farm.id}
                                    role="option"
                                    aria-selected=${selectedFarmId === farm.id}
                                    className=${selectedFarmId === farm.id ? 'active' : ''}
                                    onClick=${() => {
                                        setSelectedFarmId(farm.id);
                                        setIsFarmMenuOpen(false);
                                        if (chatInputRef.current) chatInputRef.current.focus();
                                    }}
                                    onKeyPress=${(e: React.KeyboardEvent) => {
                                        if (e.key === 'Enter' || e.key === ' ') {
                                            setSelectedFarmId(farm.id);
                                            setIsFarmMenuOpen(false);
                                            if (chatInputRef.current) chatInputRef.current.focus();
                                        }
                                    }}
                                    tabIndex=${0}
                                >
                                    ${farm.name}
                                </li>
                            `)}
                        </ul>
                    `}
                </div>
                <div className="header-main-title-group">
                    <${HeaderAvatar} isMobile=${isMobile} currentTranslations=${currentTranslations} avatarState=${currentAvatarState} />
                    <h1 className="header-title">${currentTranslations.headerTitle}</h1>
                </div>
                <div className="header-menu-container" ref=${menuRef}>
                    <button 
                        className="hamburger-button" 
                        onClick=${() => setIsMenuOpen(!isMenuOpen)} 
                        aria-label=${currentTranslations.hamburgerMenuLabel}
                        aria-expanded=${isMenuOpen}
                        aria-controls="main-menu-list"
                    >
                        ☰
                    </button>
                    ${isMenuOpen && html`
                        <ul className="language-menu" id="main-menu-list" role="menu">
                            <li 
                                role="menuitemradio" 
                                aria-checked=${language === 'ja'}
                                onClick=${() => { setLanguage('ja'); setIsMenuOpen(false); if(chatInputRef.current) chatInputRef.current.focus(); }} 
                                className=${language === 'ja' ? 'active' : ''}
                                tabIndex=${0}
                                onKeyPress=${(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { setLanguage('ja'); setIsMenuOpen(false); if(chatInputRef.current) chatInputRef.current.focus(); }}}
                            >
                                ${currentTranslations.langNameJa}
                            </li>
                            <li 
                                role="menuitemradio"
                                aria-checked=${language === 'en'}
                                onClick=${() => { setLanguage('en'); setIsMenuOpen(false); if(chatInputRef.current) chatInputRef.current.focus(); }} 
                                className=${language === 'en' ? 'active' : ''}
                                tabIndex=${0}
                                onKeyPress=${(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { setLanguage('en'); setIsMenuOpen(false); if(chatInputRef.current) chatInputRef.current.focus(); }}}
                            >
                                ${currentTranslations.langNameEn}
                            </li>
                            <li className="menu-separator" role="separator"></li>
                            <li
                                role="menuitem"
                                onClick=${() => { setShowClearHistoryConfirm(true); }}
                                className="menu-item-danger"
                                tabIndex=${0}
                                onKeyPress=${(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { setShowClearHistoryConfirm(true); }}}
                            >
                                <span> ${currentTranslations.clearChatHistoryLabel}</span>
                            </li>
                        </ul>
                    `}
                </div>
            </header>
            <main className="main-content" ref=${mainContentRef}>
                <aside 
                    key="main-aside"
                    className="left-pane"
                    style=${!isMobile ? { width: `${leftPaneWidth}%`, flexShrink: 0 } : undefined}
                >
                    ${isLoadingSuggestions && leftPaneView === 'assistant' && html`
                        <div key="aside-loading-overlay" className="left-pane-loading-overlay">
                            <div className="spinner"></div>
                            <p>${currentTranslations.loadingSuggestions}</p>
                        </div>
                    `}
                    ${!isMobile && html`
                        <div key="aside-view-switcher" className="left-pane-view-switcher">
                            <button 
                                className="view-switch-button ${leftPaneView === 'assistant' ? 'active' : ''}"
                                onClick=${() => setLeftPaneView('assistant')}
                                aria-pressed=${leftPaneView === 'assistant'}
                            >
                                ${currentTranslations.leftPaneTabAssistant}
                            </button>
                            <button 
                                className="view-switch-button ${leftPaneView === 'dashboard' ? 'active' : ''}"
                                onClick=${() => setLeftPaneView('dashboard')}
                                aria-pressed=${leftPaneView === 'dashboard'}
                            >
                                ${currentTranslations.leftPaneTabDashboard}
                            </button>
                        </div>
                    `}
                    <div className="left-pane-content-area-wrapper" key="left-pane-content-wrapper">
                        ${leftPaneCurrentContent}
                    </div>
                </aside>
                ${!isMobile && html`
                    <div
                        key="main-resize-handle"
                        className="resize-handle"
                        onMouseDown=${handleMouseDownOnResizeHandle}
                        role="separator"
                        aria-orientation="vertical"
                        aria-label=${currentTranslations.resizeHandleAriaLabel}
                        aria-valuenow=${leftPaneWidth}
                        aria-valuemin="15"
                        aria-valuemax="50"
                        tabIndex="-1" 
                    ></div>
                `}
                <section 
                    key="main-right-pane"
                    className="right-pane"
                    style=${!isMobile ? { width: `calc(100% - ${leftPaneWidth}% - 4px)`, flexGrow: 1 } : undefined}
                >
                    <div className="chat-history" ref=${chatHistoryRef} aria-live="polite" aria-atomic="false">
                        ${messages.map(msg => html`
                            <div key=${msg.id} className="chat-message ${msg.sender === 'user' ? 'user-message' : msg.sender === 'ai' ? 'ai-message' : 'system-message'}">
                                <div className="message-content-wrapper">
                                    ${msg.sender !== 'system' && html`
                                        <span className="message-sender" style=${msg.sender === 'user' ? { display: 'none' } : {}}>${msg.sender === 'ai' ? currentTranslations.agriChanName : currentTranslations.userSenderName}</span>
                                    `}
                                    ${msg.sender === 'ai' ? html`
                                        <${MarkdownRenderer} key="md-${msg.id}" markdown=${msg.text} currentTranslations=${currentTranslations} />
                                        ${msg.chartData && html`<${ChartRenderer} key="chart-${msg.id}" chartJsonData=${msg.chartData} errorText=${currentTranslations.chartRenderError} />`}
                                    ` : msg.text.split('\n').map((line, i) => html`<p key=${`${msg.id}-line-${i}`} style=${{margin: '0 0 5px 0', whiteSpace: 'pre-wrap'}}>${line}</p>`)}
                                    ${!isMobile && msg.sender === 'user' && msg.imageBase64 && msg.imageMimeType && html`
                                        <img src=${`data:${msg.imageMimeType};base64,${msg.imageBase64}`} alt=${currentTranslations.attachImageLabel} className="message-image-preview" />
                                    `}
                                </div>
                                ${msg.timestamp && html`
                                    <div className="message-timestamp">${formatTimestamp(msg.timestamp, language, currentTranslations)}</div>
                                `}
                            </div>
                        `)}
                    </div>
                    ${showScrollToBottom && html`
                        <button 
                            className="scroll-to-bottom-button ${showScrollToBottom ? 'visible' : ''}" 
                            onClick=${scrollToChatBottom}
                            aria-label=${currentTranslations.scrollToBottomLabel}
                            title=${currentTranslations.scrollToBottomLabel}
                        >
                            ↓
                        </button>
                    `}
                    ${error && html`<div className="error-message" role="alert">${error}</div>`}
                    <div className="chat-input-container">
                        ${!isMobile && imagePreviewUrl && html`
                            <div className="image-preview-area">
                                <img src=${imagePreviewUrl} alt=${currentTranslations.attachImageLabel + " preview"} className="selected-image-thumbnail" />
                                <button onClick=${clearSelectedImage} className="clear-image-button" aria-label=${currentTranslations.clearImageLabel}>×</button>
                            </div>
                        `}
                        <div className="chat-input-area">
                            ${!isMobile && html`
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange=${handleImageChange}
                                    style=${{ display: 'none' }}
                                    ref=${fileInputRef}
                                    id="imageUploadInput"
                                    disabled=${isLoading || isRecording || isSharingScreen || isLoadingSuggestions}
                                />
                            `}
                            ${!isMobile && html`
                                <button
                                    className="chat-button attach-button"
                                    onClick=${() => fileInputRef.current?.click()}
                                    disabled=${isLoading || isRecording || isSharingScreen || isLoadingSuggestions || (!!selectedImageFile && !isMobile) }
                                    aria-label=${currentTranslations.attachImageLabel}
                                    title=${currentTranslations.attachImageLabel}
                                >
                                    📎
                                </button>
                            `}
                            <textarea
                                ref=${chatInputRef}
                                rows=${1}
                                className="chat-input"
                                value=${inputValue}
                                onChange=${handleInputChange}
                                onKeyPress=${handleKeyPress}
                                placeholder=${currentTranslations.inputPlaceholder}
                                aria-label="Chat message input"
                                disabled=${isLoading || isRecording || isSharingScreen || isLoadingSuggestions}
                            ></textarea>
                            <button
                                className="chat-button send-button"
                                onClick=${() => sendMessage()}
                                disabled=${isLoading || isLoadingSuggestions || (!inputValue.trim() && !selectedImageFile) || isRecording || isSharingScreen}
                                aria-label=${currentTranslations.sendButtonAriaLabel}
                            >
                                ${currentTranslations.sendButton}
                            </button>
                            ${navigator.mediaDevices && typeof navigator.mediaDevices.getDisplayMedia === 'function' && !isMobile && html`
                                <button
                                    className="chat-button screen-share-button ${isSharingScreen ? 'sharing' : ''}"
                                    onClick=${toggleScreenSharing}
                                    disabled=${isLoading || isRecording || !!selectedImageFile || isLoadingSuggestions}
                                    aria-label=${isSharingScreen ? currentTranslations.screenShareStopLabel : currentTranslations.screenShareStartLabel}
                                    title=${isSharingScreen ? currentTranslations.screenShareStopLabel : currentTranslations.screenShareStartLabel}
                                >
                                    ${isSharingScreen ? currentTranslations.screenShareStopButtonText : '🖥️'}
                                </button>
                            `}
                            ${SpeechRecognitionGlobal && html`
                                <button
                                    className="chat-button mic-button ${isRecording ? 'recording' : ''}"
                                    onClick=${toggleVoiceRecording}
                                    disabled=${isLoading || isSharingScreen || (!isMobile && !!selectedImageFile) || isLoadingSuggestions} 
                                    aria-label=${isRecording ? currentTranslations.micStopLabel : currentTranslations.micStartLabel}
                                    title=${isRecording ? currentTranslations.micStopLabel : currentTranslations.micStartLabel}
                                >
                                    ${isRecording ? currentTranslations.micStopButtonText : '🎤'}
                                </button>
                            `}
                        </div>
                    </div>
                    ${isLoading && html`
                        <div className="loading-overlay">
                            <div className="loading-content">
                                <div className="spinner"></div>
                                <p>${currentTranslations.aiTyping}</p>
                            </div>
                        </div>
                    `}
                </section>
            </main>
            ${showClearHistoryConfirm && html`
                <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="confirm-dialog-title" aria-describedby="confirm-dialog-desc">
                    <div className="modal-content">
                        <h2 id="confirm-dialog-title">${currentTranslations.confirmClearChatTitle}</h2>
                        <p id="confirm-dialog-desc">${currentTranslations.confirmClearChatMessage}</p>
                        <div className="modal-actions">
                            <button onClick=${() => {setShowClearHistoryConfirm(false); setIsMenuOpen(false); if(chatInputRef.current) chatInputRef.current.focus();}} className="modal-button cancel-button" aria-label=${currentTranslations.confirmClearChatButtonCancel}>
                                ${currentTranslations.confirmClearChatButtonCancel}
                            </button>
                            <button onClick=${handleClearChatHistory} className="modal-button delete-button" aria-label=${currentTranslations.confirmClearChatButtonDelete}>
                                ${currentTranslations.confirmClearChatButtonDelete}
                            </button>
                        </div>
                    </div>
                </div>
            `}
        </div>
    `;
}

const rootElement = document.getElementById('root');
if (rootElement) {
    const root = createRoot(rootElement);
    root.render(html`<${App} />`);
} else {
    console.error("Root element not found.");
}