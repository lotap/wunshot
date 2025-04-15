---
title: Hybrid Approach Notes
---

- A cookie is issued for every user, authenticated or not
  - this way, unauthenticated users' actions can be tracked
  - use a uuid generated on the server, so database doesn't need to be queried
- Database is used for signing in
  - associate the existing session (that was generated on the server) to the user, and immediately invalidate it
    - how & why? add row to invalidated unauthenticated sessions table
    - I want to look up all actions for a user, assuming there is a log somewhere that doesn't know that association
    - Ex: search log for lotap - I need to run an intermediary query to get all session ids associated with lotap
    - should I go through the logs and retroactively update them - no
    - should I include the user id in the logs when i have it? - maybe, probably not - I'm already going to need to query the db so
      - opens a vulnerability if logs are leaked
      - makes analyzing more efficient
    - Where should I store the ip address?
      - in cookie, in db, in log
      - cookie isn't trackable, is hackable, but can avoid unnecessary db queries
      - db has tracking, but requires a query
      - log is trackable, but requires a query

Login flow

1. Unauth user gets cookie with server generated session id
2. User navigates to signin

   - auth cookie is checked
   - does the ip/ua match?
   - origin matches?
   - isAuthorized?
     - current time is less than revalidateAt (fresh)?
     - redirect to signed in page
   - stay on page

3. User posts to login endpoint with username and password
4. PW matches hashed one?
   - else log failure
5. Create a new session on the database
6. Associate the old session with the user - add row to invalidated unauthenticated sessions table?
7. Issue new cookie with new session id - and ip? - and user agent?
8. User visits protected page
9. Check if session is valid
   - Cookie is less than 15 minutes old?
     - ip and ua match values on cookie?
       - TRUST, GO TO PAGE
     - ip and ua don't match?
       - REJECT, GO TO LOGIN
   - Cookie is more than 15 minutes old?
     - ip/ua matches stored(?) value?
     - session exists in db/has an associated user?
       - get relevant user data
       - create new auth cookie
       - TRUST, GO TO PAGE
10. Render

- create a new session on the database
- Information gathered at sign-in is stored in the cookie (unless it's sensitive or needs to be synchronized across devices) - including session id
  - sensitive info should not be stored there, because a cookie can be stolen and the encryption can be cracked
- Cookie is valid and considered "authorized" for 15 minutes
- After 15 minutes, the session is revalidated against the database
- If the session is invalid, the cookie is deleted

use cookie as a cache

- requires token rotation to be secure

ip in cookie
ua maybe in cookie... hard to think of scenarios where an attacker would have the ip but not the ua
