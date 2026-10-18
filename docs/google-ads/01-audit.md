# Trulink Google Ads: Stage 1 Audit

Audit date: 18 Oct 2026. Prepared for: Manjeet (Trulink Networking Solutions).

## 0. Scope and honesty statement

| What was inspected | How | What it can and cannot prove |
| --- | --- | --- |
| This repository (`trulink-india/profile`) | Read all files and branches | It is the GitHub **profile README** only. It holds **no website source code**. The two other branches are unrelated (`gbp-ads-link` tooling, `oc300-port-forwarding` docs). |
| Live public site `https://trulink.in` | Read-only HTTP GET requests from a cloud VM, plus the public GTM container JS | Shows what the server publicly returns. Does **not** show server-side code, the database, or what happens after a form is submitted. |
| Screenshot of the Google Ads "Ads" table | Read visually | Baseline figures only. |
| **Live Google Ads account** | **NOT inspected** | No authorised integration was available. Every Ads-side statement below is a checklist item, not a finding. |

Not done on purpose: no forms were submitted (that would create fake leads and pollute the owner's CRM and any imported conversions), no calls or WhatsApp messages were triggered, and nothing was changed on the live site or in Google Ads.

**Because the website source is not available, Stage 3 (code changes) was not performed.** The tracking and landing-page changes below are specified so a developer with repo access can apply them. Please share the website repository (or the PHP project) if you want those implemented and tested.

## 1. Architecture summary (inferred from public responses)

| Item | Finding | Evidence |
| --- | --- | --- |
| Hosting | Hostinger (hPanel), LiteSpeed, PHP 8.3 | Response headers `server: LiteSpeed`, `platform: hostinger`, `x-powered-by: PHP/8.3.35` |
| Framework | Custom PHP site with clean URLs, no JS framework | Server-rendered HTML; vanilla JS in `/assets/js/*` |
| Key routes (HTTP 200) | `/`, `/services/`, `/services/cctv-installation`, `/services/networking-solutions`, `/services/wifi-solutions`, `/services/fiber-splicing`, `/services/video-door-phone`, `/services/biometric-solutions`, `/contact/`, `/quote/`, `/booking/`, `/inquiry`, `/about-us/`, `/policy/*`, industry pages | All 32 URLs listed in `sitemap.php` returned 200 with no redirect chain |
| `/service` (the display URL in the ads) | **301 to `/service/`, then 403 Forbidden** | See issue C1 |
| Tag management | GTM `GTM-MX6VCL64` loaded on every page, with a `<noscript>` fallback | Page source |
| Analytics | GA4 `G-9K6VFQLQFM`, configured inside GTM | Public `gtm.js` container |
| Forms | `/contact/` (AJAX, JSON success check), `/quote/` (POST), `/booking/` (3-step, POST), `/inquiry` (POST to `inquiry.php`) | Page source and `/assets/js/contact` |
| Click-to-call / WhatsApp | `tel:9625862001` and `wa.me/919625862001` with prefilled text, on every page. Floating WhatsApp button site-wide | Page source |
| robots.txt | Allows all; blocks `/admin/`, `/api/`, `/setup_database.php`; points at `sitemap.php` | `GET /robots.txt` |

## 2. Baseline (from screenshot, unverified against the live account)

Period 1-18 Oct 2026. Campaign "Trulink Networking Solutions - Search - Gurgaon".

| Metric | Reported | Recalculated | Check |
| --- | --- | --- | --- |
| Clicks / Impressions | 50 / 558 | CTR 8.96% | Matches |
| Spend | Rs 1,047.82 | Avg CPC Rs 20.96 | Matches |
| Conversions | 2.00 | Conv. rate 4.00%, Rs 523.91 per conversion | Matches |
| Ad group CCTV | 38 clicks, 443 imp, Rs 799.37, 1 conv | CTR 8.58%, CPC Rs 21.04 | Matches |
| Ad group Office Networking | 11 clicks, 64 imp, Rs 198.79, 1 conv | CTR 17.19%, CPC Rs 18.07 | Matches |
| Ad group Wi-Fi/Mesh/Router | 1 click, 51 imp, Rs 49.65, 0 conv | CTR 1.96% | Matches |
| Budget use | Rs 1,047.82 over 18 days | about Rs 58 per day against a Rs 200 cap | The cap is not binding. Spend is limited by impressions, not budget. **Do not raise the budget.** |

What this sample can and cannot say:

- **Not statistically meaningful.** 2 conversions on 50 clicks cannot rank the ad groups. One conversion in the CCTV group and one in Office Networking are single events. Do not pause or restructure on this data.
- **Not verified as leads.** The 2 conversions have no known source (see C2). The metric "Rs 523.91 per conversion" is a *recorded conversion* cost, not a cost per qualified lead. Cost per qualified lead: **Not enough verified data.**
- **One thing is worth noting without over-reading it:** the Wi-Fi group received 51 impressions but 1 click (1.96% CTR, against 8.58% to 17.19% elsewhere). That hints at weak relevance or ad strength for those queries, or at consumer router queries. Check the search-term report before acting.
- All three ads show **Ad strength "Pending"**, so the ads were probably created or edited very recently. Do not draw conclusions from Ad strength yet.
- 50 clicks produced 2 conversions on a budget of about Rs 58 per day. At this volume, Smart Bidding (Maximize Conversions / Target CPA) has far too little data and is not recommended yet.

## 3. Prioritised issues

Severity key: **Critical** means it may be wasting spend or blocking ad delivery right now. **High** means a policy or measurement risk that should be fixed before scaling. **Medium** and **Low** are hygiene.

| # | Sev | Issue | Evidence | Status |
| --- | --- | --- | --- | --- |
| C1 | Critical | **Ad URL `https://trulink.in/service` returns 403 Forbidden.** It redirects (301) to `/service/` and then returns 403 for every user-agent tried (desktop, mobile, `AdsBot-Google` string, curl) and with `?gclid=` appended. Sibling `/services/` returns 200. No page links to `/service` and it is not in the sitemap. | `curl` output kept in the audit session | **Needs account verification.** The screenshot shows `www.trulink.in/service` as the *display* line. That can be a custom display path rather than the final URL. The ads are "Eligible" and received 50 clicks, which suggests the real final URL works. Open each ad, and check **Final URL** and **Display path**. If the final URL is `/service`, this is a likely "Destination not working" problem under the Destination requirements policy, and clicks may be landing on an error page. My request came from a datacenter IP, so also load it from a phone on mobile data. |
| C2 | Critical | **The 2 recorded conversions cannot be traced to a lead event on the site.** The public GTM container has **no Google Ads conversion tag, no Conversion Linker, no `AW-` ID**. The site pushes **no** `dataLayer` events (no `generate_lead`, `phone_click`, `whatsapp_click`) on form success or on tel/WhatsApp clicks. So the 2 conversions must come from somewhere else: Ads-side call/website-call actions, a GA4 import, a Google tag outside GTM, or a default "Page view/Website visit" action. | Public `gtm.js` parsed: only GA4 config and Enhanced Measurement. Page source: no inline conversion code. | **Needs account verification** in Goals > Conversions (see section 7). Treat the 2 conversions as unverified until the action type, source and counting setting are known. |
| H1 | High | **No privacy policy.** `/privacy` and `/privacy-policy` return 404. The Policy hub (`/policy/`) lists Return & Refund, Terms, Cookie, Visit Charge, Site Safety and Company Tools only. The forms collect name, phone, email and address with **no notice or consent text and no privacy link**. | Page source of `/contact/`, `/quote/`, `/booking/`, `/inquiry`, `/policy/` | Confirmed on the site. Policy mapping is a **potential risk**: Data collection and use. A privacy policy is also needed for enhanced conversions and any remarketing. |
| H2 | High | **GTM collects user-provided data automatically.** The container enables automatic collection of phone, email and address (`__ogt_1p_data_v2`, auto phone/email/address on) and GA4 form interaction events. The cookie banner is cosmetic: `cookie-consent.js` only stores `accepted` in `localStorage`, while GTM loads unconditionally before any choice. There is no Consent Mode. | Public `gtm.js`; `/assets/js/cookie-consent` | Confirmed from public code. Whether data reaches Google depends on Google Ads/GA4 settings (needs account verification). Have counsel confirm obligations under India's DPDP Act. This is not legal advice. |
| H3 | High | **Contradictory "free survey" language against a paid visit.** `/policy/visit-charge` charges **Rs 399 (up to 7 km), Rs 499 (7-10 km), Rs 999 (10-15 km) per visit**, including surveys. But `/services/wifi-solutions` says "Contact TRULINK for a **free consultation**. Our experts will survey your site...". `/quote/` says "Get a **free** quote". The service pages mention the charge only in small footer text ("follow the visit charge policy"). | Page text of the pages named | Confirmed inconsistency. **Potential Misrepresentation risk** (hidden or unclear costs). **Ads must never say "free survey/visit"** (the draft ads obey this). Fix the Wi-Fi page wording and put the visit charge near the CTAs. |
| H4 | High | **Unverified or inconsistent business claims on the site.** `24/7 Support Available` is in the footer of every page and "Available 24/7 for urgent support" is on the Contact page, while the same page lists **Business Hours Mon-Sat 9:00-19:00, Sunday emergency call**. `/about-us/` says "**1500+ Projects**", "98% satisfaction", "7+ years experience" and "certified technicians". This README says **500+** projects and the footer copyright starts at **2023**. | Page text; `README.md` | Confirmed inconsistency. **Potential Misrepresentation risk** if surfaced in ads or if a reviewer lands on these pages. **Owner must confirm** every figure. None of these claims is used in the draft ads. |
| H5 | High | **The Wi-Fi landing page does not match enterprise Wi-Fi intent.** It opens with "What Is WiFi and Why Does It Matter?", has no Gurgaon or office in the title or H1 (`WiFi Solutions - TRULINK Networking & Security`), and has no Omada content. It is the page the "Wi-Fi, Mesh & Router Setup" group most likely uses. | Page source | Confirmed. Lowers relevance and conversion. See `02-recommendations.md` section 5. |
| M1 | Medium | **Booking form saves partial leads before submit.** Step 1 posts name and phone to `/booking/` as `action=draft`, and `pagehide` sends `action=abandon` via beacon. No consent text is shown. | Inline script on `/booking/` | Confirmed. Draft/abandon records are **not leads** and must never fire a conversion. Add a notice. |
| M2 | Medium | **Form success is not hooked to analytics.** `/contact/` checks `result.data.success === true` (good: server-confirmed) but does not push an event. `/booking/` ends with `form.submit()` and a server-rendered response. `/quote/` and `/inquiry` post normally. I did not submit them, so the thank-you behaviour is unverified. | `/assets/js/contact`; inline booking script | Confirmed (no event code). |
| M3 | Medium | **Enhanced Measurement `form_submit` is on.** Auto form events fire on submit attempts, including failed validation and the AJAX contact form, and are unreliable as a conversion signal. | Public `gtm.js` | Confirmed. Do not use it as a conversion. |
| M4 | Medium | **Two sitemaps.** `robots.txt` points to `sitemap.php` (clean). A stale `/sitemap.xml` also exists and lists `/about`, which returns **404**. `/inquiry` is in the sitemap but has **no canonical and no robots meta**. | `GET /sitemap.xml`, `/about`, `/inquiry` | Confirmed. Remove or redirect the stale file. Use `noindex` plus no sitemap entry for utility pages. Check the effect before applying. |
| M5 | Medium | **`tel:9625862001` has no country code.** It works for Indian mobiles but `tel:+919625862001` is the safer form (the JSON-LD already uses +91). | Page source | Confirmed. |
| M6 | Medium | **No street address, opening hours or `geo` in structured data.** The `LocalBusiness` JSON-LD has only city and state. The Google Business Profile exists (map link on the site). The ads cannot use a location asset unless it is linked. | Page source | Missing owner information. |
| L1 | Low | Footer contains a placeholder Play Store link (`...id=your.package.name`). | Homepage source | Confirmed. Remove or fix. |
| L2 | Low | Several industry-menu links use `.php` names (`Healthcare.php`, ...) that redirect to clean URLs. | `curl -L` | Works, but uses a redirect. |
| L3 | Low | Fiber and homepage-service pages have no `Service` JSON-LD. The CCTV, Networking and Wi-Fi pages do. | Page source | Optional. |
| L4 | Low | Core Web Vitals not measured (the PageSpeed API quota was exhausted). HTML sizes are 28-37 KB per service page with 1-2 images. | Download sizes | Run PageSpeed Insights or Search Console CWV manually. |

### What is already good (preserve it)

- `/services/cctv-installation` and `/services/networking-solutions` are well-matched landing pages: specific H1 ("CCTV Installation for Home and Office", "LAN and Structured Cabling"), Gurgaon in the title and meta, `Service` JSON-LD with `areaServed`, canonical, Call and WhatsApp buttons with service-specific prefilled text, a "what this service includes" list, and a link to the visit-charge policy.
- Titles, descriptions and canonicals are unique on the service, contact and quote pages. All sitemap URLs return 200. HTTP to HTTPS and www to non-www redirects work.
- The quote form has a honeypot field and CSRF token. The booking form validates Indian mobile numbers (`[6-9][0-9]{9}`).
- Conversion marking in GA4 already lists `qualify_lead`, `close_convert_lead` and `purchase`. This fits the lead-quality ladder in section 12 of the brief.

## 4. Google Ads policy risk report

Policy links verified reachable on 18 Oct 2026 at `support.google.com/adspolicy/answer/<id>`. Wording changes over time, so re-read before appeals.

"Confirmed" means observed on the public site. "Potential" means a risk that depends on how it is used or on account state.

| Asset or page | Observed issue | Policy reference | Type | Severity | Evidence | Recommended correction | Owner approval needed |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Ad final URL `/service` | 403 on all tried user-agents | [Destination requirements](https://support.google.com/adspolicy/answer/6368661) | **Potential**, needs account check | Critical | HTTP 403 responses | Verify final URL; point to a working page such as `/services/cctv-installation` | Yes (ad edit) |
| `/services/wifi-solutions` | "free consultation... will survey your site" vs paid visit charge | [Misrepresentation](https://support.google.com/adspolicy/answer/6020955) (unclear or hidden cost) | **Confirmed** inconsistency on the site; policy breach is **potential** | High | Page text vs `/policy/visit-charge` | Reword, state the visit charge and what it covers near the CTA | Yes |
| Site footer, `/contact/`, `/about-us/` | "24/7 support", "1500+ projects", "98% satisfaction", "7+ years", "certified technicians" unverified and inconsistent with each other and with the contact page's own business hours | Misrepresentation (unverified claims) | **Potential** | High | Page text, README | Verify or remove. Never reuse in ads without evidence | Yes |
| All forms | No privacy policy or consent notice. Booking saves drafts before submit | [Data collection and use](https://support.google.com/adspolicy/answer/6020956) | **Potential** (becomes **likely** if enhanced conversions or remarketing are enabled) | High | 404 on `/privacy`; form source | Publish a privacy policy covering forms, calls, WhatsApp, cookies and Google tags; link from all forms and the footer | Yes (legal text) |
| GTM container | Auto-collection of phone, email and address is on; tags are not consent-gated | Data collection and use; Google's customer data terms | **Potential** | High | Public `gtm.js` | Disable auto collection unless enhanced conversions are intentionally set up. Add Consent Mode behind a real consent banner | Yes |
| Draft ads (`ads_assets.json`) | Use of "free" would conflict with the visit charge | Misrepresentation | Avoided | n/a | Validator bans `free`, `24/7`, `best`, `certified`, etc. | Keep the ban list | n/a |
| Draft ad C2 (Omada) | Brand term in ad text. Capability and authorisation unverified | [Trademarks](https://support.google.com/adspolicy/answer/6118); Misrepresentation | **Potential** | Medium | No Omada content on the site | Hold until the owner confirms the service and a landing page section exists. Do not imply TP-Link partnership. Use "independent installer" wording only if true | Yes |
| Draft ad group D (firewall) | Vendor names such as FortiGate, Sophos, Cisco are unverified | Misrepresentation; Trademarks | **Potential** | Medium | Not offered on any page | Not drafted | Yes |
| Ad headlines | "!" in headlines, excess capitalisation, repeated phrases | [Editorial](https://support.google.com/adspolicy/answer/6021546) | Checked | Low | `validate_assets.py` | Keep the check in the process | No |
| Tracking approach | Double-firing the same call or lead from several actions | [Abusing the ad network](https://support.google.com/adspolicy/answer/6020954) is **not** implicated. This is a **measurement** issue only | n/a | Medium | See section 7 | De-duplicate conversions | No |
| Call asset (not yet created) | Requires a working number and correct country, call reporting disclosure needs checking | Google Ads call asset requirements | **Needs account verification** | Medium | Phone `+91 96258 62001` found on the site | Verify call reporting availability for India in the account | Yes |
| Lead form asset | Not in use | [Lead form requirements](https://support.google.com/adspolicy/answer/9472930) | Not applicable now | n/a | n/a | If used later, a privacy policy URL is required | Yes |
| Geo and business identity | "Gurgaon" in ads; the site says "Serving Gurgaon, Noida and Delhi NCR". The README says Delhi and Noida too | Misrepresentation (business identity consistency) | **Potential** | Low | Contact page | Keep Gurgaon-only ads and targeting. Expand only with owner approval | Yes |

I found no evidence of a malicious-software, compromised-site, cloaking or doorway-page problem. The site returned normal content and no suspicious redirects. This is not a security scan. Google's own crawler is the final judge.

## 5. Tracking audit

Details of what is on the site today and what each event can legitimately mean.

| Signal | Present now? | Notes |
| --- | --- | --- |
| Google tag / GTM | GTM `GTM-MX6VCL64` on every page | Contains the GA4 config only |
| GA4 | `G-9K6VFQLQFM`, Google Signals enabled, linked to Ads (`__ccd_ga_ads_link`) | If GA4 key events are imported into Ads **and** native Ads actions exist, the same lead can be counted twice |
| Google Ads conversion tag / linker / `AW-` | **None in GTM** | Unknown whether a gtag exists elsewhere. The page source shows none |
| Conversion Linker | **None** | Needed if any Ads conversion tag is added through GTM |
| Phone click event | **None** (a tel link is not captured by Enhanced Measurement) | Add a custom event |
| WhatsApp click event | Partly: Enhanced Measurement outbound `click` events may capture `wa.me` | Unreliable. Add a dedicated event |
| Form success event | **None.** The contact form has a server-confirmed success branch ready to hook | See `02-recommendations.md` section 6 |
| Consent Mode | **None** | The banner is cosmetic |
| Enhanced conversions | Unknown. Auto data collection is on in GTM | Account check |
| Call reporting / forwarding number | Unknown | Account check |
| Offline conversion import | Unknown, and no lead log exists in the repo | Needs the lead log (section 12 of the brief) |
| Cross-domain | Not applicable (single domain) | n/a |

Conclusion: **Tracking is not verified.** Nothing here proves a genuine call or a genuine enquiry has been measured. The site-side code that would measure form leads, calls and WhatsApp does not exist yet.

## 6. Missing information checklist (owner confirmation needed)

1. The **Final URL and display path** of each of the three ads, and any tracking template or URL suffix.
2. Which **conversion actions** exist in Goals > Conversions (name, category, source, primary/secondary, counting, window, attribution).
3. Whether **call assets** and **call reporting** (Google forwarding number) are set up, and the minimum call duration.
4. Current **bidding strategy**, **match types** of existing keywords, **network settings** (Search Partners / Display), and **location option** (Presence or Presence or interest).
5. Google Business Profile status and whether it is linked to the Ads account (the `gbp-ads-link` branch suggests work on this).
6. **Business hours**: is it Mon-Sat 9:00-19:00 with Sunday emergency only, or truly 24/7? Which one applies to *phone answering*?
7. Real project count, years in business, and whether technicians hold any certifications.
8. Whether **TP-Link Omada**, **firewalls** (any brand), **managed switches/VLAN**, **access control** and **CCTV repair/AMC** are genuinely offered, and the minimum job size.
9. Whether Trulink is an **authorised partner** of any brand (assume not, until proven).
10. **Service area:** only Gurgaon/Gurugram, or also Manesar, Sohna, Faridabad, Noida, Delhi? And the travel and visit economics beyond 15 km.
11. Street address and whether it should be shown in the ads.
12. Who answers calls and WhatsApp, and how fast (important before sending more traffic).
13. Whether a CRM or sheet already records enquiries, and whether the owner is allowed to share lead outcomes with Google (lawful basis).
14. Permission and photos: genuine, authorised project photos for the landing pages.
15. What the `/booking/` and `/quote/` thank-you flow does after submit (I did not submit them).
16. Website **source repository access**, so the changes in `02-recommendations.md` can be implemented and tested.

## 7. Account-owner audit checklist (Google Ads UI)

Do these before any change to ads, bids or budget. All are read-only.

1. **Ads > open each ad > Final URL / Display path.** Load the final URL on mobile data. Confirm HTTP 200 (C1).
2. **Goals > Conversions > Summary.** For each action record: name, source (Website / Calls from ads / Clicks on phone number / GA4 import), category, **Primary or Secondary**, **count (One / Every)**, window, attribution model, status. Identify which 2 actions produced the 2 conversions (C2). Use the segment *Conversion action name* on the Ads table.
3. **Check for duplicates:** a native Ads action and a GA4 import both measuring form submits or calls.
4. **Insights and reports > Search terms.** Export the full report for 1-18 Oct. Mark each term relevant, irrelevant or unclear (feeds the negatives list).
5. **Campaign settings:** Locations (Gurgaon only?), **Location options** (Presence vs Presence or interest), Networks (Search Partners and Display expansion should be off unless intentional), Ad schedule, Bid strategy, Devices.
6. **Keywords:** list every keyword with its match type. Look for Broad match without Smart Bidding.
7. **Assets:** call, sitelink, callout, structured snippet, location, image and lead form assets. Check status and any policy flags in the **Policy manager**.
8. **Policy manager:** confirm there are no disapprovals or "limited" statuses.
9. **Measurement > Data manager:** check the linked GA4 property and Business Profile.
10. **Auction insights / impression share:** record Search impression share and lost share (budget) vs lost share (rank). Budget is clearly not the constraint at about Rs 58 per day.
11. **Phone calls:** Campaign > Assets > Call details (duration, start time, area code, status). Review whether the calls were real.
12. **Change history:** confirm when ads and keywords were last edited. "Pending" Ad strength implies recent edits.
13. **Billing and recommendations:** ignore the 85.3% optimisation score as a goal. Never accept auto-apply recommendations for budget, bidding or broad match without review.
14. **GTM (tagmanager.google.com):** open container `GTM-MX6VCL64`. Confirm that the Google tag, Conversion Linker and any Ads tags match section 5. Use Preview mode on a test device.

## 8. Rollback and safety

All Stage 1 work is documentation only. Nothing in Google Ads or on the live site was changed, so no rollback is needed.
