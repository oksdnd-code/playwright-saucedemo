import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:8080')
});

test('Wait for element appears after 2 seconds', async ({ page }) => {
    const showButton = page.locator('#show-delayed');
    const delayElement = page.locator('#delayed-element');

    //Check element is hidden before click
    await expect(delayElement).toBeHidden();

    //Click showButton
    await showButton.click();

    //Playwright will automatically wait to element
    await expect(delayElement).toBeVisible();

    await expect(delayElement).toContainText('I appeared! Check me with toBeVisible()');
});

test('Wait for element to disappers', async ({ page }) => {

    await page.click('#show-delayed');
    await expect(page.locator('#delayed-element')).toBeVisible();

    //Hide element
    await page.locator('#hide-element').click();
    await expect(page.locator('#delayed-element')).toBeHidden();

    await expect(page.locator('#result-basic')).toContainText('Element hidden');
});

test('Check that element was removed from DOM', async ({ page }) => {
    await page.click('#show-delayed');

    await expect(page.locator('#delayed-element')).toBeVisible();

    await page.click('#remove-element');

    //Verify that element is not existing in DOM anymore
    await page.locator('#delayed-element').waitFor({ state: 'detached' });

    //states:
    // attached - element present in DOM
    // detached - element is deleted from DOM
    // visible - element is visible
    // hidden - element is hidden or even deleted;
});

test('Wait for text is changed', async ({ page }) => {
    const textContainer = page.locator('#text-container');

    //Verify initial state
    await expect(textContainer).toHaveText('Original text');

    //Click on button
    await page.click('#change-text');

    //Verify middle state
    await expect(textContainer).toHaveText('Changing text...');

    //final state verification
    await expect(textContainer).toHaveText('New text after delay');

    const partialTextContainer = page.locator('#partial-text');
    await expect(partialTextContainer).toContainText('KEY');
    await expect(partialTextContainer).not.toContainText('YOLO');

    await page.click('#random-text');
    await expect(textContainer).toHaveText(/special|number|text/);
});

test('Verify form values', async ({ page }) => {

    const nameInput = page.locator('#name-input');
    const emailInput = page.locator('#email-input');
    const phoneInput = page.locator('#phone-input');

    //check name input empty, email input empty, and phone input containing value
    await expect(nameInput).toHaveValue('');
    await expect(emailInput).toHaveValue('');
    await expect(phoneInput).toHaveValue('+1 (555) 123-4567');

    //Fill the fields
    await nameInput.fill('Oksana Nikitina');
    await emailInput.fill('oksdnd@gmail.com');

    await expect(nameInput).toHaveValue('Oksana Nikitina');
    await expect(emailInput).toHaveValue('oksdnd@gmail.com');

    const submitButton = page.locator('#submit-form');
    await expect(submitButton).toBeDisabled();
    await page.click('#enable-submit');
    await expect(submitButton).toBeEnabled();
    await expect(submitButton).toContainText('Active');
});

test('Verify css properties', async ({ page }) => {
    const attributeBox = page.locator('#attribute-box');

    await expect(attributeBox).toHaveAttribute('data-status', 'pending');
    await expect(attributeBox).toHaveAttribute('data-count', '0');

    await page.click('#change-attribute');
    await expect(attributeBox).toHaveAttribute('data-status', 'active');
    await expect(attributeBox).toHaveAttribute('data-count', '1');

    await page.click('#change-attribute');
    await expect(attributeBox).toHaveAttribute('data-count', '2');

    //Check 'Change Style' button click changes
    await page.click('#change-style');
    await expect(attributeBox).toHaveCSS('color', 'rgb(255, 0, 0)');
    await expect(attributeBox).toHaveCSS('font-size', '20px');
    // await expect(attributeBox).toHaveCSS('font-weight', 'bold');
    await expect(attributeBox).toHaveCSS('font-weight', '700');
});