// Dokumentace VISIBLE7 MICEK® (docs.visible7.io)
// Texty jsou v src/content/docs jako Markdown. Každou stránku jde zkopírovat
// do Notionu (Notion umí vložit Markdown) nebo publikovat tady.
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

export default defineConfig({
  site: 'https://docs.visible7.io',
  integrations: [
    starlight({
      title: 'VISIBLE7 · Dokumentace',
      description:
        'Jak funguje VISIBLE7 MICEK®: test nápadu, sedm bran, výpočty, videa, AI a napojení účtu.',
      defaultLocale: 'root',
      locales: { root: { label: 'Čeština', lang: 'cs' } },
      favicon: '/favicon.ico',
      customCss: ['./src/styles/visible7.css'],
      social: [{ icon: 'external', label: 'visible7.io', href: 'https://visible7.io' }],
      lastUpdated: false,
      sidebar: [
        { label: 'Začínáme', items: ['index', 'jak-to-funguje'] },
        { label: 'Test nápadu', items: ['test-napadu'] },
        {
          label: 'Sedm bran',
          items: [
            'brany/brana-1-vize',
            'brany/brana-2-ideace',
            'brany/pruzkum-trhu',
            'brany/brana-3-strategie-a-cisla',
            'brany/brany-4-7',
          ],
        },
        {
          label: 'Jak to funguje uvnitř',
          items: ['funkce/ai-asistent', 'funkce/videa', 'funkce/cash-flow-a-napojeni-uctu', 'funkce/osvedceni'],
        },
        { label: 'Data a soukromí', items: ['data-a-soukromi', 'pristup-a-cena'] },
      ],
    }),
  ],
});
