import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';

test('投稿リグレッション: Q&Aに投稿して確認', async ({ page }) => {
    test.setTimeout(120000);

    // LoginPageを使用してログイン操作（MCPの共通ルールに準拠）
    console.log('=== ステップ1: LoginPage.tsを使用してログイン ===');
    const loginPage = new LoginPage(page);

    // ログイン画面にアクセス（baseURLを使用、フルURL禁止）
    await loginPage.navigate();
    console.log('✓ ログイン画面にアクセスしました');
    await page.waitForTimeout(1000);

    // ログイン実行
    const email = process.env.OWNER_USER_EMAIL;
    const password = process.env.OWNER_USER_PASSWORD;
    if (!email || !password) {
        throw new Error('OWNER_USER_EMAILと OWNER_USER_PASSWORD の環境変数が設定されていません');
    }
    await loginPage.login(email, password);
    console.log('✓ ログイン操作を実行しました');

    // ログイン後のページ遷移を待機
    await page.waitForURL('**/', { timeout: 10000 });
    console.log(`✓ ログイン成功: ${page.url()}`);
    await page.waitForTimeout(2000);

    // 1. Q&Aページに遷移（baseURLを使用、フルURL禁止）
    console.log('\n=== ステップ2: Q&Aページに遷移 ===');
    await page.goto('/menus/v43unhcd7ynrcihb/question_categories', {
        waitUntil: 'domcontentloaded'
    });
    console.log('✓ Q&Aページにアクセスしました');
    await page.waitForTimeout(2000);

    // 2. 「投稿する」リンクを押下
    console.log('\n=== ステップ3: 「投稿する」リンクを押下 ===');
    const postButton = page.locator('a.c-btn--primary__round[href="/menus/v43unhcd7ynrcihb/questions/new"]:has-text("投稿する")');
    await postButton.waitFor({ state: 'visible', timeout: 10000 });
    await postButton.click();
    console.log('✓ 「投稿する」リンクをクリックしました');

    // 3. 投稿フォームページに遷移するまで待機
    await page.waitForURL('**/menus/v43unhcd7ynrcihb/questions/new', { timeout: 10000 });
    console.log('✓ 投稿フォームページに遷移しました');
    await page.waitForTimeout(2000);

    // タイトルと内容を入力
    console.log('\n=== ステップ4: タイトルと内容を入力 ===');

    // タイトル入力フィールドを探す
    const titleInput = page.locator('input[name*="title" i], input[id*="title" i], textarea[name*="title" i], textarea[id*="title" i], input[placeholder*="タイトル" i], textarea[placeholder*="タイトル" i]').first();
    await titleInput.waitFor({ state: 'visible', timeout: 10000 });
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const title = `リグレッションテスト投稿 ${timestamp}`;
    await titleInput.fill(title);
    console.log(`✓ タイトルを入力しました: ${title}`);
    await page.waitForTimeout(500);

    // 内容入力フィールドを探す
    const contentInput = page.locator('textarea[name*="content" i], textarea[id*="content" i], textarea[name*="body" i], textarea[id*="body" i], textarea[placeholder*="内容" i], textarea[placeholder*="本文" i], .editor textarea, [contenteditable="true"]').first();
    await contentInput.waitFor({ state: 'visible', timeout: 10000 });
    const content = `これはリグレッションテスト用の投稿内容です。\n作成日時: ${new Date().toLocaleString('ja-JP')}`;

    // contenteditable要素の場合はfillではなく、clickしてtypeを使用
    const isContentEditable = await contentInput.evaluate(el => el.getAttribute('contenteditable') === 'true').catch(() => false);
    if (isContentEditable) {
        await contentInput.click();
        await contentInput.type(content);
    } else {
        await contentInput.fill(content);
    }
    console.log(`✓ 内容を入力しました`);
    await page.waitForTimeout(1000);

    // 4. 「投稿する」ボタンを押下
    console.log('\n=== ステップ5: 「投稿する」ボタンを押下して投稿 ===');
    const submitButton = page.locator('input[type="submit"][name="commit"][value="投稿する"].js-loader');
    await submitButton.waitFor({ state: 'visible', timeout: 10000 });
    await submitButton.click();
    console.log('✓ 「投稿する」ボタンをクリックしました');
    await page.waitForTimeout(3000);

    // 投稿後のページ遷移を待機
    const currentUrl = page.url();
    console.log(`✓ 投稿後のURL: ${currentUrl}`);
    await page.waitForTimeout(2000);

    // 5. 指定のURLに投稿した投稿が表示されることを確認（assert: URL / 表示要素 / 文言を含める）
    console.log('\n=== ステップ6: 投稿が表示されることを確認 ===');
    await page.goto('/menus/v43unhcd7ynrcihb/question_categories', {
        waitUntil: 'domcontentloaded'
    });
    console.log('✓ 投稿一覧ページにアクセスしました');
    await page.waitForTimeout(2000);

    // assert: URL が正しいことを確認
    await expect(page).toHaveURL(/\/menus\/v43unhcd7ynrcihb\/question_categories/);
    console.log('✓ URLが正しいことを確認しました');

    // assert: 投稿したタイトルが表示されていることを確認（表示要素 / 文言）
    const postedTitle = page.locator(`:has-text("${title}"), a:has-text("${title}"), [data-title*="${title}"]`).first();
    await postedTitle.waitFor({ state: 'visible', timeout: 10000 });
    console.log(`✓ 投稿したタイトル「${title}」が表示されていることを確認しました`);

    // assert: 投稿が表示されていることを確認
    await expect(postedTitle).toBeVisible();
    console.log('✓ アサート成功: 投稿が表示されています');

    // スクリーンショットを取得
    await page.screenshot({ path: 'post-regression-completed.png', fullPage: true });
    console.log('✓ スクリーンショットを保存しました: post-regression-completed.png');

    // 5秒待機して確認
    await page.waitForTimeout(5000);
});
