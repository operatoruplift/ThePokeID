# Bundled web fonts

These Latin WOFF2 files are bundled locally so builds and page rendering do not
depend on Google Fonts access. The current typography uses Lato for headings
and Roboto for body text. These open-license families provide a readable
humanist style without redistributing the reference site's proprietary fonts.
The original Geist, Bricolage Grotesque, and Schoolbell files are retained below.

| File | Source package | License |
| --- | --- | --- |
| `lato-latin-400-normal.woff2` | `@fontsource/lato@5.3.0` | SIL Open Font License 1.1; see `Lato-LICENSE.txt` |
| `lato-latin-700-normal.woff2` | `@fontsource/lato@5.3.0` | SIL Open Font License 1.1; see `Lato-LICENSE.txt` |
| `roboto-latin-wght-normal.woff2` | `@fontsource-variable/roboto@5.3.0` | SIL Open Font License 1.1; see `Roboto-LICENSE.txt` |
| `geist-latin-wght-normal.woff2` | `@fontsource-variable/geist@5.3.0` | SIL Open Font License 1.1; see `Geist-LICENSE.txt` |
| `bricolage-grotesque-latin-wght-normal.woff2` | `@fontsource-variable/bricolage-grotesque@5.3.0` | SIL Open Font License 1.1; see `BricolageGrotesque-LICENSE.txt` |
| `schoolbell-latin-400-normal.woff2` | `@fontsource/schoolbell@5.3.0` | Apache License 2.0; see `Schoolbell-LICENSE.txt` |

The files and license texts were copied unmodified from the npm packages. Active
fonts are loaded through `next/font/local` in `src/app/layout.tsx`; Lato includes
regular and bold weights, and Roboto is variable from 100 to 900.
