# Trulink Google Ads: Stage 2 Recommendations

Status: **proposals only.** Nothing here has been applied to Google Ads or to the website. Every item marked "Approval" needs the owner's explicit go-ahead. Read `01-audit.md` first.

## 1. Order of work (nothing live changes before step 3)

| Step | Action | Who | Changes live Ads? |
| --- | --- | --- | --- |
| 1 | Run the account checklist in `01-audit.md` section 7 (final URLs, conversion actions, search terms, settings) | Owner | No (read-only) |
| 2 | Answer the missing-information list (`01-audit.md` section 6) | Owner | No |
| 3 | Fix the destination if C1 is confirmed; fix the site claims (H3, H4) and publish a privacy policy (H1) | Owner / developer | Ad edit only if C1 |
| 4 | Implement and test tracking on the website (section 6) | Developer | No |
| 5 | Add new RSAs (section 4) alongside the existing ads. Do **not** delete the existing ads | Owner approval | Yes |
| 6 | Add keywords and negatives in small batches (sections 3 and 7) | Owner approval | Yes |
| 7 | Review after a fixed measurement window (section 10) | Owner | No |

## 2. Campaign and ad-group structure

Keep **one campaign** and **three ad groups** at Rs 200/day (actual spend is about Rs 58/day). More campaigns or groups would split a very small amount of data.

| Ad group | Action | Landing page | Notes |
| --- | --- | --- | --- |
| A. CCTV & Security Systems | Keep. Add RSAs A1 and later A2 | `/services/cctv-installation` | The large majority of current traffic (38 of 50 clicks). Tighten with exact and phrase terms |
| B. Office Networking & Structured Cabling | Keep. Add RSAs B1 and B2 | `/services/networking-solutions` | Highest observed CTR but only 64 impressions. Widen only with relevant exact and phrase terms |
| C. Wi-Fi, Mesh & Router Setup | **Narrow to office and business Wi-Fi**. Add RSAs C1 (C2 on hold) | `/services/wifi-solutions` (after the rewrite in section 5) | Consumer "router setup" queries are a lead-quality risk. Split consumer and business only if search terms show enough of both |
| D. Firewall & Network Deployment | **Do not create yet** | none | No landing page, no verified vendor expertise, budget too small. Revisit after 60+ clicks of evidence in A-C and owner confirmation |
| Omada (inside C) | **Hold** | none | Not verified. Add a few exact keywords to C only after the owner confirms the service and the page mentions it |

Residential vs commercial: the current pages serve both. Do not split campaigns yet. Use ad-group-level ad copy (A1 vs A2, B1 vs B2) to test the audiences first.

## 3. Keywords (initial recommendation)

Search volume, CPC and competition are **unverified**. No figures are invented here. Obtain them from Keyword Planner (Tools > Keyword Planner > Get forecasts, location Gurgaon) and from the real search-term report. "Phase 1" is the initial add. "Test" waits for data or owner confirmation. **Broad match is not recommended** until real conversion tracking, a suitable bidding strategy and owner approval are in place.

Relevance scale (my estimate of commercial fit, not data): High, Medium, Low.

### Ad group A: CCTV (landing `/services/cctv-installation`)

| Keyword | Match | Intent | Relevance | Irrelevant-traffic risk | Phase |
| --- | --- | --- | --- | --- | --- |
| [cctv installation gurgaon] | Exact | Ready to buy | High | Low | 1 |
| "cctv installation gurgaon" | Phrase | Ready to buy | High | Low | 1 |
| [cctv installer gurgaon] | Exact | Ready to buy | High | Low | 1 |
| [cctv camera installation gurgaon] | Exact | Ready to buy | High | Low | 1 |
| "cctv camera installation near me" | Phrase | Local buying intent | High | Medium: the location setting must be Gurgaon-only | 1 |
| "office cctv installation" | Phrase | Commercial | High | Low | 1 |
| "commercial cctv installation gurgaon" | Phrase | Commercial | High | Low | 1 |
| "shop cctv installation gurgaon" | Phrase | Small business | High | Low | 1 |
| "dvr nvr installation service" | Phrase | Service intent | Medium | Medium: includes self-install DIY queries | Test |
| [cctv repair gurgaon] | Exact | Service of existing system | Medium | Medium. **Only after the owner confirms repair is offered** (ad A2) | Test |
| "cctv camera not working" | Phrase | Troubleshooting | Medium | High: many DIY and non-local searchers | Test (A2 only) |
| "cctv camera price" | Phrase | Research, shopping | Low | High: product pricing, not installation | Do not add |

### Ad group B: Office LAN and cabling (landing `/services/networking-solutions`)

| Keyword | Match | Intent | Relevance | Irrelevant-traffic risk | Phase |
| --- | --- | --- | --- | --- | --- |
| [office networking services gurgaon] | Exact | Commercial | High | Low | 1 |
| "office lan cabling gurgaon" | Phrase | Commercial | High | Low | 1 |
| [network cabling contractor gurgaon] | Exact | Commercial project | High | Low | 1 |
| "structured cabling services" | Phrase | Commercial | High | Medium: no location in the term | 1 (location-targeted) |
| "office network installation" | Phrase | Commercial | High | Medium | 1 |
| "commercial lan installation" | Phrase | Commercial | High | Low | 1 |
| "server rack installation gurgaon" | Phrase | Commercial | Medium | Medium: the page covers racks, not servers | Test |
| "network switch installation" | Phrase | Service intent | Medium | Medium: product searches | Test |
| "office it infrastructure setup" | Phrase | Commercial project | Medium | Medium: may want managed IT services | Test, owner confirm |

### Ad group C: Business Wi-Fi (landing `/services/wifi-solutions` after rewrite)

| Keyword | Match | Intent | Relevance | Irrelevant-traffic risk | Phase |
| --- | --- | --- | --- | --- | --- |
| [wifi installation gurgaon] | Exact | Service intent | High | Medium: may include homes | 1 |
| "office wifi installation" | Phrase | Commercial | High | Low | 1 |
| "wifi access point installation" | Phrase | Commercial | High | Low | 1 |
| "wireless network installation" | Phrase | Commercial | Medium | Medium | 1 |
| "enterprise wifi deployment" | Phrase | Large project | Medium | Low. The business may not serve large enterprise (owner confirm) | Test |
| "business wifi troubleshooting" | Phrase | Service of existing system | Medium | Medium | Test |
| "mesh wifi setup" | Phrase | Mostly home | Low | High: consumer, DIY | Do not add until search terms show demand |
| "router setup" / "router login" | any | DIY | Low | Very high | Do not add. Consider as a negative |
| "tp-link omada installation" | Phrase | Brand project | Medium | Low | **Hold** (Omada not verified) |
| "omada access point setup" | Phrase | Brand project / DIY | Medium | High: many DIY | **Hold** |

### Ad group D (deferred): firewall and deployment

Candidates for later only: "firewall installation gurgaon", "network firewall configuration", "managed switch configuration", "vlan configuration service", "office network deployment". Do not use vendor names (FortiGate, Sophos, Cisco) unless the owner proves real expertise and there is a page to match.

## 4. Responsive search ads

File: `docs/google-ads/ads_assets.json` (6 ads, 90 headlines, 24 descriptions). Checked with `python3 docs/google-ads/validate_assets.py`: **0 errors**. Limits: headline 30, description 90, path 15 characters. The script also fails on "free", "24/7", "best", "trusted", "certified", "guarantee", "lowest", "authorised", exclamation marks in headlines, and project-count or year claims.

| Ad | Ad group | Variation | Status |
| --- | --- | --- | --- |
| A1 | CCTV | Installation and quotation intent | Ready after owner approval |
| A2 | CCTV | Existing system and fault check | **Hold:** owner must confirm CCTV repair and fault checking |
| B1 | Office LAN | Office deployment and projects | Ready after owner approval |
| B2 | Office LAN | Small business expansion | Ready after owner approval |
| C1 | Wi-Fi | Business Wi-Fi deployment | Run after the Wi-Fi page rewrite |
| C2 | Wi-Fi | TP-Link Omada | **Hold:** capability, page and no-authorisation wording |

Principles applied: no pinning (pinning reduces how many combinations Google can test); no unsupported claims; the visit charge is stated plainly ("Visit charge applies per our policy"); no fake urgency or discounts; each group has 15 headlines of mixed theme (service, location, action, brand), not one repeated phrase. Brand and "Call or WhatsApp" lines repeat across variations on purpose; that is a low-risk reuse. I make no claim about Ad strength or call volume.

**Assets to prepare (owner approval):**

- **Call asset:** `+91 96258 62001`, with call reporting if available in India and enabled in the account. Show the call-recording or reporting disclosure Google requires. Do not record call content without notice and consent.
- **Sitelinks (4):** Request a Quote (`/quote/`), Book a Technician Visit (`/booking/`), Visit Charge Policy (`/policy/visit-charge`), CCTV Installation or Office LAN (matching group). Keep descriptions factual.
- **Callouts (verified only):** "Site visit before installation", "Call or WhatsApp enquiries", "IP camera and NVR setup", "LAN and rack setup". Do not use "24/7", "certified", "guaranteed".
- **Structured snippet (Services):** CCTV installation, LAN cabling, Wi-Fi access points, Network racks.
- **Location asset:** only after the Business Profile is linked and the owner confirms the address.
- **Images:** genuine, authorised photos only. No stock photos presented as completed work.

## 5. Landing page plan

No website source was available, so these are **specifications**, not edits. Keep URLs and the design system. Changes in priority order:

| Pri | Page | Change | Why (evidence) |
| --- | --- | --- | --- |
| 1 | `/service` | If it is the ad final URL: change the ad to a working page. Do not change the server; `/service/` returning 403 may be intentional (a directory with no index file) | Issue C1 |
| 2 | `/services/wifi-solutions` | Lead with a commercial H1, for example "Office Wi-Fi and Access Point Installation in Gurgaon". Move the "What is WiFi" explainer lower. Add "Gurgaon" to the title and meta. Add "What this service includes", a short list of the work taken up, and the Call, WhatsApp and Quote buttons that the CCTV and LAN pages already have. **Remove "free consultation... will survey your site"** or reconcile it with the visit charge. Keep the Service JSON-LD | H3, H5 |
| 3 | All service pages | Put one plain-language line next to the main CTA: "On-site survey visit charge: Rs 399-999 depending on distance. Quotation follows the survey." Source: `/policy/visit-charge`. Owner confirms wording | H3 |
| 4 | Site-wide | Resolve the 24/7, "1500+ projects", "98%", "7+ years", "certified" claims with real evidence or remove them. Make the business hours consistent | H4 |
| 5 | New `/privacy-policy` | Cover forms, call and WhatsApp enquiries, booking drafts, cookies and Google tags, retention, contact for requests. Link from the footer and from every form | H1 |
| 6 | All forms | Add a one-line notice with a privacy link. On `/booking/`, say the name and phone are saved when the user presses Continue | H1, M1 |
| 7 | Cookie banner | Make it real: block GA4 and Ads tags until the visitor chooses, or implement Google Consent Mode v2 with a consent management tool | H2 |
| 8 | `/services/networking-solutions` | Optional: add a short FAQ (typical survey steps, what is quoted separately, areas served) and genuine project photos | Conversion |
| 9 | Sitemap | Remove stale `/sitemap.xml` (or redirect it to `sitemap.php`). Add `noindex` and a canonical on `/inquiry` and remove it from the sitemap. Check Search Console first | M4 |
| 10 | Links | Use `tel:+919625862001`; remove the Play Store placeholder | M5, L1 |

Do **not** create separate near-identical pages for each keyword. A new page is justified only for a clearly different offer, such as an Omada or a firewall page, and only with genuine content and verified capability.

## 6. Conversion and lead tracking plan

### 6.1 What each event means

| Event | Meaning | Is it a lead? |
| --- | --- | --- |
| Click on `tel:` link | Someone tapped call | No: intent only |
| Call asset click | Someone tapped call in the ad | No: intent only |
| Call connected from a Google forwarding number, duration at or above the threshold | A real conversation likely happened | Probably: still check relevance |
| WhatsApp button click | Opened WhatsApp | No: intent only |
| Form submitted and server confirmed | A submitted enquiry exists | Potentially: spam is possible |
| Lead qualified by the business | Confirmed relevant, in area | **Yes** |
| Job completed and paid | Customer | Yes, plus revenue |

### 6.2 Recommended conversion hierarchy (needs approval; verify against the live account first)

| Action | Source | Count | Primary or Secondary | Reason |
| --- | --- | --- | --- | --- |
| Qualified lead | Offline import (from the lead log with gclid), or GA4 `qualify_lead` | One | **Primary** once about 20+ reliable records exist; until then **Secondary** | The real goal. The GA4 container already marks `qualify_lead` as a key event |
| Form submission, server-confirmed | Site event `generate_lead` | One | **Primary** (interim) | A real submitted enquiry; spam-filtered |
| Call from ad or website number, connected, at or above the threshold (start with 60 s; the owner should set it from what real enquiry calls last) | Google Ads call reporting | One | **Primary** (interim) | Closer to a real conversation than a click |
| Click to call | Site event `phone_click` | One | Secondary | Intent signal, not a conversation |
| WhatsApp click | Site event `whatsapp_click` | One | Secondary | Intent signal |
| Call asset click | Native | One | Secondary | Intent signal |
| Closed sale | Offline import `close_convert_lead` or `purchase` | Every | Secondary now; used for value later | Revenue |

Do not set all of these as equal Primary. Smart Bidding would then optimise toward the cheapest click-like action. Use "One" counting for lead-type actions. Do not import GA4 events **and** keep a native action that measures the same thing as Primary. Check the Primary actions for double counting.

### 6.3 Site events to implement (developer; not applied)

Spec only. Everything goes through `window.dataLayer` into the existing container `GTM-MX6VCL64`. No personal data in any event parameter or URL.

```js
// Click tracking (delegated, one listener)
document.addEventListener('click', function (e) {
  var a = e.target.closest('a[href^="tel:"], a[href*="wa.me/"]');
  if (!a) return;
  var isTel = a.href.indexOf('tel:') === 0;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: isTel ? 'phone_click' : 'whatsapp_click',
    page_path: location.pathname,
    link_location: a.closest('header') ? 'header' : a.closest('footer') ? 'footer' : a.classList.contains('whatsapp-button') ? 'floating' : 'content'
  });
});

// Form success: call ONLY after the server confirms success.
// /contact/: inside the existing `saved` branch of /assets/js/contact.
// /quote/, /booking/, /inquiry: render this on the server-side success view.
function trackLeadOnce(leadId, service) {
  var key = 'lead_tracked_' + leadId;
  if (sessionStorage.getItem(key)) return;
  sessionStorage.setItem(key, '1');
  window.dataLayer.push({ event: 'generate_lead', lead_source: 'form', service: service || 'unspecified', lead_id: leadId });
}
```

Notes:

- `leadId` should be a random identifier from the server (not the phone number or the name), so a refresh or a repeated callback does not count twice.
- Never fire on validation failure, on `/booking/` `draft` or `abandon` posts, or on the Enhanced Measurement `form_submit` event.
- Turn off the automatic collection of phone, email and address in GTM unless enhanced conversions are deliberately set up, with a privacy policy and consent in place.
- In GTM: GA4 event tags for `phone_click`, `whatsapp_click` and `generate_lead` (secondary and primary as above); a **Conversion Linker** tag; Google Ads conversion tags only for the actions that are native Ads actions. Test with GTM Preview and GA4 DebugView before publishing the container.
- Capture the `gclid` in a hidden field, stored with the lead, to allow offline import later. Disclose it in the privacy policy.
- Call reporting: use a Google forwarding number only if available and approved for India. Keep the business number on the site if the owner prefers; the call asset can use a forwarding number while the site shows the real one. Record the disclosure.
- Prevent double counting: if a click on the phone number on the site is also tracked as a native Ads "Clicks on phone number" action, keep only one of them as Primary.
- Spam: keep the honeypot on `/quote/`; add the same server-side honeypot and rate limit to `/contact/`, `/booking/` and `/inquiry`. Add Turnstile or reCAPTCHA only if spam appears.

**Do not call tracking "working" until:** GTM Preview shows each tag firing once; GA4 DebugView shows the events; Ads Goals shows the action status as "Recording conversions"; and a test phone call to the forwarding number is visible in call reports.

## 7. Negative keywords

There is no search-term data yet, so **no term below is confirmed irrelevant**. Apply nothing until the Search terms report (1-18 Oct and onward) has been reviewed. Add negatives in small batches. Never add `cheap`, `price`, `cost`, `review`, `repair`, `near me` or `free` as blanket negatives; they often accompany real purchase intent.

### Tier 1: low-risk candidates (propose first, account or campaign level, phrase match)

| Term | Intent excluded | Rationale | Risk of blocking good traffic |
| --- | --- | --- | --- |
| jobs, job, career, careers, vacancy, hiring, salary, internship | Job seekers | Trulink sells services, not jobs | Very low |
| course, training, institute, certification, exam, syllabus | Education | No training offered | Low |
| pdf, tutorial, meaning, definition | Information | No purchase intent | Low |
| diy, "how to" | Self-help | Low intent for an installation business | Medium: "how to fix wifi" may become a call. Review first |

### Tier 2: only if the search-term report shows them

| Term or theme | Why it may be irrelevant | Risk |
| --- | --- | --- |
| download, software, driver, firmware, app, apk | Software searches | Low |
| login, password, router login, reset | Consumer router help | Medium |
| second hand, olx, used | Not an installation lead | Low |
| Other-city names (for example mumbai, bangalore) | Outside the area | Low. Prefer correct location targeting first |
| Competitor names | Brand searches | Do not block by default. Review manually |
| "buy ..." for products | The shop sells products, so these may be valid for a shop. Decide whether this campaign is for installation only | Business decision |

For each negative added, log: term, match type, scope (account / campaign / ad group), evidence (search-term row and date), and the date, so a mistake can be reversed.

## 8. Location, schedule and budget

- **Budget:** keep Rs 200/day. Spend is about Rs 58/day, so the budget is not limiting delivery. Raising it would change nothing. The constraint is impressions and relevance. **No budget change recommended.**
- **Location:** Gurgaon/Gurugram only for now. Verify the setting is **Presence** (people in the location) rather than **Presence or interest**, which can show ads to people elsewhere who are only "interested" in Gurgaon. Expansion (Manesar, Sohna, Faridabad, Noida, Delhi) only with owner confirmation of service and travel economics and after Gurgaon performance is understood. The Visit Charge Policy tops out at 15 km, so expansion beyond that has a cost implication.
- **Network:** turn off Search Partners and Display expansion unless there is evidence they produce qualified leads (check in the account).
- **Schedule:** do not restrict yet. Review hour-of-day and day-of-week once at least 30 days of call and lead data exist, and compare with who is available to answer the phone. If the team cannot answer at night, consider scheduling or bid adjustments then, based on connected-call data.
- **Devices:** review mobile against desktop after the call tracking works. Do not adjust before then.

## 9. Bidding

| Option | Prerequisite | Verdict now |
| --- | --- | --- |
| Keep the current strategy (check what it is first) | None | **Recommended** until tracking is verified |
| Maximize Conversions | Reliable primary conversion data. A rule of thumb is a few dozen conversions in 30 days. Verify current Google guidance | **Not yet.** 2 unverified conversions in 18 days is far too little |
| Target CPA | The same, plus a stable history | Not yet |
| Manual CPC with a cap | Tolerable for small data. The current average is Rs 20.96 | An option only if the account currently uses automated bidding that wastes spend; check first |
| Broad match | Smart Bidding, good tracking, owner approval | **No** |

Do not change strategy because of the 85.3% optimisation score or after one or two conversions. When a change is made, plan for a 1-2 week learning period and do not edit anything else at the same time.

## 10. Measurement and testing plan

| Window | Goal | Decision rule |
| --- | --- | --- |
| Days 0-7 | Audit only. Fix the destination and tracking. No bid, budget or keyword changes | None |
| Days 8-28 | Add new RSAs and Tier 1 keywords in small steps. Review search terms every week. Log every lead in the lead log | Add negatives only on evidence (at least 2 clear irrelevant searches or a clear pattern) |
| Day 29-56 | Compare A1 vs A2 and B1 vs B2 on **qualified leads and cost per qualified lead**, not CTR. Allow for call-back delays and for lead qualification to take a few days | Do not pick a winner on fewer than about 100 clicks per variation, or without a clear gap. Otherwise keep testing |
| Day 57+ | Decide about the ad group D, Omada, Smart Bidding and expansion | Only with at least 20 reliable qualified leads and owner approval |

Change one lever at a time. Record each change in a change log with the date and the reason.

## 11. Lead-quality system

Classification (as in the brief):

- **A. Qualified:** a real person or business, a service Trulink offers, in the service area, with a genuine requirement.
- **B. Potentially qualified:** relevant, but location, scope, budget or timing needs clarification.
- **C. Unqualified:** spam, solicitation, wrong number, job enquiry, an unsupported service, or out of area.
- **D. Converted:** a qualified lead that became a confirmed paid job.

Template: `lead-log-template.csv` (columns: lead ID, date, time, source, campaign, ad group, channel, service, area, qualification, estimated value (voluntary), follow-up status, outcome, gclid reference). Keep it in access-controlled storage (not a public repo). Do not store anything beyond what is needed. Delete or anonymise data after the agreed retention period. Do not upload personal data to Google without lawful basis and disclosure. If imports are used, use hashed identifiers or gclid per Google's current method.

A WhatsApp conversation or call counts as qualified only after someone has checked it against the A-D definitions, and it gets a lead ID in the log.

## 12. Reporting

Template: `reporting-template.csv`. Each row has a **Source** column: `Google Ads` (reported by Google), `CRM` (confirmed by the business) or `Calculated`. Formulas:

- CTR = Clicks / Impressions x 100
- Conversion rate = Recorded conversions / Clicks x 100
- Cost per conversion = Spend / Recorded conversions
- Cost per qualified lead = Spend / Qualified leads

If there are no verified qualified leads, report **"Not enough verified data"**. Do not substitute the Google-reported Rs 523.91.

## 13. Expected owner approvals (summary)

| # | Approval requested | Default if no answer |
| --- | --- | --- |
| 1 | Replace the final URL of any ad whose URL returns 403 | No change |
| 2 | Add RSAs A1, B1, B2 (and C1 after the page rewrite) | Not added |
| 3 | Add the Phase 1 keywords and Tier 1 negatives | Not added |
| 4 | Create or change conversion actions as in 6.2 | Not changed |
| 5 | Add the call, sitelink and callout assets | Not added |
| 6 | Turn off Search Partners and Display (if on) and confirm the location option | Not changed |
| 7 | Publish a privacy policy and consent notices | Not published |
| 8 | Enable ad A2 (repair) and C2 (Omada) after the owner confirms the services | On hold |

Budget, bidding strategy, broad match and geographic expansion are **not** requested and stay unchanged.
