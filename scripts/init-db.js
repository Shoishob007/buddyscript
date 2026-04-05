const fs = require("fs");
const path = require("path");
const { Client } = require("pg");

function loadEnvFromFile(filePath) {
    if (!fs.existsSync(filePath)) {
        return;
    }

    const content = fs.readFileSync(filePath, "utf8");
    for (const rawLine of content.split(/\r?\n/)) {
        const line = rawLine.trim();
        if (!line || line.startsWith("#")) {
            continue;
        }

        const equalIndex = line.indexOf("=");
        if (equalIndex <= 0) {
            continue;
        }

        const key = line.slice(0, equalIndex).trim();
        let value = line.slice(equalIndex + 1).trim();

        if (
            (value.startsWith('"') && value.endsWith('"')) ||
            (value.startsWith("'") && value.endsWith("'"))
        ) {
            value = value.slice(1, -1);
        }

        if (process.env[key] === undefined) {
            process.env[key] = value;
        }
    }
}

function loadEnvConfig() {
    const root = process.cwd();
    loadEnvFromFile(path.join(root, ".env"));
    loadEnvFromFile(path.join(root, ".env.local"));
}

loadEnvConfig();

function getConnectionString() {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
        throw new Error(
            "DATABASE_URL is required. Set your Neon Postgres connection string in .env or .env.local.",
        );
    }
    return connectionString;
}

function parseConnectionString() {
    return new URL(getConnectionString());
}

async function ensureDatabaseExists() {
    const url = parseConnectionString();
    const dbName = url.pathname.replace(/^\//, "");
    const adminUrl = new URL(url.toString());
    adminUrl.pathname = "/postgres";

    const adminClient = new Client({ connectionString: adminUrl.toString() });
    await adminClient.connect();
    try {
        const exists = await adminClient.query(
            "SELECT 1 FROM pg_database WHERE datname = $1 LIMIT 1",
            [dbName],
        );
        if (exists.rowCount === 0) {
            await adminClient.query(`CREATE DATABASE \"${dbName}\"`);
            console.log(`Created database: ${dbName}`);
        } else {
            console.log(`Database already exists: ${dbName}`);
        }
    } finally {
        await adminClient.end();
    }
}

async function applySchema() {
    const connectionString = getConnectionString();
    const schemaPath = path.join(process.cwd(), "database", "schema.sql");
    const sql = fs.readFileSync(schemaPath, "utf8");
    const client = new Client({ connectionString });
    await client.connect();
    try {
        await client.query(sql);
        console.log("Schema applied successfully");
    } finally {
        await client.end();
    }
}

(async function main() {
    try {
        try {
            await ensureDatabaseExists();
        } catch (error) {
            console.log(
                "Skipping database creation check (managed database likely does not allow CREATE DATABASE).",
            );
        }
        await applySchema();
    } catch (error) {
        console.error(error.message || error);
        process.exit(1);
    }
})();
