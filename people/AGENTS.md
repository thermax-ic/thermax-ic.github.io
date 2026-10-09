# Member profile conventions

- Follow `zhe-cheng.html` as the formatting example. The corresponding generator fields in `tools/build_people_pages.py` are `bio`/`bio_zh` (Biography / 个人简介), `education`/`education_zh`, `email` (Contact sidebar), and `links` (Links sidebar); omit a section when its data is unavailable rather than adding placeholders.
- `zhe-cheng.html` itself is hand-maintained (marked `hand_maintained` in the generator) and is never overwritten by regeneration; keep its data in the generator (role, card text) in sync with the hand-edited page.
- Profile photos render in Zhe Cheng's spec: the `person-profile-photo-full` class (5:7 portrait box) on the detail page, with the per-photo `image_position_full` keeping faces and hair inside the frame; people.html cards keep the 1:1 crop with `image_position`. Members without a photo omit `image` and render the gray placeholder (`person-profile-photo-placeholder` / `person-photo-placeholder`); omit `name_zh` when the Chinese name is unconfirmed.
- Maintain matching English and Chinese versions of Education and Training (教育与科研经历).
- Present entries in reverse chronological order, with one paragraph per experience: years, institution, degree or position; advisor and concise relevant distinction when provided.
- Use natural wording and official institution names in each language. Use a single year for an experience that starts and ends in the same year, and “Present” / “至今” for ongoing experience.
- Use only supplied or verified biographical facts. Omit unavailable advisor or distinction information; do not add empty placeholders.
- Follow `zhe-cheng.html` as the formatting example. The corresponding generator fields in `tools/build_people_pages.py` are `education` and `education_zh`, with one string per experience in each language.
