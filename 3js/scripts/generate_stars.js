import fs from "fs";
import { parse } from "csv-parse/sync";
import https from "https";
import http from "http";
import { URL } from "url";

function usage() {
    console.log("Usage: node scripts/generate_stars.js --input <file_or_url> --out <out.json> [--maxMag <mag>]");
}

function fetchText(url) {
    return new Promise((resolve, reject) => {
        const u = new URL(url);
        const handler = u.protocol === "https:" ? https : http;
        handler
            .get(u, (res) => {
                let data = "";
                res.on("data", (chunk) => (data += chunk));
                res.on("end", () => resolve(data));
            })
            .on("error", reject);
    });
}

function tryParseFloat(v) {
    if (v === undefined || v === null || v === "") return undefined;
    const n = parseFloat(String(v).trim());
    return Number.isFinite(n) ? n : undefined;
}

function hmsToDeg(hms) {
    const parts = String(hms).trim().split(/[:\s]+/).map(Number);
    if (parts.length < 2) return undefined;
    const h = parts[0] || 0;
    const m = parts[1] || 0;
    const s = parts[2] || 0;
    return (h + m / 60 + s / 3600) * 15;
}

function dmsToDeg(dms) {
    const parts = String(dms).trim().split(/[:\s]+/);
    if (parts.length < 2) return undefined;
    const sign = parts[0].startsWith("-") ? -1 : 1;
    const vals = parts.map((p) => Number(p.replace("+", "").replace("-", "")));
    const d = vals[0] || 0;
    const m = vals[1] || 0;
    const s = vals[2] || 0;
    return sign * (Math.abs(d) + m / 60 + s / 3600);
}

async function main() {
    const argv = process.argv.slice(2);
    if (argv.length < 2) return usage();
    let input = null;
    let out = "public/bright-stars.json";
    let maxMag = 6;
    for (let i = 0; i < argv.length; i++) {
        const a = argv[i];
        if (a === "--input") input = argv[++i];
        else if (a === "--out") out = argv[++i];
        else if (a === "--maxMag") maxMag = Number(argv[++i]);
    }
    input = input || process.env.STARS_INPUT;
    out = out || process.env.STARS_OUT || out;
    maxMag = !Number.isNaN(maxMag) ? maxMag : Number(process.env.STARS_MAXMAG || maxMag);

    if (!input) {
        console.error("No input CSV provided. Set --input or STARS_INPUT env var.");
        return usage();
    }

    let csvText = "";
    if (/^https?:\/\//.test(input)) {
        console.log("Fetching", input);
        csvText = await fetchText(input);
    } else {
        if (!fs.existsSync(input)) {
            console.error(`Input file not found: ${input}`);
            process.exit(1);
        }
        csvText = fs.readFileSync(input, "utf8");
    }

    console.log(`Using: input=${input}, out=${out}, maxMag=${maxMag}`);

    const parseOptions = { columns: true, skip_empty_lines: true };
    if (csvText.includes('\t')) parseOptions.delimiter = '\t';
    const records = parse(csvText, parseOptions);
    console.log("Got records:", records.length);

    const outStars = [];
    let processed = 0;
    let skippedMissing = 0;
    let skippedInvalidCoord = 0;
    let skippedInvalidMag = 0;
    let skippedFilteredByMag = 0;

    for (const r of records) {
        processed++;
        const keys = Object.keys(r).reduce((acc, k) => ({ ...acc, [k.toLowerCase()]: r[k] }), {});
        let ra = tryParseFloat(keys.ra || keys['ra_deg'] || keys['ra_deg']);
        let dec = tryParseFloat(keys.dec || keys['dec_deg'] || keys['dec_deg']);
        if (ra === undefined && keys['raj2000']) ra = hmsToDeg(keys['raj2000']);
        if (ra === undefined && keys['ra_hms']) ra = hmsToDeg(keys['ra_hms']);
        if (dec === undefined && keys['dej2000']) dec = dmsToDeg(keys['dej2000']);
        if (dec === undefined && keys['dec_dms']) dec = dmsToDeg(keys['dec_dms']);

        let mag = tryParseFloat(keys.vmag || keys.v || keys.mag || keys['vmag']);
        const bv = tryParseFloat(keys['b-v'] || keys.bv || keys['bv']);

        if (ra === undefined || dec === undefined || mag === undefined) {
            skippedMissing++;
            continue;
        }

        if (ra >= 0 && ra <= 24) {
            ra = ra * 15;
        }
        if (!(ra >= 0 && ra < 360 && dec >= -90 && dec <= 90)) {
            skippedInvalidCoord++;
            continue;
        }

        if (!(mag >= -30 && mag <= 30)) {
            skippedInvalidMag++;
            continue;
        }

        if (mag > maxMag) {
            skippedFilteredByMag++;
            continue;
        }

        outStars.push({ ra: ra, dec: dec, mag: mag, bv: bv });
    }

    console.log(`Processed ${processed} rows.`);
    console.log(`Added ${outStars.length} stars (mag <= ${maxMag}).`);
    console.log(`Skipped: missing=${skippedMissing}, badCoords=${skippedInvalidCoord}, badMag=${skippedInvalidMag}, filteredByMag=${skippedFilteredByMag}`);

    fs.writeFileSync(out, JSON.stringify(outStars, null, 2), "utf8");
    console.log("Wrote", out);
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
