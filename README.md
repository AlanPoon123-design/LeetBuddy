# LeetBuddy

### What it does

LeetBuddy is a Google Chrome Extension that users can open on any [LeetCode problem](https://leetcode.com/problemset/), and unlock various tools, oriented around **interview preparation and coding education**, in order to learn and code more efficiently. The user can chat with a **Generative AI**, where the model will have real-time updates on the problem context and code space, including the description, hints, edge cases and the user’s current code + understanding. LeetBuddy also has a whiteboard feature, allowing the user to draw out their interpretation of the problem, commonly expected during job technical interviews, to further aid their interview preparation. Additionally, the Generative AI will have real-time updates of the whiteboard. The real-time updates of the chat and whiteboard allows LeetBuddy to guide the user with a **personalized teaching experience**. If a user is coding for long periods of time, constantly switching between problems, LeetBuddy saves the historical user context of each individual problem, so learning opportunities are optimally tailored toward helping our individual coders. Through a comprehensive Google Chrome Extension, all these tools are conveniently accessible alongside the user’s LeetCode space.

### Inspiration

LeetBuddy was inspired by the struggles we faced as students in a software background, dedicating countless hours to LeetCode in **preparation for big tech interviews**. We know the frustration of wrestling with tough concepts, missing nuances like edge cases, and feeling lost without tailored guidance. Specifically, we had no proper interview tool that gets us accurate practice in such environment and also a convenient tool to learn efficiently. **That’s why we created LeetBuddy—a seamless, educational Google Chrome Extension that puts all interview-oriented learning tools right at your fingertips**. With real-time AI support, personalized insights, and an interactive whiteboard, LeetBuddy transforms your LeetCode space into a hub for mastering the skills that matter most.

### How we built it

- **React:** Frontend framework for UI
- **Tailwind:** CSS framework
- **Express:** NodeJS backend server framework
- **Multimodal Generative AI (Google Gemini):** Text and image processing
- **Chrome Extension:** Manifest files and Chrome tab usage
- **Page context scraping:** Scraping all visible content on the leetcode question page
- **Redis:** Timed database to automatically delete sessions after an elapsed time for chat history
- **Docker:** Containerized backend deployment
- **Render:** Host the backend live

### Credits

- **Brian Manomaisupat:** Frontend, session management
- **Lucian Cheng:** Frontend, API use, hosting
- **Nicholas Jano:** Backend, API use, redis/docker setup
- **Nathan Chan:** Frontend, input forms
- **Rafay Nasir:** Artwork
