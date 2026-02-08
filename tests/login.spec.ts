import { test, expect } from "@playwright/test";

test.describe('Authorization on saucedemo.com without POM', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto('https://www.saucedemo.com');
    });

    test('Happy path: sucess authorization', async ({ page }) => {
        await page.locator('[data-test="username"]').fill('standard_user');
        await page.locator('[data-test="password"]').fill('secret_sauce');
        await page.locator('[data-test="login-button"]').click();

        //Assertions
        await expect(page).toHaveURL('https://www.saucedemo.com/inventory.html');
        //regExp
        await expect(page).toHaveURL(/.*inventory.html/);

        await expect(page.locator('.title')).toHaveText('Products');
        await expect(page.locator('.inventory_container')).toBeVisible();
    })

    //Exercise 1:
    //Test: Authorize with incorrect password
    //Assertions:
    //Verify that error message element is visible
    //Verify that error message element contains exact text
    //Verify that user is still on the same page
    //Verify that login button is still present
    test('Authorization with incorrect password', async ({ page }) => {
        await page.locator('[data-test="username"]').fill('standard_user');
        await page.locator('[data-test="password"]').fill('secret_');
        await page.locator('[data-test="login-button"]').click();

        //Assertions
        await expect(page.locator('.error-message-container')).toBeVisible();
        await expect(page.locator('.error-message-container')).toHaveText('Epic sadface: Username and password do not match any user in this service');
        await expect(page).toHaveURL('https://www.saucedemo.com');
        await expect(page.locator('[data-test="login-button"]')).toBeVisible();
    })

    test('Close error message and verify it is dissappeared', async ({ page }) => {
        await page.locator('[data-test="login-button"]').click();

        //Assertions
        await expect(page.locator('[data-test="error"]')).toBeVisible();

        const errorButton = page.locator('[data-test="error-button"]')
        await expect(errorButton).toBeVisible();

        await errorButton.click();
        await expect(page.locator('[data-test="error"]')).not.toBeVisible();
    })

    test('Verify password field has type = password and placeholder', async ({ page }) => {
        const passwordInput = page.locator('[data-test="password"]');
        await expect(passwordInput).toHaveAttribute('placeholder', 'Password');
        await expect(passwordInput).toHaveAttribute('type', 'password');
    })

    //Login button is enabled and login button contains text = 'Login'
    test('Verify that Login button', async ({ page }) => {
        const loginButton = page.locator('[data-test="login-button"]');
        await expect(loginButton).toBeEnabled();
        await expect(loginButton).toHaveText('Login');
    })
})

//POM = page object model