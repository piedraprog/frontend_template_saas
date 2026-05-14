import { definePreset } from '@primeuix/themes';
import Aura from '@primeuix/themes/aura';

const AdminTheme = definePreset(Aura, {
  semantic: {
    primary: {
      50: '{slate.50}',
      100: '{slate.100}',
      200: '{slate.200}',
      300: '{slate.300}',
      400: '{slate.400}',
      500: '{slate.500}',
      600: '{slate.600}',
      700: '{slate.700}',
      800: '{slate.800}',
      900: '{slate.900}',
      950: '{slate.950}',
    },
    focusRing: {
      width: '2px',
      style: 'solid',
      color: '{primary.500}',
      offset: '2px',
    },
    colorScheme: {
      light: {
        primary: {
          color: '{slate.900}',
          inverseColor: '#ffffff',
          hoverColor: '{slate.800}',
          activeColor: '{slate.700}',
        },
        surface: {
          0: '#ffffff',
          50: '{zinc.50}',
          100: '{zinc.100}',
          200: '{zinc.200}',
          300: '{zinc.300}',
          400: '{zinc.400}',
          500: '{zinc.500}',
          600: '{zinc.600}',
          700: '{zinc.700}',
          800: '{zinc.800}',
          900: '{zinc.900}',
          950: '{zinc.950}',
        },
      },
    },
  },
  components: {
    button: {
      root: {
        borderRadius: '0.5rem',
        roundedBorderRadius: '999px',
        paddingX: '1rem',
        paddingY: '0.625rem',
        label: {
          fontWeight: '650',
        },
        transitionDuration: '160ms',
      },
    },
    inputtext: {
      root: {
        borderRadius: '0.5rem',
        paddingX: '0.875rem',
        paddingY: '0.6875rem',
        transitionDuration: '160ms',
      },
    },
    checkbox: {
      root: {
        borderRadius: '0.375rem',
      },
    },
  },
});

export default AdminTheme;
