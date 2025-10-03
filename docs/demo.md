# Demo 錄製指引

以下流程可協助團隊成員錄製 1 ~ 2 分鐘的操作 Demo（建議輸出為 GIF 或 MP4）：

1. 於專案根目錄執行 `npm install` 與 `npm run dev`，確認開發伺服器啟動於 `http://localhost:3000`。
2. 開啟螢幕錄製工具（例如 macOS QuickTime、Windows Xbox Game Bar 或開源的 OBS Studio）。
3. 錄製以下操作流程：
   - 新增 2 檔股票（示例：`NVDA`、`AMD`）。
   - 等待輪詢更新，觀察價位變動動畫與資料來源提示。
   - 點擊任一列開啟 Modal，切換 1D/5D 走勢並滑動滑鼠檢視。
   - 建立一則價格告警，並於「告警中心」看到記錄。
   - 觸發告警（可暫時調整價格閾值以快速觸發），確認通知與音效。
   - 點擊「分享連結」並於瀏覽器開啟新分頁驗證 URL。
4. 錄製完成後，將影片壓縮為 1280x720 以下並上傳至共享空間。
5. 若需 GIF，可使用 `ffmpeg` 或 `imagemagick` 將 MP4 轉換：
   ```bash
   ffmpeg -i input.mp4 -vf "fps=15,scale=1280:-1:flags=lanczos" demo.gif
   ```
6. 將最終檔案放置於 `docs/assets/` 目錄並於 README 中更新連結。

> 備註：若錄製過程中外部 API 無法回應，可先於 `.env.local` 移除 `FINNHUB_API_KEY`，系統會自動切換到 Yahoo 備援並顯示快取狀態。
