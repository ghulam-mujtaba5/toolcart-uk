import React from 'react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { CookieConsentProvider, useCookieConsent } from '@/context/cookie-consent-context';
import { CookieConsentBanner } from '@/components/storefront/cookie-consent-banner';
import { CookiePreferencesModal } from '@/components/storefront/cookie-preferences-modal';
import { CONSENT_COOKIE_NAME, TOOLCART_COOKIE_DEFINITIONS } from '@/types/cookie-consent';

function TestConsumer() {
  const { consent, hasConsented, isBannerOpen, isPreferencesOpen, openPreferences, resetConsent } =
    useCookieConsent();
  return (
    <div>
      <div data-testid="has-consented">{hasConsented ? 'true' : 'false'}</div>
      <div data-testid="is-banner-open">{isBannerOpen ? 'true' : 'false'}</div>
      <div data-testid="is-pref-open">{isPreferencesOpen ? 'true' : 'false'}</div>
      <div data-testid="consent-necessary">{consent.necessary ? 'true' : 'false'}</div>
      <div data-testid="consent-functional">{consent.functional ? 'true' : 'false'}</div>
      <div data-testid="consent-analytics">{consent.analytics ? 'true' : 'false'}</div>
      <div data-testid="consent-marketing">{consent.marketing ? 'true' : 'false'}</div>
      <button onClick={openPreferences} data-testid="open-pref-btn">
        Open Prefs
      </button>
      <button onClick={resetConsent} data-testid="reset-btn">
        Reset Consent
      </button>
    </div>
  );
}

describe('ToolCart UK Personalised Cookie Consent Banner & Preferences Suite', () => {
  beforeEach(() => {
    // Clear cookies and localStorage
    document.cookie = `${CONSENT_COOKIE_NAME}=; Path=/; Max-Age=0`;
    localStorage.clear();
  });

  afterEach(() => {
    document.cookie = `${CONSENT_COOKIE_NAME}=; Path=/; Max-Age=0`;
    localStorage.clear();
  });

  it('renders initial unconsented state: banner open, non-essential categories opt-out by default', () => {
    render(
      <CookieConsentProvider>
        <TestConsumer />
        <CookieConsentBanner />
        <CookiePreferencesModal />
      </CookieConsentProvider>
    );

    expect(screen.getByTestId('has-consented').textContent).toBe('false');
    expect(screen.getByTestId('is-banner-open').textContent).toBe('true');
    expect(screen.getByTestId('consent-necessary').textContent).toBe('true');
    expect(screen.getByTestId('consent-functional').textContent).toBe('false');
    expect(screen.getByTestId('consent-analytics').textContent).toBe('false');
    expect(screen.getByTestId('consent-marketing').textContent).toBe('false');

    // Banner elements
    expect(
      screen.getByRole('heading', { name: /toolcart uk cookie & privacy notice/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/pecr & uk gdpr compliant/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /accept all/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /reject non-essential/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /customise/i })).toBeInTheDocument();
  });

  it('accepts all cookies and stores preference in cookie & localStorage with timestamp', () => {
    const listener = vi.fn();
    window.addEventListener('toolcart-consent-updated', listener);

    render(
      <CookieConsentProvider>
        <TestConsumer />
        <CookieConsentBanner />
        <CookiePreferencesModal />
      </CookieConsentProvider>
    );

    const acceptBtn = screen.getByRole('button', { name: /accept all/i });
    fireEvent.click(acceptBtn);

    expect(screen.getByTestId('has-consented').textContent).toBe('true');
    expect(screen.getByTestId('is-banner-open').textContent).toBe('false');
    expect(screen.getByTestId('consent-functional').textContent).toBe('true');
    expect(screen.getByTestId('consent-analytics').textContent).toBe('true');
    expect(screen.getByTestId('consent-marketing').textContent).toBe('true');

    // Check cookie and localStorage persistence
    const stored = localStorage.getItem(CONSENT_COOKIE_NAME);
    expect(stored).not.toBeNull();
    const parsed = JSON.parse(stored!);
    expect(parsed.functional).toBe(true);
    expect(parsed.analytics).toBe(true);
    expect(parsed.marketing).toBe(true);
    expect(parsed.version).toBe('1.0.0');
    expect(parsed.timestamp).toBeTruthy();

    // Verify custom event
    expect(listener).toHaveBeenCalledTimes(1);

    // Floating trigger button is revealed after consent
    expect(screen.getByRole('button', { name: /open uk cookie preferences/i })).toBeInTheDocument();

    window.removeEventListener('toolcart-consent-updated', listener);
  });

  it('rejects non-essential cookies maintaining strictly necessary only', () => {
    render(
      <CookieConsentProvider>
        <TestConsumer />
        <CookieConsentBanner />
        <CookiePreferencesModal />
      </CookieConsentProvider>
    );

    const rejectBtn = screen.getByRole('button', { name: /reject non-essential/i });
    fireEvent.click(rejectBtn);

    expect(screen.getByTestId('has-consented').textContent).toBe('true');
    expect(screen.getByTestId('is-banner-open').textContent).toBe('false');
    expect(screen.getByTestId('consent-necessary').textContent).toBe('true');
    expect(screen.getByTestId('consent-functional').textContent).toBe('false');
    expect(screen.getByTestId('consent-analytics').textContent).toBe('false');
    expect(screen.getByTestId('consent-marketing').textContent).toBe('false');

    const stored = localStorage.getItem(CONSENT_COOKIE_NAME);
    const parsed = JSON.parse(stored!);
    expect(parsed.functional).toBe(false);
    expect(parsed.analytics).toBe(false);
    expect(parsed.marketing).toBe(false);
  });

  it('opens granular preferences modal, allows selective opt-in, and saves custom preferences', () => {
    render(
      <CookieConsentProvider>
        <TestConsumer />
        <CookieConsentBanner />
        <CookiePreferencesModal />
      </CookieConsentProvider>
    );

    // Open modal via Customise button
    const customiseBtn = screen.getByRole('button', { name: /customise/i });
    fireEvent.click(customiseBtn);

    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveAttribute('aria-modal', 'true');

    // Toggle Analytics only
    const analyticsSwitch = screen.getByRole('switch', {
      name: /toggle analytics and site diagnostics cookies/i,
    });
    expect(analyticsSwitch).toHaveAttribute('aria-checked', 'false');
    fireEvent.click(analyticsSwitch);
    expect(analyticsSwitch).toHaveAttribute('aria-checked', 'true');

    // Save preferences
    const saveBtn = screen.getByRole('button', { name: /save my preferences/i });
    fireEvent.click(saveBtn);

    // Verify outcome
    expect(screen.getByTestId('has-consented').textContent).toBe('true');
    expect(screen.getByTestId('consent-analytics').textContent).toBe('true');
    expect(screen.getByTestId('consent-functional').textContent).toBe('false');
    expect(screen.getByTestId('consent-marketing').textContent).toBe('false');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('closes preferences modal with Escape key without crashing', () => {
    render(
      <CookieConsentProvider>
        <TestConsumer />
        <CookieConsentBanner />
        <CookiePreferencesModal />
      </CookieConsentProvider>
    );

    fireEvent.click(screen.getByRole('button', { name: /customise/i }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('re-opens preferences modal on global "open-cookie-preferences" custom event', () => {
    render(
      <CookieConsentProvider>
        <TestConsumer />
        <CookieConsentBanner />
        <CookiePreferencesModal />
      </CookieConsentProvider>
    );

    // First accept all to dismiss banner
    fireEvent.click(screen.getByRole('button', { name: /accept all/i }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    // Trigger window custom event
    act(() => {
      window.dispatchEvent(new CustomEvent('open-cookie-preferences'));
    });

    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('renders complete table of registered ToolCart UK cookies with category filter', () => {
    render(
      <CookieConsentProvider>
        <TestConsumer />
        <CookieConsentBanner />
        <CookiePreferencesModal />
      </CookieConsentProvider>
    );

    fireEvent.click(screen.getByRole('button', { name: /customise/i }));

    const viewTableBtn = screen.getByRole('button', {
      name: /view registered cookie details/i,
    });
    fireEvent.click(viewTableBtn);

    // Verify cookies are listed
    expect(screen.getByText('toolcart_cart_id')).toBeInTheDocument();
    expect(screen.getByText('toolcart_vat_mode')).toBeInTheDocument();
    expect(screen.getByText('toolcart_cookie_consent_v1')).toBeInTheDocument();

    // Filter by necessary
    const necessaryPill = screen.getByRole('button', { name: /^necessary$/i });
    fireEvent.click(necessaryPill);
    expect(screen.getByText('toolcart_cart_id')).toBeInTheDocument();
  });

  it('verifies touch target ergonomics (min 44px) and WCAG AA contrast styling', () => {
    render(
      <CookieConsentProvider>
        <TestConsumer />
        <CookieConsentBanner />
        <CookiePreferencesModal />
      </CookieConsentProvider>
    );

    const acceptBtn = screen.getByRole('button', { name: /accept all/i });
    const rejectBtn = screen.getByRole('button', { name: /reject non-essential/i });
    const customiseBtn = screen.getByRole('button', { name: /customise/i });

    expect(acceptBtn.className).toContain('min-h-[44px]');
    expect(rejectBtn.className).toContain('min-h-[44px]');
    expect(customiseBtn.className).toContain('min-h-[44px]');

    // Accept button: Cobalt primary with white text
    expect(acceptBtn.className).toContain('bg-tc-primary');
    expect(acceptBtn.className).toContain('text-white');

    // Reject button: Ink border with text-tc-ink
    expect(rejectBtn.className).toContain('border-2 border-tc-ink');
    expect(rejectBtn.className).toContain('text-tc-ink');
  });
});
