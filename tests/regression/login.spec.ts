import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';

test.describe('ログインリグレッションテスト', () => {
    test('有効な認証情報でログインが成功すること', async ({ page }) => {
        const loginPage = new LoginPage(page);

        // 環境変数から認証情報を取得（MCPの定義に準拠）
        const email = process.env.OWNER_USER_EMAIL;
        const password = process.env.OWNER_USER_PASSWORD;

        // 環境変数が設定されていない場合はエラー
        if (!email || !password) {
            throw new Error('OWNER_USER_EMAILと OWNER_USER_PASSWORD の環境変数が設定されていません');
        }

        // 1. /users/sign_in にアクセス（MCPの操作手順1）
        await loginPage.navigate();

        // 2. email に有効な値を入力（MCPの操作手順2）
        // 3. password に有効な値を入力（MCPの操作手順3）
        // 4. ログインボタンをクリック（MCPの操作手順4）
        await loginPage.login(email, password);

        // 成功条件のアサート（MCPの定義に準拠）
        // - URL が / になることを確認（MCPの成功条件1）
        await expect(page).toHaveURL('/');

        // - ログインしましたというバナーが表示されることを確認（MCPの成功条件2）
        // 実際のページ構造に基づいて、.flash.js-flashクラスで確認
        // roleベースセレクタを優先（MCPの共通ルールに準拠）
        const successBanner = page.getByRole('alert').filter({ hasText: /ログインしました/i }).or(
            page.locator('.flash.js-flash:has-text("ログインしました"), [role="alert"]:has-text("ログインしました"), .alert:has-text("ログインしました"), .notice:has-text("ログインしました"), .success:has-text("ログインしました")')
        ).first();
        await expect(successBanner).toBeVisible();
    });
});
