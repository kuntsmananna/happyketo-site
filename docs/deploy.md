# Going live on Vercel

The site is fully static (Astro → `.vercel/output`). Every push to `main` on GitHub deploys automatically
once the project is imported. `npm run build` also runs `scripts/vercel-postbuild.mjs`, which adds the
security headers and the 301 redirects from every old Wix URL (`npm run test:redirects` checks them).

## 1. Import the project (one time, ~2 minutes)

1. Sign in at <https://vercel.com> with GitHub (the account that owns `kuntsmananna/happyketo-site`).
2. **Add New… → Project → Import** `kuntsmananna/happyketo-site`.
   If the repo isn't listed, click **Adjust GitHub App Permissions** and give Vercel access to it.
3. Keep the defaults. Vercel reads `vercel.json`: framework **Astro**, install `npm ci`, build `npm run build`.
   No environment variables are needed (the Web3Forms key is in `src/data/site.ts`).
4. Click **Deploy**. The site appears at `https://happyketo-site-….vercel.app`.

### Check the preview before touching the domain

- Home, `/recipes`, a recipe, `/blog`, `/challenge`, `/contact`, `/favorites` all load on phone and desktop.
- An old link redirects: `/post/פנקייק-קטוגני` → `/recipes/פנקייק-קטוגני`.
- Send one test from each form (newsletter, contact, challenge) and confirm the emails arrive.

## 2. Add the domain in Vercel

Project → **Settings → Domains**:

1. Add `www.happyketoforme.com` (the main address, same as on Wix).
2. Add `happyketoforme.com` and choose **Redirect to www.happyketoforme.com** (permanent).

Vercel then shows the DNS records each name needs. Use **exactly the values Vercel shows**. Typically:

| Name | Type | Value |
| --- | --- | --- |
| `@` (root) | A | `76.76.21.21` |
| `www` | CNAME | `cname.vercel-dns.com` |

## 3. Point the domain (done in Wix: the domain is registered there and stays there)

The domain is registered through Wix (auto-renew on, paid until Oct 2027) and Wix manages its DNS.
Only two records change; everything else stays as it is.

1. Wix → [Domains](https://manage.wix.com/account/domains) → ⋯ next to `happyketoforme.com` → **Manage DNS Records**.
2. **A (Host)**: edit the record with an empty host name → value = the IP Vercel gave (e.g. `76.76.21.21`).
   **Delete any other A records** for the root (Wix currently has three: `185.230.63.107`, `.171`, `.186`).
3. **CNAME (Aliases)**: edit `www` → value = the CNAME Vercel gave (e.g. `cname.vercel-dns.com`).
4. Save. Don't change the NS records or anything else.

Changes usually take effect within an hour (up to 48 h). Vercel shows **Valid Configuration** and issues
the HTTPS certificate automatically.

### Rollback (back to the Wix site)

Same screen, Wix's default values: A (empty host) → `185.230.63.107`, CNAME `www` → `cdn1.wixdns.net`.

## 4. Before switching DNS

- [ ] Export from Wix anything that lives only there: newsletter subscribers and contacts
      (Contacts → Export), challenge participants (Online Programs), form submissions.
- [ ] Decide how program sign-ups (Keto Kickstart, Going Keto) and the Kickstart email sequence continue:
      they run only on Wix (Online Programs + Automations). Inventory and the email texts:
      [wix-emails-and-programs.md](wix-emails-and-programs.md).
- [ ] Preview checked (section 1) and the form emails arrive.
- [ ] Decide when to cancel the Wix Premium plan. Keep it until the new site has run for a few weeks.
      Check in Wix → Billing that the **domain** renewal is separate from the site plan before cancelling.

## 5. After the switch

- [ ] `https://happyketoforme.com` → `https://www.happyketoforme.com`, padlock OK.
- [ ] Old links redirect: `/post/…`, `/about-happy-keto`, `/pastry-recipes`, `/ketochallenge`.
- [ ] Google Search Console: verify the domain (TXT record in Wix DNS), submit
      `https://www.happyketoforme.com/sitemap-index.xml`, and use **Inspect URL** on a few recipes.
- [ ] Update the link in the Instagram bio if it points to an old Wix page.
- [ ] In Vercel, turn on **Web Analytics** for the project (the site already includes the script).
