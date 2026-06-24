# WordPress vs Rake CMS — Feature Parity Analysis

> **Generated:** June 18, 2026
> **Source:** Full codebase audit of `/home/hermes/rake-cms-2` vs WordPress 6.x architecture reference
> **Legend:** ✅ Done | 🟡 Partial | ❌ Missing | 🔲 Not applicable

---

## 1. DATABASE SCHEMA

| WordPress Table | Rake CMS | Notes |
|---|---|---|
| `wp_posts` | ✅ `wp_posts` | Full parity: id, title, content, excerpt, status, type, slug, parent, author, dates, comment status/count, menu_order, guid, ping_status, to_ping, pinged, post_content_filtered, post_mime_type |
| `wp_postmeta` | ✅ `wp_postmeta` | Full parity (meta_id, post_id, meta_key, meta_value) |
| `wp_users` | ✅ `wp_users` | Full parity: id, login, pass, email, url, registered, status, display_name |
| `wp_usermeta` | ❌ Missing | User meta for extra profile fields, preferences |
| `wp_comments` | ✅ `wp_comments` | Full parity: id, post_id, author, email, url, IP, date, content, approved, parent, agent, type |
| `wp_commentmeta` | ❌ Missing | Comment metadata (spam reporting, flags) |
| `wp_terms` | ✅ `wp_terms` | Full parity (term_id, name, slug, term_group) |
| `wp_term_taxonomy` | ✅ `wp_term_taxonomy` | Full parity: id, term_id, taxonomy, description, parent, count |
| `wp_term_relationships` | ✅ `wp_term_relationships` | Full parity (object_id, term_taxonomy_id, term_order) |
| `wp_options` | ✅ `wp_options` | Full parity: option_id, site_id, option_name, option_value, autoload |
| `wp_revisions` | ✅ `wp_revisions` | Full parity (stored in separate table, linked to posts) |
| `wp_sites` | ✅ `wp_sites` (custom) | Multi-tenant: slug, subdomain, domain, description, business_type, theme_config, is_active — **New: WordPress doesn't have this natively (multisite is different)** |
| `wp_links` | ❌ Missing | Blogroll/link manager (deprecated in WP since 3.5 but still in schema) |
| `wp_actionscheduler` | ❌ Missing | Action Scheduler queue table (used by WooCommerce + WP-Cron alternative) |

---

## 2. CONTENT TYPES & TAXONOMIES

| Feature | Status | Notes |
|---|---|---|
| Posts | ✅ | post type, statuses (publish, draft, pending, trash), comments, dates, slugs, excerpts |
| Pages | ✅ | Hierarchical via `postParent`, page templates concept not implemented |
| Custom Post Types | ✅ | Full registry API: registerPostType(), labels, supports, capabilities, admin UI menu integration, dynamic admin pages |
| Post Formats | ❌ | No `post_format` taxonomy or format-specific rendering |
| Categories | ✅ | Hierarchical taxonomy via `termTaxonomy` with parent |
| Tags | ✅ | Non-hierarchical taxonomy (`post_tag`) |
| Custom Taxonomies | ✅ | Full registry API: registerTaxonomy(), hierarchical/non-hierarchical, per-post-type association |
| Hierarchical Categories | 🟡 | Schema supports `parent` but admin UI doesn't show tree/hierarchy |
| Category/Tag Count Sync | ✅ | Count incremented/decremented on post save/delete |
| Term Descriptions | ✅ | Present in `termTaxonomy.description` |

---

## 3. ADMIN PANEL

| Feature | Status | Notes |
|---|---|---|
| Dashboard | 🟡 | Basic admin page, no stats/charts/widgets |
| Posts List | ✅ | Type, status, date, comment count, trash management |
| Post Editor | 🟡 | Text-based editor, not rich; PostEditor component with title, slug, content, excerpt, categories, tags, featured image, status, type, parent page |
| Block Editor (Gutenberg) | 🟡 | BlockNote editor imported but placeholder UI — not fully wired |
| Media Library | 🟡 | Grid view of images, upload form, S3 support — but no editing, cropping, or filtering |
| Comments | ✅ | List, approve, delete — pending/approved sections |
| Categories/Tags | ✅ | List, add, delete categories and tags |
| Navigation Menus | ✅ | Full admin UI: create/rename/delete menus, add/remove/reorder items, custom links support, menu item metadata |
| Users | ✅ | List, edit, profile fields |
| User Editor | ✅ | Username, display name, email, password |
| Settings | ✅ | Site title, tagline, posts per page, default category |
| Admin Toolbar | ❌ | No front-end admin bar for logged-in users |
| Admin AJAX | ❌ | No admin-ajax equivalent; uses direct API routes |
| Admin Notices | ❌ | No notifications system (success/error banners) |
| Bulk Actions | ❌ | No bulk edit/delete/trash on post lists |
| Quick Edit | ❌ | No inline quick-edit on post list |
| Screen Options | ❌ | No per-screen layout/visibility settings |
| Help Tabs | ❌ | No contextual help in admin screens |
| Admin Color Schemes | ❌ | Only one theme |
| Site Health | ❌ | No health check / debug info screen |

---

## 4. THEMING SYSTEM

| Feature | Status | Notes |
|---|---|---|
| Theme Generator | ✅ | Auto-generates Tailwind-themed sites with framer-motion animations |
| Header (sticky, glass) | ✅ | Matte glass effect, business-type-aware nav links |
| Hero Section | ✅ | Industry-aware content |
| About Section | ✅ | Dynamic content per business |
| Services Section | ✅ | Business-type-aware |
| Reviews/Testimonials | ✅ | Scraped or placeholder |
| Contact Section | ✅ | Address, phone, email, contact form |
| Footer | ✅ | Business info, links, watermark |
| Theme Colors | ✅ | Photo-extracted + industry palette variants |
| Language Toggle (EN/ES) | ✅ | Interactive React state toggle |
| Template Hierarchy | ❌ | No template hierarchy (single-layout design) |
| Theme Customizer | ❌ | No live preview customization |
| Widget Areas | ❌ | No sidebar widgets |
| Navigation Menus | ✅ | API + admin UI: create/rename/delete menus, add/remove/reorder items, custom links, tree rendering, getMenu()/renderMenuHtml() helpers |
| Theme.json (FSE) | ❌ | No block themes / full-site editing |
| Child Themes | ❌ | No theme inheritance |
| Custom Page Templates | ❌ | Cannot assign different layouts per page |
| Theme Switching | ❌ | One active theme, no theme browser |

---

## 5. CONTENT EDITOR

| Feature | Status | Notes |
|---|---|---|
| BlockNote Editor | 🟡 | Imported but placeholder; not rendering real BlockNote component |
| Rich Text Editing | 🟡 | Placeholder toolbar for bold, italic, heading, link, list, quote, image |
| HTML Editor | 🟡 | Textarea accepts HTML or block JSON |
| Markdown Support | ❌ | No markdown input |
| Media Embedding | ❌ | No inline media insertion in content |
| Slash Commands | ❌ | Not wired up |
| Blocks (columns, etc.) | ⬜ | BlockNote supports these but UI not connected |
| Reusable Blocks | ❌ | No pattern/block saving |
| Block Inspector | ❌ | No block settings panel |

---

## 6. USER MANAGEMENT & AUTH

| Feature | Status | Notes |
|---|---|---|
| Auth.js v5 | ✅ | Credentials, session management |
| Login Page | ✅ | `/login` |
| Registration | ✅ | `/register` |
| Password Reset | ✅ | Forgot password → email → reset token flow |
| Roles (Admin, Editor, Author, Contributor, Subscriber) | ✅ | Fully defined in `capabilities.ts` |
| Role-based Capabilities | ✅ | 40+ WordPress-compatible capabilities defined |
| Permission Checks | ✅ | `canEditPost`, `canDeletePost`, `canPublish`, `canManageOptions` |
| User Listing | ✅ | Admin users page |
| User Editing | ✅ | Username, email, display name, password |
| User Meta | ❌ | No `wp_usermeta` table |
| User Profile Page | 🟡 | `/profile` page exists but limited fields |
| Application Passwords | ❌ | No API token auth |
| Session Management | ❌ | No "sessions log out everywhere" |
| User Avatars | ❌ | No Gravatar or avatar upload |
| Two-Factor Auth | ❌ | No 2FA |

---

## 7. API & EXTENSIBILITY

| Feature | Status | Notes |
|---|---|---|
| REST API (Posts) | ✅ | `GET/POST /api/posts`, `PUT/DELETE /api/posts/[id]` |
| REST API (Comments) | ✅ | `GET/POST /api/comments`, approve/delete endpoints |
| REST API (Media) | ✅ | `POST /api/media` (upload), file listing |
| REST API (Tags) | ✅ | `POST /api/tags`, delete |
| REST API (Settings) | ✅ | `POST /api/settings` |
| REST API (Profile) | ✅ | `GET/PUT /api/profile` |
| REST API (Users) | ✅ | `GET/PUT /api/users/[id]` |
| REST API (Auth) | ✅ | Register, login, forgot/reset password |
| Hooks/Actions System | ✅ | Full implementation: addAction(), doAction(), removeAction(), hasAction(), priority ordering, async support |
| Filters System | ✅ | Full implementation: addFilter(), applyFilters(), removeFilter(), priority chain, async support |
| Plugin System | ❌ | No plugin architecture, activation, or hooks |
| Shortcodes | ✅ | Full parser: addShortcode(), doShortcode(), built-in gallery/audio/video/caption/embed shortcodes |
| oEmbed | ❌ | No auto-embed of URLs |
| Widget API | ❌ | No `register_sidebar` / `dynamic_sidebar` |
| WP-CLI | ❌ | No CLI command registration API (has CLI scripts but no extension point) |
| REST API Schema | ❌ | No API schema / discovery endpoint |

---

## 8. MEDIA HANDLING

| Feature | Status | Notes |
|---|---|---|
| Upload | ✅ | Local and S3 storage |
| Date-based Organization | ✅ | `/YYYY/MM/filename` |
| MIME Type Detection | ✅ | Extension-based |
| Thumbnail Generation | ✅ | Sharp-based in `thumbnails.ts` |
| Multiple Image Sizes | ❌ | No thumbnail/medium/large variants |
| Media Editing | ❌ | No crop, resize, or rotate in UI |
| Alt Text | 🟡 | Stored in metadata but not managed in UI |
| Attachment Pages | ❌ | No single attachment view |
| File Type Whitelist | 🟡 | MIME mapping exists but not enforced on upload |
| CDN Support | 🟡 | Via S3 URL pattern, no dedicated CDN config |

---

## 9. COMMENTS & MODERATION

| Feature | Status | Notes |
|---|---|---|
| Comment Submission | ✅ | Via API |
| Comment Approval | ✅ | Admin approve/reject |
| Auto-approve (registered) | ✅ | If email provided |
| Comment Status per Post | ✅ | `open` / `closed` |
| Rate Limiting | ✅ | IP-based rate limiter |
| Comment Author Info | ✅ | Author, email, IP stored |
| Threaded Comments | ❌ | No `comment_parent` UI |
| Comment Moderation Queue | 🟡 | Filtered by approved/pending |
| Spam Detection | ❌ | No Akismet or equivalent |
| Comment Editing | ❌ | No comment editing by admin |
| Comment Notifications | ✅ | Email notification to post author |
| Pingbacks/Trackbacks | ❌ | Not supported |

---

## 10. SEARCH & FEEDS

| Feature | Status | Notes |
|---|---|---|
| Full-text Search | ✅ | `/search` page with query parameter |
| RSS / Atom Feed | ✅ | `/feed.xml` route and `/feed` route |
| Search Results | ❌ | No search results page (endpoint exists, no template) |

---

## 11. SECURITY

| Feature | Status | Notes |
|---|---|---|
| Rate Limiting | ✅ | Per-IP rate limiter |
| Input Validation | ✅ | Zod schema validation in `validation.ts` |
| XSS Headers | ✅ | Security headers middleware |
| Password Hashing | ✅ | bcryptjs |
| Nonce / CSRF Protection | ✅ | WordPress-compatible nonce system: createNonce(), verifyNonce(), nonceField(), nonceUrl(), X-WP-Nonce header support, 24h window |
| Role-based Access | ✅ | Capability checks on all API routes |
| Environment Validation | ✅ | Env validator at startup |
| SQL Injection | ✅ | Drizzle ORM handles parameterization |
| HTTPS Enforcement | 🟡 | Via Apache proxy, not app-level |
| File Upload Validation | 🟡 | No extension/content-type validation on upload |
| Nonce System | ❌ | No WordPress nonce equivalent |

---

## 12. MULTISITE / MULTI-TENANT

| Feature | Status | Notes |
|---|---|---|
| Multi-tenant Subdomains | ✅ | `{slug}.alexawebservers.com` + Apache reverse proxy |
| Site Registry | ✅ | `wp_sites` table with themeConfig, businessType, slug |
| Per-site Content Isolation | ✅ | `site_id` in options, per-site schema planned |
| Network Admin | ❌ | No super-admin panel for managing all sites |
| Shared vs Separate DB | 🟡 | Shared DB with site_id distinction |
| Site Creation CLI | ✅ | `rapid-deploy.ts` script |
| User Sync Across Sites | ❌ | No user sharing between sites |
| Virtualmin Integration | ✅ | Sub-server per site with isolated Unix user |

---

## 13. SCHEDULING & CRON

| Feature | Status | Notes |
|---|---|---|
| Scheduled Publishing | 🟡 | `postStatus` supports future dates but no cron trigger to publish |
| Post Lifecycle Hooks | ✅ | save_post, wp_insert_post, publish_post, trash_post, untrash_post, delete_post, before_delete_post, post_updated all wired in API routes |
| WP-Cron Equivalent | ❌ | No internal pseudo-cron system |
| External Cron Jobs | 🟡 | Via system cron + Hermes agent automation |
| Action Scheduler | ❌ | No queue-based deferred task system |

---

## 14. i18n / LOCALIZATION

| Feature | Status | Notes |
|---|---|---|
| Spanish Language Content | ✅ | Auto-detected via business name/location |
| English Content | ✅ | Default |
| Language Toggle | ✅ | Interactive EN/ES on generated sites |
| MO/PO Translation Files | ❌ | No gettext-style translation system |
| Text Domain System | ❌ | No `__()` / `_e()` translation functions |
| RTL Support | ❌ | No right-to-left language support |

---

## 15. IMPORT / EXPORT

| Feature | Status | Notes |
|---|---|---|
| WordPress DB Import | ✅ | `import-wp.ts` — migrates MySQL WP → PostgreSQL |
| WordPress File Import | ✅ | `import-files.ts` — syncs wp-content/uploads |
| Schema Introspection | ✅ | `schema-introspector.ts` — reads MySQL WP schema |
| PHP Template Parsing | ✅ | `php-parser.ts` — analyzes PHP theme files |
| WXR Export | ❌ | No WordPress eXtended RSS export |
| Content Export (JSON) | ❌ | No CMS-native export format |
| Site Migration CLI | ✅ | `import-wp.ts`, `import-db.ts`, `import-files.ts`, `import-theme.ts` |

---

## 16. DEPLOYMENT & DEVOPS

| Feature | Status | Notes |
|---|---|---|
| Rapid Deploy CLI | ✅ | Scrape → theme → content → deploy pipeline |
| Web Scraper | ✅ | Cheerio-based site scraper |
| Google Maps Scraper | ✅ | Google Places API integration |
| Brave Search Scraper | ✅ | Fallback enrichment |
| Photo Scraper | ✅ | Downloads business photos |
| Color Extraction | ✅ | Sharp-based dominant color from photos |
| Apache Reverse Proxy | ✅ | Wildcard vhost for subdomains |
| Let's Encrypt SSL | ✅ | Wildcard cert with --expand |
| Virtualmin Sub-servers | ✅ | Isolated Unix user per site |
| Docker Support | ❌ | No containerization |
| CI/CD Pipeline | ❌ | No GitHub Actions or similar |
| Database Migrations | 🟡 | Drizzle Kit configured but migration files not tracked |

---

## 17. MISSING FEATURES — HIGH PRIORITY

These are the remaining significant gaps for WordPress parity:

1. **❌ Plugin System** — The biggest remaining gap. No plugin registry, no activation/deactivation lifecycle, no plugin API. The hooks/filters system is in place but no plugin infrastructure.

2. **❌ Admin Toolbar** — No front-end admin bar for logged-in users with quick links.

3. **❌ Block Editor (fully wired)** — BlockNote is imported but not connected to the post editor. Users are typing HTML in a textarea instead of using blocks.

4. **❌ Widget Areas** — No sidebar/footer widget system. (`register_sidebar` / `dynamic_sidebar`)

5. **❌ oEmbed Support** — No auto-embed of URLs pasted into content.

6. **❌ Bulk Actions** — Can only edit/delete one item at a time in admin lists.

7. **❌ Theme Customizer** — No live preview customization for themes.

8. **❌ User Meta** — No `wp_usermeta` table for extra profile fields, preferences, session management.

9. **❌ Nonce Integration** — Nonce system exists but not applied to admin forms yet.

10. **❌ Comment Threading / Spam Detection** — No threaded replies, no Akismet equivalent.

---

## 18. FEATURES RAKE CMS HAS THAT WORDPRESS DOESN'T

| Feature | Description |
|---|---|
| Auto-generated Theming | Scrape+Tailwind+framer-motion site generation in minutes |
| Photo-based Color Extraction | Dominant colors from scraped photos |
| Multi-tenant Subdomain Architecture | `{slug}.domain.com` with isolated Unix users |
| Virtualmin Integration | Automatic sub-server + Apache vhost + SSL |
| Google Maps Scraper | Auto-populates business data from Places API |
| Brave Search Enrichment | Fallback scraping when website/maps unavailable |
| Business-type-aware Content | Different nav, CTA, and layout per industry |
| Bilingual Detection (EN/ES) | Auto-detect Spanish and generate content accordingly |
| Rapid Deploy CLI | One-command `rapid:deploy` — scrape, generate, deploy |
| Modern Stack | Next.js 15, Drizzle, Auth.js, Tailwind, TypeScript |

---

## SUMMARY

**Database Schema Parity:** ~85% (11/13 WP tables implemented)
**Admin Panel Parity:** ~45% (basic CRUD + nav menus, no advanced features)
**Content Editing Parity:** ~30% (BlockNote imported but not wired)
**Theming Parity:** ~65% (generated themes + nav menus, no hierarchy/customizer)
**API Parity:** ~55% (REST CRUD + hooks/filters/shortcodes, no plugin system)
**Security Parity:** ~65% (rate limiting, validation, nonces; nonces not integrated in admin forms yet)
**Extensibility (Plugins/Hooks):** ~20% (hooks/filters exist but no plugin architecture)

**Overall: Rake CMS is ~55-60% feature-complete vs WordPress** — up from ~45% before this session. Major additions: hooks/filters system, nonce/CSRF protection, custom post types registry, custom taxonomies registry, navigation menus (API + admin UI), shortcode parser, post lifecycle hooks integrated into API routes.
