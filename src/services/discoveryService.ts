/**
 * Discovery & Onboarding Lifecycle Manager for Janus
 * Manages first-run mandatory onboarding, progressive day-1 mini discoveries,
 * 14-day cadence discovery, and feature usage tracking.
 */

export const ONBOARDING_CURRENT_VERSION = 'v1';

const STORAGE_KEYS = {
  ONBOARDING_STATE: 'janus_onboarding_state_v1',
  FEATURE_USAGE: 'janus_feature_usage_v1',
};

export interface OnboardingState {
  version: string;
  completed: boolean;
  completedAt: number | null;
  firstInstalledAt: number;
  lastDiscoveryShownAt: number | null;
  day1DiscoveriesShown: number;
  shownDiscoveryIds: string[];
}

export interface FeatureDiscoveryItem {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  icon: string;
  actionLabel: string;
  actionType: 'filter_leaving' | 'filter_free' | 'filter_private' | 'open_leaving_modal' | 'open_map';
  targetFeatureKey: string;
}

// Concrete real features available in Janus
export const DISCOVERY_CATALOG: FeatureDiscoveryItem[] = [
  {
    id: 'disc_leaving_spots',
    title: 'Qualcuno sta liberando il posto 🚗',
    subtitle: 'Vedi le auto in partenza in tempo reale e arriva prima che il posto sia conteso.',
    badge: 'In uscita live',
    icon: '🚗',
    actionLabel: 'Mostra su mappa',
    actionType: 'filter_leaving',
    targetFeatureKey: 'leaving_soon',
  },
  {
    id: 'disc_free_parking',
    title: 'Parcheggi gratuiti a Roma 🅿️',
    subtitle: 'Scopri gli stalli bianchi e le aree di scambio verificate a Clodio, Termini e Prati.',
    badge: 'Strisce bianche',
    icon: '🅿️',
    actionLabel: 'Vedi gratuiti',
    actionType: 'filter_free',
    targetFeatureKey: 'free_parking',
  },
  {
    id: 'disc_share_leaving',
    title: 'Stai lasciando il parcheggio? 🤝',
    subtitle: 'Tocca "Sto liberando il posto" per aiutare un altro automobilista e azzerare i giri a vuoto.',
    badge: 'Community',
    icon: '✨',
    actionLabel: 'Segnala sosta',
    actionType: 'open_leaving_modal',
    targetFeatureKey: 'report_leaving',
  },
  {
    id: 'disc_private_box',
    title: 'Posti privati custoditi 🔒',
    subtitle: 'Trova box e spazi protetti con tariffe chiare all\'ora e varchi ZTL verificati.',
    badge: 'Sosta protetta',
    icon: '🔒',
    actionLabel: 'Scopri privati',
    actionType: 'filter_private',
    targetFeatureKey: 'private_parking',
  },
];

class DiscoveryManager {
  private state: OnboardingState;
  private usedFeatures: Set<string>;

  constructor() {
    this.state = this.loadState();
    this.usedFeatures = this.loadUsedFeatures();
  }

  private loadState(): OnboardingState {
    const now = Date.now();
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.ONBOARDING_STATE);
      if (raw) {
        const parsed = JSON.parse(raw);
        return {
          version: parsed.version || ONBOARDING_CURRENT_VERSION,
          completed: Boolean(parsed.completed),
          completedAt: parsed.completedAt || null,
          firstInstalledAt: parsed.firstInstalledAt || now,
          lastDiscoveryShownAt: parsed.lastDiscoveryShownAt || null,
          day1DiscoveriesShown: Number(parsed.day1DiscoveriesShown) || 0,
          shownDiscoveryIds: Array.isArray(parsed.shownDiscoveryIds) ? parsed.shownDiscoveryIds : [],
        };
      }
    } catch (e) {
      console.warn('Could not read onboarding state from storage', e);
    }

    // Check legacy key fallback
    const legacyCompleted = localStorage.getItem('janus_onboarding_completed') === 'true';

    return {
      version: ONBOARDING_CURRENT_VERSION,
      completed: legacyCompleted,
      completedAt: legacyCompleted ? now - 86400000 : null,
      firstInstalledAt: now,
      lastDiscoveryShownAt: null,
      day1DiscoveriesShown: 0,
      shownDiscoveryIds: [],
    };
  }

  private saveState(): void {
    try {
      localStorage.setItem(STORAGE_KEYS.ONBOARDING_STATE, JSON.stringify(this.state));
      // Keep legacy key in sync for backwards compatibility
      if (this.state.completed) {
        localStorage.setItem('janus_onboarding_completed', 'true');
      }
    } catch (e) {
      console.warn('Could not save onboarding state to storage', e);
    }
  }

  private loadUsedFeatures(): Set<string> {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.FEATURE_USAGE);
      if (raw) {
        const list = JSON.parse(raw);
        if (Array.isArray(list)) {
          return new Set(list);
        }
      }
    } catch {
      // fallback
    }
    return new Set<string>();
  }

  private saveUsedFeatures(): void {
    try {
      localStorage.setItem(STORAGE_KEYS.FEATURE_USAGE, JSON.stringify(Array.from(this.usedFeatures)));
    } catch {
      // ignore
    }
  }

  public isFirstRun(): boolean {
    return !this.state.completed || this.state.version !== ONBOARDING_CURRENT_VERSION;
  }

  public markOnboardingCompleted(): void {
    const now = Date.now();
    this.state.completed = true;
    this.state.completedAt = now;
    this.state.version = ONBOARDING_CURRENT_VERSION;
    this.saveState();
  }

  public trackFeatureUsed(featureKey: string): void {
    if (!this.usedFeatures.has(featureKey)) {
      this.usedFeatures.add(featureKey);
      this.saveUsedFeatures();
    }
  }

  public isFeatureAlreadyUsed(featureKey: string): boolean {
    return this.usedFeatures.has(featureKey);
  }

  /**
   * Evaluates if a discovery item should be surfaced at this moment.
   * Guarded by non-intrusive constraints:
   * - Onboarding must be completed.
   * - Day 1: max 2 discoveries total, spaced apart by at least 15 minutes.
   * - After Day 1: once every 14 days (~1,209,600,000 ms).
   * - Never suggests a feature the user has already naturally discovered/used.
   * - Never suggests a feature that was already shown.
   */
  public getNextEligibleDiscovery(options?: { isDevOverride?: boolean }): FeatureDiscoveryItem | null {
    if (!this.state.completed && !options?.isDevOverride) {
      return null;
    }

    const now = Date.now();
    const completedAt = this.state.completedAt || this.state.firstInstalledAt;
    const timeSinceCompletion = now - completedAt;
    const ONE_DAY_MS = 24 * 60 * 60 * 1000;
    const FOURTEEN_DAYS_MS = 14 * ONE_DAY_MS;
    const isDayOne = timeSinceCompletion <= ONE_DAY_MS;

    if (!options?.isDevOverride) {
      if (isDayOne) {
        // Day 1 rules: Max 2 discoveries during day 1
        if (this.state.day1DiscoveriesShown >= 2) {
          return null;
        }
        // At least 10 minutes between day 1 discoveries
        if (this.state.lastDiscoveryShownAt && (now - this.state.lastDiscoveryShownAt) < 10 * 60 * 1000) {
          return null;
        }
      } else {
        // Day 2+: Cadence of approx 14 days
        if (this.state.lastDiscoveryShownAt) {
          const timeSinceLastDiscovery = now - this.state.lastDiscoveryShownAt;
          if (timeSinceLastDiscovery < FOURTEEN_DAYS_MS) {
            return null;
          }
        }
      }
    }

    // Find candidate from catalog that has not been shown and has not been used already
    for (const item of DISCOVERY_CATALOG) {
      const alreadyShown = this.state.shownDiscoveryIds.includes(item.id);
      const alreadyUsed = this.usedFeatures.has(item.targetFeatureKey);

      if (!alreadyShown && !alreadyUsed) {
        return item;
      }
    }

    return null;
  }

  public recordDiscoveryShown(discoveryId: string): void {
    const now = Date.now();
    this.state.lastDiscoveryShownAt = now;
    if (!this.state.shownDiscoveryIds.includes(discoveryId)) {
      this.state.shownDiscoveryIds.push(discoveryId);
    }

    const completedAt = this.state.completedAt || this.state.firstInstalledAt;
    if (now - completedAt <= 24 * 60 * 60 * 1000) {
      this.state.day1DiscoveriesShown += 1;
    }

    this.saveState();
  }

  public resetForTesting(): void {
    localStorage.removeItem(STORAGE_KEYS.ONBOARDING_STATE);
    localStorage.removeItem(STORAGE_KEYS.FEATURE_USAGE);
    localStorage.removeItem('janus_onboarding_completed');
    this.state = this.loadState();
    this.usedFeatures = new Set();
  }

  public getDebugStatus() {
    return {
      ...this.state,
      usedFeaturesCount: this.usedFeatures.size,
      usedFeatures: Array.from(this.usedFeatures),
    };
  }
}

export const discoveryService = new DiscoveryManager();
