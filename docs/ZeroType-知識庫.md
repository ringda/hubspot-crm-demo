# ZeroType 知識庫

> 整理自:官網 `zerotype.ai` / 鏡像站 `zerotype.gh.miniasp.com` / 多奇教育訓練 Discord(AI 時代的 PM 新技能課程)/ 課程提示詞大全資料夾
> 最後更新:2026-06-08
> 狀態:✅ 定稿(v1)
>
> **讀取範圍**:逐則深讀 = 互助專區〔環境變數金鑰、小算盤、VS2026、開機自動執行〕+ 點子銀行〔企業版〕+ 課程交流〔5/30~6/5〕+ 課程公告。其餘各串為索引層(標題/發文者/OP摘要/回覆數),依需求可再展開。

---

## 0. 一句話

ZeroType 是 Will 保哥(多奇數位)獨立開發的**桌面語音工作流程工具**(macOS / Windows),用系統快捷鍵錄音 → STT 轉文字 → LLM 依提示詞改寫 → 直接貼回你正在用的 App。核心理念:「用講的把工作做完」。

---

## 1. 實作架構

### 四階段管線
```
語音輸入 → STT 轉錄 → LLM 提示詞改寫 → 插入前景應用程式
(快捷鍵)   (轉文字)   (SYSTEM + USER)   (smart_paste / send_keys)
```

### 提示詞雙層結構
- **SYSTEM.md(共用系統提示詞)**:語音校正、安全邊界、上下文規則,內含龐大「STT 錯字對照表」(如 `Clawd/Cloud Code → Claude`、`馬當/modem → Markdown`、`RM 兼 RA 負 → rm -rf`、`大內八 → .NET 8`),專治中英夾雜技術術語。
- **USER.md / USER-xx.md(任務模板)**:決定輸出成什麼(純校正 / LINE 訊息 / 翻譯 / Issue / Agent 委派…)。

### 結構化上下文注入(`<CONTEXT>`)
SYSTEM 底部注入即時環境:`CURRENT_TIME`、`OS`、`PROCESS_NAME`(前景 App)、`WINDOW_TITLE`、`CLIPBOARD`。僅用於消歧義,禁止輸出。

### 能力旗標(YAML frontmatter,逐情境權限沙盒)
`ENABLE_SEND_KEYS` / `ENABLE_SMART_PASTE` / `ENABLE_OPEN_URL` / `ENABLE_OPEN_APP` / `ENABLE_GOOGLE_SEARCH` / `ENABLE_ASK_CHATGPT` / `ENABLE_ASK_GEMINI` / `ENABLE_FIND_YOUTUBE` / `ENABLE_READ` / `ENABLE_RUN_SHELL` / `ENABLE_AUTO_ENTER`

### 多模型供應商(可插拔,相容 OpenAI Chat Completions 格式)
Azure OpenAI、Gemini API、OpenRouter、Cloudflare Workers AI、Local LLM(MLX + Gemma / Ollama)。
- 環境變數範例:`ZEROTYPE_TRANSCRIPTION_API_BASE/KEY/MODEL`(STT 段)、`ZEROTYPE_AIPROMPT_API_BASE/KEY_ENV/MODEL`(LLM 段)。
- 本地範例:STT `Breeze-ASR-26-MLX`(127.0.0.1:8083)、LLM `gemma4:latest`(Ollama, localhost:11434)。

---

## 2. 安裝與設定

### 下載(Google Drive,目前 0.4.0 beta;舊版會過期)
鏡像站 `zerotype.gh.miniasp.com` 公開的 Drive:`https://drive.google.com/drive/folders/1oR5cJgweDoIxHIhs7F8oRWJio-Hf9WJ6`
- Windows:`...win-x64-Setup.exe`(安裝版,推薦)/ `...win-x64.exe`(可攜)/ `...win-x64.zip`
- macOS:Apple Silicon `.dmg` / Intel `.dmg`

### 設定步驟
1. 安裝後首次啟動需授予鍵盤/輔助使用權限(系統級快捷鍵 + 貼回前景 App)。
2. 設定 STT 與 LLM 兩段的 API(環境變數或 App 內設定)。
3. 載入提示詞:`SYSTEM.md` 當共用,選一個 `USER-xx.md`。

### ⭐ Groq 實戰設定值(2026-06-08 已申請金鑰,名稱「ZeroType」)
> STT 與 LLM 兩段共用同一把 Groq 金鑰。金鑰請填你自己存的 `gsk_...`(此處不寫真值)。

| 欄位 | 填入 |
|---|---|
| API Base(端點) | `https://api.groq.com/openai/v1` |
| STT 轉錄模型 | `whisper-large-v3-turbo` |
| LLM 改寫模型 | `gpt-oss-120b` |
| API Key | `gsk_…`(你存的金鑰) |

- 金鑰管理:Groq Console → API Keys(`https://console.groq.com/keys`),可隨時刪除/重建。
- Windows 填金鑰:直接貼真實金鑰最穩(環境變數有覆蓋 bug,見 §4.1);設定檔在 `%LocalAppData%\ZeroType\USER-*.md`。
- 費用:免費額度(免綁卡)個人用足夠;Whisper 免費 2,000 次/天、每小時 7,200 秒音檔(見 §3)。

> ⚠️ **Windows 已知雷**:自訂金鑰似乎無法吃環境變數(詳見第 4 章互助專區「環境變數」串)。

---

## 3. 模型費用與推薦

### ⭐ 3.0 推薦使用的模型(社群 / Will 保哥)
| 用途 | 推薦模型 | 平台 | 來源 |
|---|---|---|---|
| **STT 轉錄** | `whisper-large-v3-turbo` | Groq | 社群共識,快又幾乎免費 |
| **LLM 提示詞改寫** | **`gpt-oss-120b`** | Groq(Ollama 也有) | **Will 親自推薦**(課程交流 3/19) |
| **中英翻譯**(兼速度+品質) | `gemini-3.1-flash-lite`(或 `gemini-2.5-flash`) | Gemini API | Max 實測「還行」、Jim Chen 建議 gemini flash |
| (校正用客製模型) | `duotify-revise-1-mini` | — | 多奇客製 revise 模型(設定截圖中可見) |

> **Will 的選模哲學**:「都可以,選擇模型就是**一分錢一分貨,貴的就聰明,免費的最貴(因為笨,所以要花人類時間)**!」
>
> 👉 實際驗證:某學員的環境變數設定截圖正是 **Groq 端點 + `gpt-oss-120b`(LLM)+ `whisper-large-v3-turbo`(STT)+ Gemini key**——與上述推薦完全一致,可視為一組「實戰標配」。
>
> 相關討論串:點子銀行「LLM 模型更新小幫手」(wayne,提議每天追蹤各 LLM 評分變化)。

### STT(語音轉文字)供應商比較
| 供應商 | 模型 | 報價 | 備註 / 來源 |
|---|---|---|---|
| **Groq** ⭐ | whisper-large-v3-turbo | $0.04/hr(實質**幾乎免費**) | 社群首選;速度最快,本地模型「很難比 Groq 快」(企業版串 Will/Jeremy) |
| Cloudflare Workers AI | whisper | ~$0.0306/hr($5/月訂閱) | 最低單價(鏡像站) |
| OpenRouter | — | $0.04/hr | 鏡像站 |
| OpenAI | whisper-1 | $0.36/hr | 最貴(鏡像站) |
| OpenAI(via Spokenly) | gpt-4o-mini-transcribe | — | Spokenly 設定檔內見 |
| 本地 Local | Breeze-ASR-26-MLX | 免費(自架) | 繁中/台灣優化,需自架 127.0.0.1:8083 |

### 整合型 App(非 ZeroType,社群比較對象)
| App | 報價 | 備註 |
|---|---|---|
| **Spokenly** | $9.99/月 | 金鑰明碼寫設定檔 JSON;Will:「完美避開環境變數緊箍咒」 |
| **Typeless** | (訂閱制) | 企業愛用但有資安疑慮;有 6 分鐘錄音上限(ZeroType 無上限) |

### 結論
- **最省 / 最快**:STT 用 **Groq `whisper-large-v3-turbo`**(社群共識,幾乎免費又最快)。
- ZeroType 本身免費(0.4.0 beta,試用到六月底),成本只在你接的 API。
- 隱私:ZeroType 不外傳資料,走你自己的 API key(見 §5.1)。

---

## 4. 已知雷區與排解(互助專區)

### 🔥 4.1 Windows 自訂金鑰無法用環境變數(18 回覆,Ep 發起 6/6)— 已讀完
**問題**:Windows 版在「編輯提示詞」金鑰欄位填環境變數名稱(如 `GEMINI_API_KEY`)會出錯,只能貼真實金鑰;且編輯/切換到別的提示詞(用別的模型)時,已設好的環境變數金鑰會被覆蓋或消失。
**設定檔位置**:`C:\Users\<你>\AppData\Local\ZeroType\USER-*.md`(每個提示詞一個 .md,含轉錄/AI校正/輸出保護鍵/工具調用/進階設定等分類)。
**金鑰儲存差異**:
- **macOS**:金鑰安全存在系統 **Keychain 鑰匙圈**。
- **Windows**:走環境變數,但有上述 UI 覆蓋 bug。
**Will 的回應(結論)**:
- 承認是 **bug**,**下一版修復**。原因:早期無 UI 時只能用環境變數(安全但門檻高、彈性大);加了 UI 後沒涵蓋好,導致覆蓋。
- 設計方向:保留 `ZEROTYPE_TRANSCRIPTION_API_KEY_ENV`(指向環境變數名稱,安全,工程師用)+ 新增 `ZEROTYPE_TRANSCRIPTION_API_KEY`(直接寫金鑰、UI 預設、門檻低、整份提示詞檔複製到另一台即可用,但明碼較不安全)。
- 兩難:明碼不安全 vs 好備份移轉;env var 安全 vs 門檻高。
**社群點子**:git 式 system/global(user)/local(prompt) 三層設定繼承;依登入帳號對應多組金鑰(多人多 key)。
**競品對照**:Spokenly「完美避開環境變數緊箍咒」——直接把金鑰明碼寫進設定檔 JSON(`byokConfigs.openai.api_key`,model `gpt-4o-mini-transcribe`)。
**現行 workaround**:直接編輯 `USER-*.md` 檔調整金鑰。

### 4.2 zerotype-agent 開不了小算盤(Ep,8 回覆)— 已讀完
- 提示詞 `USER-聽我指令.md` 開啟 `ZEROTYPE_ENABLE_OPEN_APP: true`,語音「幫我開啟計算機」報錯。
- 機制:agent 的 open_app 靠 `installed-applications.windows.json`(從登錄檔 `registry_app_paths` 建的已安裝程式索引)解析啟動目標。
- **Will:「找到問題了,下一版修復。」** ✅

### 4.3 Visual Studio 2026 按鍵無法啟動(topcat,4 回覆)— 已讀完
- VS2026 中啟動錄音的熱鍵無效,換 RightCtrl / RightShift / RightAlt 都無效。
- 0.3.3-beta 在家測 OK,但公司電腦仍無效,難重現。
- **Will 推測:可能是軟體沒簽章導致,正在等憑證(code-signing certificate)下來,過幾天再試。**
- ⚠️ 同源於 Windows SmartScreen 警告——0.3.x 屬未簽章。

### 4.4 無法開機自動執行 / 無預警無法呼叫(fuyuansu,win11)— 已讀完
- 現象:① 更新後無法開機自動執行,須手動啟動 ② 無預警無法呼叫,程式仍常駐工作列,須從匣重新啟動才能再用(預設 alt 鍵呼叫)。
- **① 開機自動執行**:Will 6/5 表示已修好;fuyuansu 確認解決。
- **② 無預警無法呼叫**:截至 6/8(今天)仍偶發。fuyuansu 觀察:常發生在使用 **antigravity(會執行 node)時**,疑似程序衝突。**Workaround:從系統匣重新啟動 ZeroType。**

### 4.5 其他(OP only / 少量回覆,索引)
- 打字沒顯示(Hao,win10):log 有辨識但畫面沒輸出,**重開 ZeroType + 重講一次即正常**。
- 無法開啟功能畫面 / 看不到 Z icon(Hana,0.41 beta 起一直如此,1 回覆)。
- ZeroType 的 SmartPaste(macos26)。
- 上下文不要讀剪貼簿的設定在哪(豆漿,win/mac,0 回覆)→ 對應「上下文是否讀剪貼簿」設定(見 §6)。

---

## 5. 功能藍圖 / 社群許願(點子銀行)

### 🔥 5.1 企業版(nogggnoggg 發起,12 回覆)— 已讀完(含隱私/授權關鍵答案)
- **訴求**:工廠約 10 套需求;競品 **Typeless** 很多企業在用,但資安疑慮(敏感資料外流)讓人卻步;希望企業版能接公司**地端模型**。
- **隱私(Will 親回)**:「**我不會傳任何資料出來**,只是啟動需要網路避免盜版,啟用機制還沒寫好。」→ ZeroType 本身不外傳語音/文字,走你自己的 API;僅啟動時連網做授權驗證。
- **授權(Will 親回)**:「**基本上你要自己用沒問題,在哪裡都可以**。」→ 個人用無限制。
- **速度/費用**:本地模型「**很難比 Groq 快**」,且 **Groq「幾乎免費」**,社群結論是乖乖用 Groq。
- **地端模型**:現行版本已可接地端/本地模型。
- **企業版 / Android / iOS**:Will 未明確承諾,仍在了解需求(nogggnoggg 問行動版、Max 問商用授權)。

### 5.2 其他點子(索引,多為 feature-request)
- 提示詞搜集簿(Leeli,6👍)——提示詞畫廊,上傳分享 + 下載
- 提示詞 GUI 管理 / CRUD / 分類(咪咪冒冒、AGONI 等多人提)
- 錄音摘要與 AI 分析(Lucyc,5 回覆)——讀書會整段 session 逐字稿 + 發言者分析
- 即時中日翻譯(Kenber,4 回覆)/ 中英對照
- 文字轉語音 TTS(keh,10 回覆,win10)——感冒燒聲時打字轉語音
- 辨識結果判定流程優化 / 個人化 whisper 歷史記錄(Mark_Wu)
- 管理授權(咪咪冒冒)——多台電腦 / 重灌後管理
- 沒麥克風時也能有限度使用(咪咪冒冒)
- Mac 長錄音自訂快捷鍵 / 指定 fn 鍵(Edison,macOS26)
- codex 雙 Command 截取 app 資訊到 clipboard(咪咪冒冒)
- 讓 AI 當會議白板手 / Jarvis 等級開會(yazelinj303,標 not-planned)
- Windows 系統匣 zerotype 雙擊出說明書 + 長錄音快捷鍵說明(施小白)

---

## 6. 實用技巧(課程交流 / 論壇 — 待補)

- 如何避免 ZeroType 語音輸入後蓋掉剪貼簿(設定:上下文是否讀剪貼簿)
- 錄音長度無上限(對比 Typeless 6 分鐘)

---

## 附:課程資訊
- 課程:AI 時代的 PM 新技能:語音化工作流程設計實戰(多奇教育訓練)
- 報名:`https://learn.duotify.com/courses/zerotype`
- 5/29 Q&A 錄影已上架(課程頁可看,有字幕)
