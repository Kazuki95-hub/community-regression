import { Page, Locator } from '@playwright/test';

export class LoginPage {
    readonly page: Page;
    readonly emailInput: Locator;
    readonly passwordInput: Locator;
    readonly loginButton: Locator;

    constructor(page: Page) {
        this.page = page;
        // roleベースセレクタを優先（MCPの共通ルールに準拠）
        this.emailInput = page.getByRole('textbox', { name: /email|メール/i }).or(
            page.locator('input[type="email"], input[name*="email" i], input[id*="email" i]')
        ).first();
        this.passwordInput = page.getByRole('textbox', { name: /password|パスワード/i }).or(
            page.locator('input[type="password"], input[name*="password" i], input[id*="password" i]')
        ).first();
        this.loginButton = page.getByRole('button', { name: /ログイン/i }).or(
            page.locator('button:has-text("ログイン"), input[type="submit"]:has-text("ログイン"), button[type="submit"]')
        ).first();
    }

    async navigate(): Promise<void> {
        // baseURLを使用、フルURL禁止（MCPの共通ルールに準拠）
        await this.page.goto('/users/sign_in');
    }

    async fillEmail(email: string): Promise<void> {
        await this.emailInput.fill(email);
    }

    async fillPassword(password: string): Promise<void> {
        await this.passwordInput.fill(password);
    }

    async clickLoginButton(): Promise<void> {
        await this.loginButton.click();
    }

    async login(email: string, password: string): Promise<void> {
        await this.fillEmail(email);
        await this.fillPassword(password);
        await this.clickLoginButton();
    }
}
