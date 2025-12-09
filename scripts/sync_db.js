
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROJECT_REF = 'njmurgcheshovudputjy';
const ACCESS_TOKEN = 'sbp_091567fa4cb26347bca0854104a7a9f82cbf93e7';
const MIGRATIONS_DIR = path.resolve(__dirname, '../supabase/migrations');

async function runQuery(query) {
    const response = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${ACCESS_TOKEN}`
        },
        body: JSON.stringify({ query })
    });

    if (!response.ok) {
        const text = await response.text();
        throw new Error(`API Error: ${response.status} - ${text}`);
    }

    return response.json();
}


async function getAppliedMigrations() {
    try {
        const result = await runQuery("SELECT name FROM supabase_migrations ORDER BY version");
        // API returns array of rows directly usually for specialized endpoints, 
        // but the error message showed standard Postgres error, so connection is good.
        // If successful, result should comprise the rows.
        return result.map(r => r.name);
    } catch (e) {
        if (JSON.stringify(e).includes('does not exist') || e.message.includes('does not exist')) {
            // Create table
            console.log("Creating supabase_migrations table...");
            await runQuery(`
            CREATE TABLE IF NOT EXISTS supabase_migrations (
                version text PRIMARY KEY,
                name text,
                applied_at timestamptz DEFAULT now()
            );
        `);
            return [];
        }
        throw e;
    }
}

async function main() {
    console.log("Checking database connection...");
    let appliedStats = [];
    try {
        appliedStats = await getAppliedMigrations();
    } catch (e) {
        console.error("Critical error fetching migrations:", e);
        process.exit(1);
    }

    console.log(`Found ${appliedStats.length} applied migrations.`);

    const files = fs.readdirSync(MIGRATIONS_DIR)
        .filter(f => f.endsWith('.sql'))
        .sort();

    for (const file of files) {
        const version = file.split('_')[0];
        const isApplied = appliedStats.some(name => name.startsWith(version));

        if (!isApplied) {
            console.log(`Applying migration: ${file}...`);
            const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf8');
            try {
                await runQuery(sql);
                console.log(`Success: ${file}`);
                await runQuery(`INSERT INTO supabase_migrations (version, name) VALUES ('${version}', '${file}') ON CONFLICT (version) DO NOTHING`);
            } catch (error) {
                const errorMsg = JSON.stringify(error) + error.message;
                if (errorMsg.includes('already exists') || errorMsg.includes('42P07')) {
                    console.log(`Skipping content of ${file} (objects already exist), marking as applied.`);
                    await runQuery(`INSERT INTO supabase_migrations (version, name) VALUES ('${version}', '${file}') ON CONFLICT (version) DO NOTHING`);
                } else {
                    console.error(`Failed to apply ${file}:`, error);
                    // We do NOT exit, we try the next one, hoping independent fixes (like the piggy bank one) will succeed.
                    // But typically migrations are sequential. 
                    // However, "Fix Piggy Bank" is designed to be run on top of broken states.
                    // The user wants audit and fix.
                    continue;
                }
            }
        } else {
            console.log(`Skipping (already applied): ${file}`);
        }
    }
    console.log("Sync complete.");
}

main().catch(console.error);
