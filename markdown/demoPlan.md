
I am planning to make code walkthrough videos for a few of this project's features. I plan to do an individual video showing myself coding each of these:


- getCurrentUser() and requireUser()
- api/auth/me route
- loginStatus component
- POST api for creating new stack and GET api for getting all stacks.
- requireValidation helper function 

I need a basic front end ui demo component that I can use to visually demonstrate these features working. I have set up the homepage with a login form and logout button.

---

## Recommended sequence

Record and present in this order so each video has enough context without expanding scope:

1. **getCurrentUser() and requireUser()** — Auth foundation. Explain: session cookie → lookup user → return user or null; requireUser() returns 401 when there’s no user. No UI yet; show in a route or Network tab.

2. **api/auth/me route** — Expose “who’s logged in” to the client. One route that calls getCurrentUser() and returns the user (or 401). Demo via fetch or Network tab.

3. **LoginStatus component** — Show login state in the UI. One component that fetches /api/me and displays email or “not logged in.” Completes the loop: cookie → getCurrentUser → /api/me → UI.

4. **requireValidation helper** — Reusable validation wrapper. “We use this to validate body and return 400 + details.” One short example (schema + route) so later videos don’t need a long detour.

5. **GET /api/stacks + “Fetch my stacks” UI** — requireUser() in action. 401 when logged out, 200 + stacks when logged in. One button that calls GET and a place to show the result.

6. **POST /api/stacks + Create stack form** — requireUser() + requireValidation(). Show 400 with validation details and 201 with the new stack. One form (title + submit) that calls POST and displays the response.

---

## Todo

- [ ] **Fetch my stacks** — Add a button that calls GET /api/stacks and a place to show the response (401 when logged out, 200 + data when logged in). Use this to demo getCurrentUser/requireUser.
- [ ] **Create stack form** — Add a form (title input + submit) that calls POST /api/stacks. Show 400 + validation details when invalid, 201 + new stack when valid. Use this to demo requireValidation and the POST stack API.
- [ ] **(Optional)** Conditionally show login vs logout + demo sections based on whether the user is logged in, so the flow is easier to follow in the video.