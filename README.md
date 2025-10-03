# 自選股即時儀表板

Next.js（App Router）打造的即時自選股儀表板，每分鐘自動更新報價、支援分時走勢 Modal、告警規則、URL 分享與深色介面。伺服器端提供 Finnhub 主來源與 Yahoo 備援，並內建 60 秒記憶體快取。

## 功能總覽

- 📈 自選清單表格：代號、最新價、漲跌幅、資料來源，並支援排序、搜尋、增刪。
- 🔁 每 60 秒自動輪詢，支援錯誤退避與頁面隱藏暫停。
- 🪟 Modal 走勢圖：1D/5D 分時折線圖，切換即時拉取 `/api/candles`。
- 🚨 告警中心：建立價格高於/低於告警，觸發時顯示通知、行內高亮與可選音效。
- 💾 Local Storage 同步自選與告警清單，URL Query `?symbols=` 支援分享。
- 🌓 深色模式、鍵盤操作（J/K/Enter/Esc）與 ARIA 對焦狀態。

## 快速開始

```bash
npm install
npm run dev
```

開發伺服器預設執行於 `http://localhost:3000`。

### 開發伺服器驗證

執行 `npm run dev` 後，瀏覽器開啟 `http://localhost:3000` 應顯示自選股儀表板而無錯誤訊息。若在企業網路環境下執行，請確認代理設定讓 Finnhub/Yahoo API 能夠正常透過伺服器端路由存取。

### 環境變數

建立 `.env.local` 並參考 `.env.local.example`：

- `FINNHUB_API_KEY`：Finnhub 免費金鑰（若留空則改用 Yahoo 備援）。
- `CACHE_TTL_MS`：記憶體快取毫秒數（預設 60000）。
- `ALLOWLIST_SYMBOLS`：可選，限制允許查詢的代號清單。

### 範例分享網址

```
http://localhost:3000/?symbols=AAPL,MSFT,TSLA,NVDA
```

首次載入時會將 Query 參數併入 Local Storage，後續開啟相同網址即可同步自選清單。

## 測試與品質

| 指令 | 說明 |
| ---- | ---- |
| `npm run lint` | ESLint 規則檢查 |
| `npm run test:unit` | Vitest 單元測試（快取、資料處理） |
| `npm run test:integration` | API 行為整合測試（快取與回退） |
| `npm run test:e2e` | React Testing Library 端對端互動測試 |

> 提示：若首次安裝於 CI，請記得執行 `npm install` 以取得 Playwright/MSW 等測試依賴。

## API 端點

### `GET /api/quotes`

- `symbols`: 逗號分隔代號（上限 50）。
- 回傳：`quotes[]`（含 `symbol`, `price`, `prevClose`, `ts`, `source`, `status`）、`ts`, `cached`。
- 快取：對同一批 `symbols` 以 `CACHE_TTL_MS` 快取，來源失敗時回傳快取並標記。

### `GET /api/candles`

- `symbol`: 單一代號。
- `range`: `1d` 或 `5d`。
- 回傳：`candles[]`（OHLCV）、`source`，失敗時 `502` 並回傳空陣列。

## 前端互動重點

- 列點擊→開啟 Modal，支援 Esc 關閉與 1D/5D 切換。
- 每次更新若價位上/下漲，列會有短暫動畫；資料來源顯示 `finnhub` / `yahoo` / `cache`。
- 告警觸發時以 Toast、列高亮與音效提示，可於右上角切換靜音。
- 鍵盤：`J/K` 上下、`Enter` 開啟、`Esc` 關閉 Modal。

## 驗收清單

- [x] `/api/quotes` Finnhub 主來源 + Yahoo 備援 + 60 秒快取。
- [x] `/api/candles` 支援 1D/5D，失敗時回傳 502 與空資料。
- [x] 自選清單 CRUD、排序、搜尋、快取狀態提示。
- [x] 每分鐘輪詢 + 錯誤退避（60s → 120s → 180s）。
- [x] Modal 走勢圖 Canvas 版面，含資料來源標示。
- [x] 告警中心、音效、Toast 通知與本地持久化。
- [x] URL 分享、Local Storage 同步、深色模式。
- [x] 測試腳本（單元 / 整合 / E2E）與 README 說明。
- [x] Demo 錄製指引（`docs/demo.md`）。

## 已知限制與後續規劃

- Finnhub 免費額度有限，建議在生產環境提高 `CACHE_TTL_MS` 或預先批次抓取。
- Yahoo 非官方 API，若結構調整需於伺服器端加強解析錯誤保護。
- 尚未區分交易時段（盤前/盤後），後續可加入時區與休市判斷。
- 走勢圖為自製簡易 Canvas，若需求擴大可改用 Chart.js / Recharts。

## Demo 錄影

請參考 [`docs/demo.md`](docs/demo.md) 完成錄影或 GIF，並將產出檔案放入 `docs/assets/` 後更新本段落連結。
