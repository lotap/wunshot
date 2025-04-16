---
title: Authentication Overview
---

The auth modules utilize a combination of JWTs and a `sessions` table to manage user authentication state.

This approach provides a high level of security while minimizing roundtrips to the database.

```mermaid
flowchart
users@{shape: bow-rect}
sessions@{shape: bow-rect}
accessToken@{shape: fr-rect}
refreshToken@{shape: fr-rect}
router@{shape: lean-r}
cookies@{shape: win-pane}
authOps@{shape: st-rect}
db@{shape: cyl, label: "database"}

subgraph client
  cookies
  refreshToken
  accessToken
end

subgraph server
  router
  authOps
end

subgraph database
  sessions
  users
  db
end

router <--> authOps <--> users & sessions & accessToken & refreshToken
router <.-> cookies -.- accessToken & refreshToken
db -.- users & sessions
```

## Fundamentals of Auth

### What is a Session?

### What is an accessToken?

### What is a refreshToken?

### Why use JWTs?

### Why use Cookies?

### Why use a Database?

## Auth Flow In Depth

### Sign Up (Create User)

```mermaid
flowchart LR

signUpForm@{shape: lean-l}
view@{shape: 'curv-trap'}
router@{shape: lean-r}
signUpOp@{shape: st-rect}
cookies@{shape: win-pane}
users@{shape: bow-rect}
sessions@{shape: bow-rect}

subgraph client
  signUpForm
  view
  cookies
end

subgraph server
  router
  signUpOp
end

subgraph database
  users
  sessions
end

signUpForm -.input.-> view --http POST--> router --formData--> signUpOp --responseData--> router

router --accessToken & refreshToken --> cookies
router --filtered responseData--> view

signUpOp <--> users & sessions
```

```mermaid
flowchart

validateInput
hashPassword
insertUser
insertSession
generateRefreshToken
generateAccessToken
returnSuccess

throwError
catchError
returnFailure

subgraph createSessionBreakout [createSession]
  insertSession --> generateRefreshToken
end

subgraph concurrent
  generateAccessToken
  createSession
end

subgraph transaction
  insertUser --> concurrent
end

subgraph returns
  returnSuccess
  returnFailure
end

validateInput -- valid --> hashPassword --> transaction --> returnSuccess

validateInput -. invalid .-x throwError
insertUser -. user already exists .-x throwError

throwError --> catchError --> returnFailure

createSession -.- createSessionBreakout
```

### Sign In

```mermaid
flowchart LR

signInForm@{shape: lean-l}
view@{shape: 'curv-trap'}
router@{shape: lean-r}
signInOp@{shape: st-rect}
cookies@{shape: win-pane}
users@{shape: bow-rect}
sessions@{shape: bow-rect}

subgraph client
  signInForm
  view
  cookies
end

subgraph server
  router
  signInOp
end

subgraph database
  users
  sessions
end

signInForm -.input.-> view --http POST--> router --formData--> signInOp --responseData--> router

router --accessToken & refreshToken --> cookies
router --filtered responseData--> view

signInOp <--> users & sessions
```

```mermaid
flowchart

validateInput
findUser
verifyPassword
insertSession
generateRefreshToken
generateAccessToken
returnSuccess

throwError
catchError
returnFailure

subgraph createSessionBreakout [createSession]
  insertSession --> generateRefreshToken
end

subgraph concurrent
  generateAccessToken
  createSession
end

subgraph transaction
  concurrent
end

subgraph returns
  returnSuccess
  returnFailure
end

validateInput -- valid --> findUser --> verifyPassword --> transaction --> returnSuccess

validateInput -. invalid .-x throwError
findUser -. not found .-x throwError
verifyPassword -. wrong password .-x throwError

throwError --> catchError --> returnFailure

createSession -.- createSessionBreakout
```

### Verify Access

```mermaid
flowchart LR

view@{shape: 'curv-trap'}
router@{shape: lean-r}
verifyAccessOp@{shape: st-rect}
cookies@{shape: win-pane}

subgraph client
  view -.- cookies
end

subgraph server
  router
  verifyAccessOp
end

view --http req--> router --accessToken--> verifyAccessOp --tokenPayload--> router --filtered responseData--> view

cookies -.accessToken.-> router
```

```mermaid
flowchart

decryptAccessToken
returnSuccess

throwError
catchError
returnFailure

subgraph returns
  returnSuccess
  returnFailure
end

decryptAccessToken -- valid --> returnSuccess
decryptAccessToken -. invalid .-x throwError

throwError --> catchError --> returnFailure
```

### Refresh

```mermaid
flowchart LR

view@{shape: 'curv-trap'}
router@{shape: lean-r}
refreshAuthOp@{shape: st-rect}
cookies@{shape: win-pane}
sessions@{shape: bow-rect}

subgraph client
  view -.- cookies
end

subgraph server
  router
  refreshAuthOp
end

subgraph database
  sessions
end

view --http req--> router --refreshToken--> refreshAuthOp --fresh accessToken & refreshToken--> router --filtered responseData--> view

cookies -.refreshToken.-> router -.fresh accessToken & refreshToken.-> cookies

refreshAuthOp <--> sessions
```

```mermaid
flowchart

verifyRefreshToken
findSession
verifyNonce
generateRefreshToken
updateSession
generateAccessToken
returnSuccess

throwError
catchError
returnFailure

subgraph returns
  returnSuccess
  returnFailure
end

subgraph transaction
  direction TB
  updateSession --> generateAccessToken
end

verifyRefreshToken -- valid --> findSession --> verifyNonce --> generateRefreshToken --> transaction --> returnSuccess

verifyRefreshToken -. invalid .-x throwError
findSession -. not found .-x throwError
verifyNonce -. wrong nonce .-x throwError

throwError --> catchError --> returnFailure
```

### Sign Out

```mermaid
flowchart LR

view@{shape: 'curv-trap'}
router@{shape: lean-r}
signOutOp@{shape: st-rect}
cookies@{shape: win-pane}
sessions@{shape: bow-rect}

subgraph client
  view -.- cookies
end

subgraph server
  router
  signOutOp
end

subgraph database
  sessions
end

view --http POST--> router --refreshToken--> signOutOp --success--> router --success res--> view

cookies -.refreshToken.-> router -.delete accessToken & refreshToken.-x cookies

signOutOp <--> sessions
```

```mermaid
flowchart

verifyRefreshToken
findSession
verifyNonce
archiveSession

throwError
catchError
returnFailure

subgraph returns
  returnSuccess
  returnFailure
end

verifyRefreshToken -- valid --> findSession --> verifyNonce --> archiveSession --> returnSuccess

verifyRefreshToken -. invalid .-x throwError
findSession -. not found .-x throwError
verifyNonce -. wrong nonce .-x throwError

throwError --> catchError --> returnFailure
```

### Sign Out All

```mermaid
flowchart

verifyRefreshToken
findSession
verifyNonce
bulkArchiveSessions

throwError
catchError
returnFailure

verifyRefreshToken -- valid --> findSession --> verifyNonce --> bulkArchiveSessions --> returnSuccess

verifyRefreshToken -. invalid .-x throwError
findSession -. not found .-x throwError
verifyNonce -. wrong nonce .-x throwError

throwError --> catchError --> returnFailure

subgraph returns
  returnSuccess
  returnFailure
end
```

---

An encrypted `accessToken` with a short expiry is used for short-term access and a `refreshToken` can be used to extend the period as signed-in.

The `refreshToken` works by checking the values stored in the token against the `sessions` table.
