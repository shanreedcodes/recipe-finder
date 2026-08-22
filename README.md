# Recipe Finder : Server (Express)

> This client is a 



### app/server split

1. Add `app.js` file which will never touch the network, it is pure app construction
2. Create a `.gitignore` file
3. Create Server Folder: `server/`
4. Create a NodeJS Application in the server folder
    - `npm init -y`: used to set all the answers of the setup questions to default answers
    - A package.json file will be created in the project folder as proof that the project has been initialized
    - `npm pkg set type=module`
        - `type: module` is what gives you `import` instead of `require`
5. Create Server: `server/index.js`
6. Create `requests.http` file at the root of repo
7. Create `.env` and `.env.example` files

-----

## REST Client extension: request.http

- VS Code extension that sends HTTP requests from a plain text file ending in `.http` or `.rest` and shows the response in a side pane
- You write the request in the same format HTTP actually uses on the wire, and click a link above it
- There's no hidden state
    - A Postman collection lives in Postman's storage and drifts from your repo. 
    - A .http file is text in your project, in git, next to the code it tests.
- `@host = ...` at the very top of the file, no blank line before it. This is REST Client's variable syntax, not standard HTTP, it's a preprocessing step the extension does before sending anything.
    - `@host = http://localhost:3000` 
    - this pull the URL into a @host variable, so no inline hardcoded URL

- A blank line after the variable, before the first `###`. 
    - REST Client splits the file into separate requests on `###`, and the variable declaration needs to sit outside any request block.
    - `###` on its own line separates one request from the next
    - A small `Send Request` link appears above each block. Click it, or put your cursor in the block and hit `Ctrl+Alt+R`.
    - The response opens in a split pane showing the status code, response headers, how long it took, and the body pretty-printed
- `{{host}}` replaces the literal `http://localhost:3000` inside the request line. Same double-curly interpolation syntax you'd see in Postman, different tool, same idea.
- Add a trailing newline at the end of the file
    - The last request line will run straight into end-of-file with nothing after it
    - This is the conventional POSIX text-file ending, Not a REST Client requirement, some tools (including editors and diff output) act up without one

> **The blank line between the headers and the body is mandatory and Never put a secret in this file**

#### Request chaining
> Name a request with a `# @name` comment and later requests can read its response


> [VS Code Rest Client Repo](https://github.com/Huachao/vscode-restclient/blob/master/README.md)

---

## `.env` file
- **`PORT=`:** port the server will run on
- **`NODE_ENV=`:** an environment variable that says what mode the app is running in
    - A convention the Node ecosystem agreed on, typically "development", "production", or "test"
    - A huge number of libraries check it and change behavior based on what they find
    - For a Node backend specifically, the use can decide how much error detail the client gets: full stack trace in dev, generic message in prod
    - Alternatively you could use error-handling middleware instead

## Summary
- **Module system decision, ESM import/export pair.** `import express from "express"` only works because `server/package.json` sets `"type": "module"`. This is why I can use `import`, and not `require`, and it's also why relative imports elsewhere in this project need the `.js` extension.
- **Express's request/response handler contract.** `app.get(path, (req, res) => {...})` demonstrates the shape every route in the app will follow: 
    - a method, a path, and a two-argument handler where req describes what came in and res is how you answer it. 
    - `res.status(200).json({...})` shows the chainable style Express's API is built around
- **A server is a process that stays alive because of an open socket.** 
    - `app.listen(3001, callback)` keeps the Node process running instead of exiting immediately after the script finishes, because the TCP listener is holding the event loop open. Everything about Node being "single-threaded but non-blocking" is downstream of that one call.
- **The server check** 
    - `/api/health returning {"ok": true}` is a route that answers "is the process up and routing requests" with zero dependency, because a health check that can fail because its own dependencies failed isn't answering the question it exists to answer
-**requests.http** demonstrates the API's contract being recorded as something you actually run, committed to git, rather tested elsewhere.