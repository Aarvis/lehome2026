# Production Preprint Site

This folder is an isolated production version copied from `preprint/`. The original draft folder is still separate; the Special Thanks update was also applied there by request.

Title:

**Future-Conditioned Co-Training for Robotic Garment Folding with Limited Teleoperation Data and No Robot Access**

Purpose:

- Lead with the research claim and result ladder.
- Present the project as a no-development-time-robot-access study of heterogeneous robot data interfaces.
- Make the limitations explicit enough for foundation robotics labs, robotics/ML PhD students, and professors to trust the claims.
- Keep the detailed videos, FK/DIK validation, future-latent architecture, and finals evidence available for deeper reading.

## Local Preview

From `E:\LeHome-Challenge`:

```powershell
cd E:\LeHome-Challenge\production-preprint
python -m http.server 8083
```

Open:

```text
http://localhost:8083
```

If port `8083` is busy, use another port:

```powershell
python -m http.server 8084
```

## External Sharing Flow

1. Send the professor/lab one-pager first.
2. Link this production site as the supporting project page.
3. Point readers to the For Busy Readers block, compact result table, finals videos, and next research directions.

## What Changed from the Draft

- Added a For Busy Readers block immediately after the hero.
- Moved the compact result table near the top.
- Reframed the overview around a research question and system flow.
- Replaced the slogan-like future-latent hook with a more testable claim.
- Added novelty, limitation, and foundation-lab relevance boxes.
- Rewrote `Next Research Directions` as a collaboration roadmap rather than an asset checklist.
- Polished obvious wording issues in the production copy.
- Added a fuller Special Thanks section with finals context, Manojkumar Srinivasan, organizer credits, Lightwheel, and organizer profile links.
