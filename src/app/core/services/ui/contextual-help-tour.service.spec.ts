import { TestBed } from '@angular/core/testing';
import { Permission } from '../../models/enums/permission.enum';
import { PermissionService } from '../permission.service';
import { HelpApiService } from '../api/help/help-api.service';
import { ContextualHelpTourService } from './contextual-help-tour.service';

describe('ContextualHelpTourService', () => {
  let service: ContextualHelpTourService;
  let hasUsersView = true;

  beforeEach(() => {
    hasUsersView = true;
    TestBed.configureTestingModule({
      providers: [
        ContextualHelpTourService,
        {
          provide: HelpApiService,
          useValue: jasmine.createSpyObj<HelpApiService>('HelpApiService', [
            'completeTour',
            'dismissTour',
          ]),
        },
        {
          provide: PermissionService,
          useValue: {
            has: (permission: Permission) =>
              permission === Permission.USERS_VIEW ? hasUsersView : false,
          },
        },
      ],
    });
    service = TestBed.inject(ContextualHelpTourService);
    service.setHelpPreferences({ autoStartScreenGuides: false, guidedHelpPaused: false });
    const host = document.createElement('div');
    host.id = 'contextual-help-tour-test-host';
    document.body.append(host);
  });

  afterEach(() => document.getElementById('contextual-help-tour-test-host')?.remove());

  it('selects the mobile navigation target when the desktop sidebar is absent', () => {
    const mobileNavigation = document.createElement('nav');
    mobileNavigation.dataset['tour'] = 'mobile-navigation-settings';
    document.getElementById('contextual-help-tour-test-host')?.append(mobileNavigation);

    const steps = service['createSteps']([
      {
        selector: [
          '[data-tour="desktop-navigation-settings"]',
          '[data-tour="mobile-navigation-settings"]',
        ],
        title: 'Configuración',
        description: 'Descripción',
      },
    ]);

    const target = steps[0].element as () => Element;
    expect(target()).toBe(mobileNavigation);
  });

  it('keeps pull-only defaults: screen auto-start disabled', () => {
    expect(service.shouldInviteForUrl('/dashboard')).toBeFalse();
    expect(service.hasScreenTourForUrl('/dashboard')).toBeTrue();
  });

  it('defines a slim platform-map with at most 5 top-level steps and no shop domains', () => {
    const map = service['guideById']('platform-map');
    expect(map?.kind).toBe('platform-map');
    expect(map?.steps.length).toBeLessThanOrEqual(5);

    const selectors = JSON.stringify(map?.steps.map((step) => step.selector) ?? []);
    expect(selectors).not.toContain('navigation-products');
    expect(selectors).not.toContain('navigation-orders');
    expect(selectors).not.toContain('navigation-shop');
    expect(selectors).toContain('navigation-dashboard');
    expect(selectors).toContain('navigation-settings');
    expect(selectors).toContain('navigation-help');
  });

  it('omits users step from the map when the permission is missing', () => {
    hasUsersView = false;
    const map = service['guideById']('platform-map');
    const filtered = service['filterSteps'](map?.steps ?? []);
    const selectors = JSON.stringify(filtered.map((step) => step.selector));
    expect(selectors).not.toContain('navigation-users');
  });

  it('defines dashboard-screen and settings-intro only', () => {
    expect(service['guideForUrl']('/dashboard')?.id).toBe('dashboard-screen');
    expect(service['guideForUrl']('/settings')?.id).toBe('settings-intro');
    expect(service.hasScreenTourForUrl('/shop')).toBeFalse();
    expect(service.hasScreenTourForUrl('/orders')).toBeFalse();
  });

  it('exposes platform map when dashboard is visible and motion is allowed', () => {
    expect(service.hasPlatformMap()).toBeTrue();
  });
});
