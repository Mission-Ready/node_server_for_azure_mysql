# Node.js Server with MySQL Template

## Table of Contents

- [Dependencies](#dependencies)
- [Installation](#installation)
- [API Specification](#api-specification)
- [Environment Configuration](#environment-configuration)

## Dependencies

This project requires the following npm packages:

- `dotenv` - For managing environment variables.
- `express` - A web application framework for Node.js.
- `mysql2` - MySQL client for Node.js, providing both callbacks and Promises API.

## Installation

Follow these steps to set up the project on your local machine:

1. **Clone the Repository:**  
   Run the following command to clone the repository to your local machine:  
   ```bash
   git clone <repository-url>
   ```

2. **Install Dependencies:**  
   Navigate to the project directory and install the required dependencies using npm:  
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**  
   Copy `.env.example` to a new `.env` file. **Do not edit `.env.example` itself**; the server only reads `.env`.
   ```bash
   cp .env.example .env              # macOS / Linux / Git Bash
   Copy-Item .env.example .env       # Windows PowerShell
   ```
   Then open `.env` and fill in the values from your Azure MySQL Database resource:
   - `MYSQL_HOST`: The IP address or domain name of your MySQL server.
   - `MYSQL_PORT`: The MySQL port (defaults to `3306`).
   - `MYSQL_USER`: The username for accessing the MySQL server.
   - `MYSQL_PASSWORD`: The password for the above user.
   - `MYSQL_DATABASE`: The name of the database you are connecting to.
   - `PORT`: The port on which the Node.js server will listen.

4. **Obtain SSL Certificate:**  
   Download the `DigiCertGlobalRootCA.crt.pem` SSL certificate from your Azure Database resource and place it in the project directory.

5. **Start the Server:**  
   Run the following command to start the server in development mode:  
   ```bash
   npm run dev
   ```
   The server should now be running and accessible at `http://localhost:4000`.

## Environment Configuration

### Using `.env` and `.env.example` Files

- **`.env` File:**
  The `.env` file is used to store environment-specific configurations such as database credentials, API keys, and other sensitive information. It should **never** be committed to the version control system (e.g., Git) for security reasons. Make sure to add `.env` to your `.gitignore` file.

- **`.env.example` File:**
  The `.env.example` file is a template version of the `.env` file. It should contain placeholders for all the environment variables used in the project but without actual sensitive values. This file can be safely committed to your repository and shared with your team to provide guidance on the required environment variables.

  **Example of `.env.example`:**
  ```plaintext
  MYSQL_HOST=your_host_here
  MYSQL_USER=your_username_here
  MYSQL_PASSWORD=your_password_here
  MYSQL_DATABASE=your_database_name_here
  PORT=4000
  ```

  Each developer can copy the `.env.example` file to create their own `.env` file and fill in the actual values specific to their environment.

## API Specification

Your API should conform to the following specifications:

### 1. Show Countries

Retrieve a list of all countries in the database.

- **URL** : `/`
- **Method** : `GET`
- **Response Format** : JSON

**Example Response:**
```json
[
  {
    "Code": "ABW",
    "Name": "Aruba",
    "Continent": "North America",
    "Region": "Caribbean",
    "SurfaceArea": 193,
    "IndepYear": null,
    "Population": 103000,
    "LifeExpectancy": 78.4,
    "GNP": 828,
    "GNPOld": 793,
    "LocalName": "Aruba",
    "GovernmentForm": "Nonmetropolitan Territory of The Netherlands",
    "HeadOfState": "Beatrix",
    "Capital": 129,
    "Code2": "AW"
  },
  ...
]
```

### 2. Show Information About a Specific Country

Retrieve information about a single country based on its name.

- **URL** : `/country/:countryname`
- **Method** : `GET`
- **Path Parameter** :
  - `countryname`: The name of the country you want to retrieve information for.

**Example Request:**
```http
GET /country/new%20zealand
```

**Example Response:**
```json
[{
  "Code": "NZL",
  "Name": "New Zealand",
  "Continent": "Oceania",
  "Region": "Australia and New Zealand",
  "SurfaceArea": 270534,
  "IndepYear": 1907,
  "Population": 3862000,
  "LifeExpectancy": 77.8,
  "GNP": 54669,
  "GNPOld": 64960,
  "LocalName": "New Zealand/Aotearoa",
  "GovernmentForm": "Constitutional Monarchy",
  "HeadOfState": "Elisabeth II",
  "Capital": 3499,
  "Code2": "NZ"
}]
```

### 3. Find the Total Population of a Continent

Return the total population of a specified continent.

- **URL** : `/population/:continent`
- **Method** : `GET`
- **Path Parameter** :
  - `continent`: The name of the continent you want the population for.

**Example Request:**
```http
GET /population/asia
```

**Example Response:**
```plaintext
The total population of Asia is 3,705,025,700
```