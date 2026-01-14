# Regression Test Design

## 目的
主要ユーザーフローが仕様変更後も壊れていないことを保証する

## 対象フロー
- ログイン
- 会員登録

## 共通ルール
- baseURL は playwright.config.ts を使用
- フルURL禁止
- roleベースセレクタを優先
- assert は URL / 表示要素 / 文言を含める

---
### URL
- /users/sign_in

### 入力
- email: process.env.TEST_EMAIL
- password: process.env.TEST_PASSWORD

### 操作
1. /users/sign_in
2. email に有効な値を入力
3. password に有効な値を入力
4. ログインボタンをクリック

### 成功条件
- URL が /
- ログインしましたというバナーが表示されること