# Product

## Register

brand

## Users

Hiring managers, recruiters, and analyst-team leads screening candidates for data analyst, revenue cycle analyst, business analyst, and operations roles. They arrive from a job application, a LinkedIn profile, or a resume link, usually with a stack of other candidates open in adjacent tabs. They are skimming, not reading, and a meaningful share of them are doing it on a phone between meetings. The window is roughly ninety seconds.

The job they are trying to get done is a single binary decision: advance this candidate, or move on. They are not looking to be impressed by a website. They are looking for evidence that the person can do analytical work, and for a reason to believe the resume rather than discount it.

A second, smaller audience arrives sideways: people who reached huy.gg through one of the self-hosted services running on the same domain. They already know something technical is going on and want to understand what.

## Product Purpose

The site makes one argument, that Harry Nguyen does analytical and systems work at a level the resume alone cannot demonstrate, and it backs that argument with artifacts rather than adjectives. The projects page carries real systems that are deployed and running. The dashboard page is a working interface, not a screenshot of one. The site itself runs on infrastructure described inside it.

Success looks like a recruiter reaching the contact information having already decided to reach out, rather than reaching it while still deciding. Failure looks like a visitor who cannot tell within the first screen what kind of work this person does.

## Brand Personality

Warm, human, and approachable. The voice is first person, plain, and specific. It explains the reasoning behind a decision instead of listing the technologies involved, and it never inflates. Where a number exists, the number does the talking; where one does not, the writing says so plainly rather than reaching for an adjective.

Warmth is carried by the light ground, the writing, and real artifacts, not by decoration. The light theme at `#F4F1EA` is the ground a visitor lands on, and the dark theme sits behind the toggle. The burnt orange at `#C04000` stays as the committed accent in both themes.

The light theme is the primary surface and has to be designed as one. Its current tokens were derived by removing contrast from the dark theme rather than by composing a palette against a light ground, which is why its warmest gestures read as absent rather than restrained. Light is the canonical theme, and dark is the variant that follows from it.

The emotional target is confidence without performance. A visitor should come away thinking the person behind this is competent and easy to work with, in that order.

## Anti-references

**Generic developer-portfolio dark mode.** Terminal green on near-black, monospace applied to everything, an animated starfield, a hero that opens with a greeting and a wave. This is the specific thing the redesign moved away from, and reverting toward it would undo that work.

**SaaS landing page.** A hero metric in oversized type with a gradient accent, an identical three-card feature grid, a tiny uppercase tracked eyebrow floating above every section, numbered section markers used as scaffolding. Several of these are banned outright by the design system this project follows.

**Agency showcase.** Enormous display type as the entire idea, scroll hijacking, motion that exists to prove motion is possible, and work presented as imagery with no evidence attached to it.

## Design Principles

**Evidence over adjectives.** Every claim on the site pairs with something a reader can check: a number, a running system, a screenshot of real output, a link. A sentence that cannot be backed gets cut rather than softened.

**Durability over currency.** Copy is written so it does not go stale when the underlying systems change. Floors survive ("over 2,300 automated tests"); exact counts and version stamps rot. Anything that ticks upward on its own is a maintenance debt and gets written as a floor or removed.

**A person, not a portfolio template.** The warmth has to come from voice and from specificity, because those are the things a template cannot supply. Where the site sounds interchangeable with any other analyst portfolio, it has failed regardless of how it looks.

**Skimmable in ninety seconds.** The reader is triaging. The first screen establishes what kind of work this is, the scan path through headings and numbers carries the argument alone, and the prose rewards anyone who slows down without punishing anyone who does not.

**Practice what you claim.** The site is hosted on the infrastructure it documents, the dashboard is a working interface rather than a picture of one, and the projects described are deployed and reachable. The proof and the claim are the same object.

## Accessibility & Inclusion

WCAG 2.1 AA is the target and the bar that critique and audit measure against.

- Body text holds at least 4.5:1 against its background, large text at least 3:1, and placeholder text is held to the body ratio rather than the muted-gray default. The light-default inversion makes this easier on the primary path but requires re-verification of every muted token, since the muted ramp was tuned against the dark ground.
- Every interactive element is reachable and operable by keyboard, with a visible focus state that is designed rather than inherited from the browser default.
- `prefers-reduced-motion` is honored across the site. The current implementation is a blanket duration override, which satisfies the letter of the requirement; designed still or crossfade alternatives are the eventual target.
- Color is never the only carrier of meaning, which matters for the dashboard and chart surfaces in particular.
- Content is legible and operable at 320px width and at 200% zoom without horizontal scrolling.
