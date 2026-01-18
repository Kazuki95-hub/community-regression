# Regression Test Design

## 目的
- 主要機能のリグレッションテスト 

## 共通ルール
- baseURL は playwright.config.ts を使用
- Basic認証は `playwright.config.ts` の `httpCredentials` を使用する
    - テストコード内では Basic認証の処理は書かない
- ログイン操作は `LoginPage.ts` を使用する
  - spec ファイルでは直接セレクタ操作を行わない
- フルURL禁止
- assert は URL / 表示要素 / 文言を含める
