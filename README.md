> A server that answers one question about itself


1. `git init`
2. `.gitignore`
3. `npm init -y`
4. `npm pkg set type=module`
    - `type: module` is what gives you import instead of require
5. `npm install express dotenv`
    > DOTENV: .env is at the repo root but this file lives in server/. dotenv.config() with no arguments looks in process.cwd(),it works if `server/index.js` is ran from the root and silently loads nothing if you cd server first. ESM has no `__dirname` to anchor it with, which is the thing that surprises people coming from tutorials. Either commit to always running from the root, or resolve the path from import.meta.url via fileURLToPath. Pick one and note it in CLAUDE.md. 

-----