import { expect, Locator, Page } from "@playwright/test";

export class LoginPage {

    //Define locators for the LoginPage
    private readonly usernameInput: Locator;
    private readonly passwordInput: Locator;
    private readonly loginButton: Locator;
    private readonly errorMessage: Locator;
    private readonly errorButton: Locator;

    protected page: Page;

    constructor(page: Page) {
        //Initialize locators
        this.usernameInput = page.locator('[data-test="username"]');
        this.passwordInput = page.locator('[data-test="password"]');
        this.loginButton = page.locator('[data-test="login-button"]');
        this.errorMessage = page.locator('[data-test="error"]');
        this.errorButton = page.locator('[data-test="error-button"]')

        this.page = page;
    }

    //Create function for each element
    //Combine authorization steps

    async enterUsername(username: string): Promise<void> {
        await this.usernameInput.fill(username);

    }

    async enterPassword(password: string): Promise<void> {
        await this.passwordInput.fill(password);
    }

    async clickLogin(): Promise<void> {
        await this.loginButton.click();
    }

    async authorize(username: string, password: string): Promise<void> {
        await this.enterUsername(username);
        await this.enterPassword(password);
        await this.clickLogin();
    }

    async getErrorMessage(): Promise<string> {
        const errorText = await this.errorMessage.textContent();
        return errorText || '';
    }

    async isErrorDisplayed(): Promise<boolean> {
        const isVisible = await this.errorMessage.isVisible();
        return isVisible;
    }

    async isOnLoginPage(): Promise<boolean> {
        const currentUrl = this.page.url();
        const isOnPage = currentUrl.includes("https://www.saucedemo.com");
        return isOnPage;
    }

    async closeErrorMessage(): Promise<void> {
        await expect(this.errorButton).toBeVisible();
        await this.errorButton.click();
        await expect(this.errorButton).toBeHidden();
    }

}