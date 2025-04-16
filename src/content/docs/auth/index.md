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

router <--> authOps <--> users & sessions & accessToken & refreshToken
router .-> cookies -.- accessToken & refreshToken
db -.- users & sessions
```

## Auth Flow In Depth

### Sign Up (Create User)

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
