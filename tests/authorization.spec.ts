import { test, expect } from '@playwright/test'
import { LoginPage } from '../pages/LoginPage';

test.describe('Authorization suite', () => {
    let loginPage: LoginPage;

    test.beforeEach(async ({ page }) => {
        loginPage = new LoginPage(page);
        await page.goto('https://www.saucedemo.com');
    });


    test('Success login', async () => {
        //Call login page object - authorize function
        await loginPage.authorize('standard_user', 'secret_sauce');
    })

    test('Unhappy path: unsuccessful authorization', async () => {
        await loginPage.authorize('test', 'test');

        const errorMessage = await loginPage.getErrorMessage();
        expect(errorMessage).toContain('Epic sadface: Username and password do not match any user in this service');

        //isErrorDisplayed(); -> expect(...).toBeTruthy();
        //isOnLoginPage(); -> expect(...).toBeTruthy();

        const isErrorDisplayed = await loginPage.isErrorDisplayed();
        expect(isErrorDisplayed).toBeTruthy();

        const isOnLoginPage = await loginPage.isOnLoginPage();
        expect(isOnLoginPage).toBeTruthy();
    })

    //Invalid credentials: wrong username and correct password
    test('Invalid credentials - wrong username and correct password', async () => {
        await loginPage.authorize('user', 'secret_sauce');

        const errorMessage = await loginPage.getErrorMessage();
        expect(errorMessage).toContain('Epic sadface: Username and password do not match any user in this service');

        const isErrorDisplayed = await loginPage.isErrorDisplayed();
        expect(isErrorDisplayed).toBeTruthy();

        const isOnLoginPage = await loginPage.isOnLoginPage();
        expect(isOnLoginPage).toBeTruthy();
    })

    //Invalid credentials: wrong password and correct usrname
    test('Invalid credentials - wrong password and correct username', async () => {
        await loginPage.authorize('standard_user', 'my_password');

        const errorMessage = await loginPage.getErrorMessage();
        expect(errorMessage).toContain('Epic sadface: Username and password do not match any user in this service');

        const isErrorDisplayed = await loginPage.isErrorDisplayed();
        expect(isErrorDisplayed).toBeTruthy();

        const isOnLoginPage = await loginPage.isOnLoginPage();
        expect(isOnLoginPage).toBeTruthy();
    })

    //Invalid credentials: fields are empty
    test('Invalid credentials - fields are empty', async () => {
        await loginPage.authorize('', '');

        const errorMessage = await loginPage.getErrorMessage();
        expect(errorMessage).toContain('Epic sadface: Username is required');

        const isErrorDisplayed = await loginPage.isErrorDisplayed();
        expect(isErrorDisplayed).toBeTruthy();

        const isOnLoginPage = await loginPage.isOnLoginPage();
        expect(isOnLoginPage).toBeTruthy();

        //Validate that user can close error message
        await loginPage.closeErrorMessage();
    })
})