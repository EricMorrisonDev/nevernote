
I am planning to make code walkthrough videos for a few of this project's features. I plan to do an individual video showing myself coding each of these:

- POST api for creating new stack and GET api for getting all stacks.
- getCurrentUser() and requireUser()
- requireValidation helper function 

I need a basic front end ui demo component that I can use to visually demonstrate these features working. I have set up the homepage with a login form and logout button.

---

## Todo

- [ ] **Fetch my stacks** — Add a button that calls GET /api/stacks and a place to show the response (401 when logged out, 200 + data when logged in). Use this to demo getCurrentUser/requireUser.
- [ ] **Create stack form** — Add a form (title input + submit) that calls POST /api/stacks. Show 400 + validation details when invalid, 201 + new stack when valid. Use this to demo requireValidation and the POST stack API.
- [ ] **(Optional)** Conditionally show login vs logout + demo sections based on whether the user is logged in, so the flow is easier to follow in the video.