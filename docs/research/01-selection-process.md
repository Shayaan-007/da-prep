# Research 1: how selection really works at degree apprenticeship employers

Status: **interim**. Web research was cut off part-way (session limit), so this covers what was verified before that point and lists what is still to do. Research date: 30 September 2026.

Confidence labels: **High** = read on the employer's or government's own page. **Medium** = employer's own wording seen only in a search result snippet, page not opened. **Low** = third-party site or forum.

## 1. Findings by employer

### Arup (High: official page read in full)
Source: https://www.arup.com/careers/early-careers/apprenticeships/
1. Online application (short form).
2. Online assessments: a personality assessment plus timed numerical and logical reasoning.
3. Shortlisting against minimum requirements and application answers.
4. **Online assessment centre**: a competency-based interview plus a **case study exercise**, with a chance to meet current apprentices.
5. Offer by phone.
- Applications opened February 2026; most apprentices start in September. They "strongly advise" early applications, allow one application per period, and ask candidates **not to use AI writing tools** in applications.

### Deloitte UK (High: official page read in full)
Source: https://www.deloitte.com/uk/en/careers/early-careers/early-careers-assessment.html
- Entry-level apprenticeships combine the online assessment stages into one called **OneStop**.
- The immersive online assessment has a **behavioural** part (rank responses to workplace scenarios, working-style questions) and a **cognitive** part (numerical and verbal reasoning). There is no overall time limit, but some sections are timed.
- The **job simulation** includes ranking, selecting, written responses and **video responses** to workplace scenarios.
- A **skills and motivation interview** of around 50 minutes, in person for entry-level apprentices, followed by a **topic preparation discussion** of 30 to 40 minutes that needs research beforehand.
- Outcomes within four weeks of each stage. Candidates get a **strengths feedback report** after the assessments.
- Adjustments are offered without proof of diagnosis, including extended preparation time for video interviews and the option to hide self-view.
- Preparation: a free "Candidate Zone" with practice assessments. Deloitte says using **external paid assessment websites** breaches its integrity guidelines, and it publishes AI-use guidelines.
- Entry: 5 GCSEs including grade 4 in English and Maths (Medium: from a search snippet).

### Lloyds Banking Group (High for assessment types, official page read)
Source: https://www.lloydsbankinggroup.com/careers/about-applying/assessment.html
- Assessment varies by role. Types named: data interpretation (multiple choice), **situational judgement**, **working-style questionnaires** (rating scales), **video interview responses** ("human-reviewed, no AI scoring"), and role-specific technical challenges (for example coding).
- Then an assessment centre (in person or virtual) or interviews.
- **Time limits, number of questions and test vendors: not stated.**
- Guidance on AI: fine for research and preparing examples, not for copying or use during assessments. Recommends practising STAR-style answers.

### BAE Systems (Medium: official wording from search results; its FAQ page was generic)
1. Short online application. 2. Qualification review. 3. **Online assessment with gamified challenges and an on-demand video interview.** 4. Competency-based interview, virtual or face to face. 5. Conditional offer.
- Not stated: number of video questions, preparation or answer time, test details.

### PwC UK, Flying Start (Medium: official wording from search results; pages returned 403)
- Online assessments measuring cognitive skills, behaviours, natural preferences and reasoning, then an **on-demand video interview** about how you typically approach your work.
- Final stage: a virtual immersive assessment centre (accounting) or an interview with a senior leader (business management).
- **Each stage is usually due within seven days of the invite.** Accounting applies through UCAS.

### Civil Service (High: gov.uk test guidance pages read)
Sources: https://www.gov.uk/guidance/preparing-for-the-civil-service-judgement-test and https://www.gov.uk/guidance/preparing-for-the-civil-service-verbal-and-numerical-tests
- **Judgement test:** three scenarios per behaviour, and **you rate each of four actions** as counterproductive, ineffective, fairly effective or effective. It is **not** "pick the best one". Untimed, about 2 to 4 minutes per scenario. A self-assessment section is 15% of the score.
- **Verbal:** true, false or cannot say. **Numerical:** graphs and tables, multiple choice. **Untimed**, most people take 15 to 45 minutes each, **adaptive** difficulty, and a calculator and rough paper are fine. Free practice tests provided.
- Recruitment uses Success Profiles (behaviours, strengths and more). Some stages use video interviews (Medium: snippet).
- **The Fast Track Apprenticeship guidance we link to was withdrawn on 27 November 2020.** It described an older process (timed 6-minute verbal and numerical tests, 36 and 24 questions) that no longer applies.

### Rolls-Royce (Low/pending: PDFs could not be read as text)
- Its careers site publishes a 2026 **assessment centre preparation guide** and **online assessment tips** PDFs. Search snippets say timed assessments end automatically when time is up, each assessment must be done in one go, and the guide lists the exact interview questions.
- Not yet verified: stages, tests, video format. **The HTML page we link to in the app now returns 404.**

## 2. Patterns across employers
1. **A common spine:** online application, online assessments, often a recorded video interview, an interview or assessment centre (increasingly virtual), then an offer. Our process guide matches this.
2. **The detail varies a lot.** Some tests are untimed or adaptive (Civil Service), some are timed (Arup), some sections are timed and some not (Deloitte). Situational judgement comes in different formats (rating every action, ranking, choosing best).
3. **Formats we don't practise at all:** personality and strengths questionnaires, gamified assessments (BAE), case studies (Arup), group exercises, and topic-preparation discussions (Deloitte).
4. **Video interviews are usually part of the assessment stage**, and sometimes human-reviewed (Lloyds says so explicitly).
5. **Employers are actively setting rules on AI and outside prep help** (Arup, Deloitte, Lloyds).
6. Employers **rarely name their test vendors**. "Which provider" is mostly not publicly stated, so don't claim it.

## 3. Problems this shows in our app (fix list)
| Issue | Where | Fix |
|---|---|---|
| Rolls-Royce link returns 404 | `lib/employers.ts` | Replace with the current careers page; re-verify every link |
| Civil Service Fast Track listed as if live; the page is a withdrawn 2020 guide | `lib/employers.ts` | Replace with the current Civil Service apprenticeships page; say what they actually use |
| SJT practice only offers "pick the single most effective answer" | `lib/questions.ts`, practice page | Add rating-each-action and ranking formats |
| Tests are timed at 60s per question by default | practice page | Offer untimed/adaptive-style practice; explain formats vary by employer |
| No practice for personality, gamified, case study, group exercise | content and practice | At minimum add guidance pages; consider a case study practice |
| Video mode has no preparation time and only one fixed format | interview page | Wait for HireVue and employer detail, then add configurable think and answer time |
| "Stronger answer" and "rewritten opening" could read as AI writing for applications | review and feedback copy | Word it as feedback on your own text; add a note about employer AI rules |
| No "last verified" date on employer facts | everywhere | Add source links and verified dates |

## 4. Still to do
- Read the Rolls-Royce assessment PDFs (need a PDF text extractor, or find an HTML version).
- BAE degree apprenticeship page; a readable source for PwC's video and assessment details.
- Civil Service assessments page (truncated in fetching).
- **HireVue candidate documentation:** think time, answer time, number of questions and retakes, since we model video mode on this.
- Test-vendor official guides (SHL and others) for real time limits and formats.
- Broaden beyond this set to cover banking, tech and engineering: Barclays, HSBC, EY, KPMG, JLR, Airbus, BT, Siemens, NHS and the police.
- Choose the 6 to 8 employer shortlist from the evidence, then build the profile template.
- Verify every link and claim in `lib/employers.ts` and the guide pages.
