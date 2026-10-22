# Node.js server for Azure MySQL

A small Express server that reads country data from the MySQL `world` sample database hosted on Azure.

```text
Your browser  ──>  Node server on your computer  ──>  MySQL database on Azure
                   server.js, port 4000               the world database
```

Work through the setup steps in order. Each one ends with a **Done when** check. If what you see doesn't match the check, fix that step before moving on, or look up the error in [Troubleshooting](#troubleshooting).

## Contents

- [Before you start](#before-you-start)
- [Setup](#setup)
- [What's in this project](#whats-in-this-project)
- [Understanding .env and .env.example](#understanding-env-and-envexample)
- [Endpoints](#endpoints)
- [Troubleshooting](#troubleshooting)
- [Deploying to Azure App Service](#deploying-to-azure-app-service)

## Before you start

You need:

- **Node.js 22 or later.** Run `node -v` in a terminal. It should print `v22` or a higher number.
- **Git.** Run `git --version`. Any version works.
- **A GitHub account**, signed in on github.com.
- **[VS Code](https://code.visualstudio.com/).** The steps use its Explorer and built-in terminal.
- **An Azure Database for MySQL Flexible Server.** Have its server name, admin username and password ready. The server name looks like `my-server.mysql.database.azure.com`.
- **[MySQL Workbench](https://dev.mysql.com/downloads/workbench/)**, to load the sample data into your database.

## Setup

### Step 1: Fork and clone the project

A fork is your own copy of this project on GitHub. You push your work to your fork, and the original stays as it is for everyone else.

1. Open https://github.com/Mission-Ready/node_server_for_azure_mysql and click **Fork** at the top right, then **Create fork**.
2. On your fork's page, click the green **Code** button and copy the HTTPS address. It looks like `https://github.com/<your-username>/node_server_for_azure_mysql.git`.
3. In a terminal, run `git clone` followed by the address you copied:

   ```bash
   git clone https://github.com/<your-username>/node_server_for_azure_mysql.git
   ```

Open the new `node_server_for_azure_mysql` folder in VS Code with **File > Open Folder...**. Then open a terminal inside VS Code with **Terminal > New Terminal**. Run every command from here on in that terminal. It starts in the project folder, so the commands find the right files.

**Done when** the VS Code Explorer shows `server.js`, `world.sql` and `.env.example`, and running `git remote -v` in the VS Code terminal shows your GitHub username in the address.

### Step 2: Install the packages

```bash
npm install
```

This downloads the packages listed in `package.json` into a new `node_modules` folder. Lines about `vulnerabilities` or `funding` are normal. Only a line starting with `npm error` means something failed.

**Done when** the command finishes with `added ... packages` and a `node_modules` folder appears in the Explorer.

### Step 3: Let your computer through the Azure firewall

Azure blocks every connection to your MySQL server until you allow it.

1. In the Azure portal, open your MySQL server and go to **Settings > Networking**.
2. Under **Firewall rules**, click **+ Add current client IP address**.
3. Click **Save** and wait for Azure to finish applying the change.

Your IP address changes when you switch networks, for example from home to campus Wi-Fi. Repeat this step each time you do.

**Done when** a rule with your IP address appears in the **Firewall rules** list.

### Step 4: Load the sample data

`world.sql` creates a database called `world` and fills it with countries, cities and languages. You run it once, using MySQL Workbench:

1. Open MySQL Workbench and click the **+** next to **MySQL Connections**.
2. Fill in:
   - **Connection Name:** anything you like, for example `Azure world`
   - **Hostname:** your full server name, for example `my-server.mysql.database.azure.com`
   - **Port:** `3306`
   - **Username:** your admin username
3. Click **Test Connection** and enter your password. If Workbench warns about an incompatible server version, click **Continue Anyway**. Click **OK** to save the connection, then double-click it to open it.
4. Go to **File > Open SQL Script...** and choose `world.sql` from the project folder.
5. Click the plain lightning bolt icon above the script to run all of it. This takes a few seconds.
6. In the **Schemas** panel on the left, click the refresh icon.

**Done when** the **Schemas** panel shows a `world` database containing `city`, `country` and `countrylanguage` tables.

### Step 5: Create your .env file

The server reads its settings, such as your database password, from a file called `.env`. The project comes with a template called `.env.example`. Make your own copy of it:

- **In VS Code:** right-click `.env.example` in the Explorer and choose **Copy**. Right-click an empty part of the Explorer and choose **Paste**. Rename the copy to `.env`.
- **Or in the terminal:** run `cp .env.example .env` on macOS, Linux or Git Bash, or `Copy-Item .env.example .env` in Windows PowerShell.

Open `.env` and replace each `<placeholder>`, including the `<` and `>`, with your own value:

| Setting | What to put |
| --- | --- |
| `MYSQL_HOST` | Replace only `<your-server-name>` and keep `.mysql.database.azure.com`. For a server called `my-server`, the line becomes `MYSQL_HOST=my-server.mysql.database.azure.com` |
| `MYSQL_USER` | Your admin username |
| `MYSQL_PASSWORD` | Your admin password |
| `MYSQL_DATABASE` | Leave as `world`, the database you created in step 4 |
| `PORT` | Leave as `4000`, the port your Node server listens on |

Save the file. Your values go in `.env` and nowhere else. Keep `.env.example` as the blank template. The server never reads it, and anything typed into it goes to GitHub the next time you commit and push. [Understanding .env and .env.example](#understanding-env-and-envexample) explains why the project has two files.

The MySQL port is optional and defaults to `3306`, the port Azure uses. You can leave it out of `.env`.

**Done when** the Explorer shows `.env` in grey text, which means Git is ignoring it, and the file has no `<` or `>` left in it.

### Step 6: Start the server

```bash
npm run dev
```

**Done when** the terminal shows both of these lines, and http://localhost:4000/oceania in your browser shows a list of countries starting with Australia:

```text
Server is live at http://localhost:4000
✅ Connected to MySQL database "world"
```

If you see a ❌ line instead, look it up in [Troubleshooting](#troubleshooting).

While the server runs, it restarts by itself each time you save a `.js` file. After you change `.env`, restart it yourself: press **Ctrl+C**, then run `npm run dev` again.

To stop the server, click in the terminal and press **Ctrl+C**. On Windows it may ask `Terminate batch job (Y/N)?`. Type `Y` and press Enter.

## What's in this project

| File | What it is |
| --- | --- |
| `server.js` | The server. It connects to MySQL and defines the endpoints. |
| `world.sql` | The sample data. You run it once in step 4. |
| `.env.example` | The settings template. You copy it in step 5. |
| `.env` | Your copy, with your real settings. You create it in step 5. Git ignores it. |
| `DigiCertGlobalRootCA.crt.pem` | The certificate the server uses to make an encrypted SSL connection to Azure. It's already set up, so there's nothing to download or change. |
| `package.json` | The project's npm packages and scripts. `npm run dev` comes from here. |
| `node_modules` | The downloaded packages. `npm install` creates it. Git ignores it. |

The npm packages:

- `express` builds the server and its endpoints.
- `mysql2` connects to MySQL and runs queries.
- `dotenv` loads the settings from `.env` into `process.env`, where `server.js` reads them.
- `cors` lets a frontend running at a different address call this server.
- `nodemon` restarts the server when you save a file. `npm run dev` uses it. It's only for development, so Azure doesn't need it.

## Understanding .env and .env.example

The server needs your database password. Written into the code, that password would go to GitHub with your next push, where anyone could read it. So the settings live in their own file, `.env`, which is listed in `.gitignore`. Git never commits or pushes it.

That leaves a gap. When you clone the project there's no `.env`, so how do you know what to put in it? `.env.example` fills the gap. Git does commit it, so everyone gets a copy, and it lists every setting the server needs with a `<placeholder>` where the real value goes.

| | `.env.example` | `.env` |
| --- | --- | --- |
| Where it comes from | Comes with the project | You make it by copying `.env.example` |
| What it holds | Placeholders | Your real values |
| Goes to GitHub | Yes, anyone can read it | No, Git ignores it |
| Read by the server | No | Yes |

When you add a new setting to the code, add it to `.env.example` too, with a placeholder, so the next person knows to fill it in.

## Endpoints

Every endpoint answers a GET request, so you can open it in your browser while the server runs. Country and continent names aren't case-sensitive. If you changed `PORT`, use your number instead of `4000`.

| Endpoint | Returns | Try it |
| --- | --- | --- |
| `/` | Every country | http://localhost:4000/ |
| `/oceania` | Top 10 Oceania countries by life expectancy | http://localhost:4000/oceania |
| `/country/:countryname` | One country, by name | http://localhost:4000/country/new%20zealand |
| `/population/:continent` | Total population of one continent | http://localhost:4000/population/asia |

### GET /

Every country in the database, 239 in total.

```json
[
  {
    "Code": "ABW",
    "Name": "Aruba",
    "Continent": "North America",
    "Region": "Caribbean",
    "IndepYear": null,
    "Population": 103000,
    "LifeExpectancy": 78.4,
    "LocalName": "Aruba",
    "HeadOfState": "Beatrix",
    "Code2": "AW"
  },
  ...
]
```

### GET /oceania

The 10 countries in Oceania with the highest life expectancy, highest first.

```json
[
  {
    "Name": "Australia",
    "LifeExpectancy": 79.8
  },
  ...
]
```

### GET /country/:countryname

One country, looked up by name. Replace `:countryname` with the name, for example `/country/new zealand`. Your browser turns the space into `%20` for you.

```json
[
  {
    "Code": "NZL",
    "Name": "New Zealand",
    "Continent": "Oceania",
    "Region": "Australia and New Zealand",
    "IndepYear": 1907,
    "Population": 3862000,
    "LifeExpectancy": 77.8,
    "LocalName": "New Zealand/Aotearoa",
    "HeadOfState": "Elisabeth II",
    "Code2": "NZ"
  }
]
```

If no country has that name, you get status `404` and:

```json
{ "error": "No country named \"atlantis\"" }
```

### GET /population/:continent

The total population of one continent. The continents are Africa, Antarctica, Asia, Europe, North America, Oceania and South America.

```json
{
  "Continent": "Asia",
  "TotalPopulation": 3705025700
}
```

If the continent doesn't exist, you get status `404` and:

```json
{ "error": "No continent named \"atlantis\"" }
```

## Troubleshooting

When the server starts, it checks your settings and the database connection, and prints a ❌ line if something's wrong. Find what you see in the first column. After each fix, press **Ctrl+C** and run `npm run dev` again so the server checks everything afresh.

| What you see | What it means | How to fix it |
| --- | --- | --- |
| `'npm' is not recognized` or `command not found: npm` | Node.js isn't installed, or your terminal was opened before you installed it. | Install Node.js 22 or later, then close and reopen VS Code. |
| `'nodemon' is not recognized` or `nodemon: command not found` | The packages aren't installed. | Do [step 2](#step-2-install-the-packages). |
| `❌ Missing or placeholder values for: ...` | The server can't find `.env`, or it still has `<your-...>` placeholders. | Redo [step 5](#step-5-create-your-env-file). The file must be named exactly `.env` and sit next to `server.js`. |
| `ETIMEDOUT` | Azure's firewall is blocking your IP address. | Redo [step 3](#step-3-let-your-computer-through-the-azure-firewall). You need to again whenever you change network. |
| `ENOTFOUND` | `MYSQL_HOST` has a typo or names a server that doesn't exist. | Check `MYSQL_HOST` against the server name on your MySQL server's **Overview** page in Azure. It should appear once, for example `my-server.mysql.database.azure.com`, not `my-server.mysql.database.azure.com.mysql.database.azure.com`. |
| `ECONNREFUSED` | `MYSQL_HOST` points at a machine with no MySQL server, such as `localhost`. | Set `MYSQL_HOST` to your Azure server name. |
| `ER_ACCESS_DENIED_ERROR` | Wrong username or password. | Check `MYSQL_USER` and `MYSQL_PASSWORD` in `.env`. You can reset the password from the server's **Overview** page in Azure. |
| `ER_BAD_DB_ERROR` or `ER_NO_SUCH_TABLE` | The sample data isn't loaded. | Redo [step 4](#step-4-load-the-sample-data). |
| `❌ Port 4000 is already in use` | Another server is using that port, often one still running in a different terminal. | Press Ctrl+C in the other terminal, or change `PORT` in `.env`. |
| Browser says "This site can't be reached" | The server isn't running. | Run `npm run dev` and wait for the ✅ line. |
| Browser shows `Cannot GET /...` | That endpoint doesn't exist, usually because of a typo in the address. | Compare the address with [Endpoints](#endpoints). |
| Works on your computer but not on Azure | Azure doesn't have your settings, or your database is blocking App Service. | See [Deploying to Azure App Service](#deploying-to-azure-app-service). |

## Deploying to Azure App Service

Your `.env` never leaves your computer, so App Service starts without your settings. Give them to Azure directly:

1. **Add your settings.** In the Azure portal, open your App Service and go to **Settings > Environment variables**. On the **App settings** tab, click **+ Add** once for each of these, with the same value as in your `.env`:
   - `MYSQL_HOST`
   - `MYSQL_USER`
   - `MYSQL_PASSWORD`
   - `MYSQL_DATABASE`

   Click **Apply**, then **Confirm**. App Service sets `PORT` itself, so add only these four.

2. **Let App Service reach your database.** Open your MySQL server, go to **Settings > Networking**, tick **Allow public access from any Azure service within Azure to this server**, and click **Save**.

3. **Check the logs.** Open your App Service and go to **Monitoring > Log stream**. If it stays empty, turn on **Monitoring > App Service logs > Application logging: File System**, click **Save**, and open **Log stream** again.

**Done when** the log stream shows `✅ Connected to MySQL database "world"`.
