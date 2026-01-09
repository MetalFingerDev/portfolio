import fs from "fs";
import https from "https";
import http from "http";
import { URL } from "url";

function usage() {
    console.log("Usage: node scripts/download_milkyway.js --url <image_url> --out <out.jpg>");
}

function download(url, outPath) {
    return new Promise((resolve, reject) => {
        const u = new URL(url);
        const client = u.protocol === "https:" ? https : http;
        client
            .get(u, (res) => {
                if (res.statusCode && res.statusCode >= 400) {
                    reject(new Error(`HTTP ${res.statusCode}`));
                    return;
                }
                const file = fs.createWriteStream(outPath);
                res.pipe(file);
                file.on("finish", () => file.close(resolve));
            })
            .on("error", (err) => reject(err));
    });
}

async function main() {
    const argv = process.argv.slice(2);
    let url = null;
    let out = "public/milkyway.jpg";
    for (let i = 0; i < argv.length; i++) {
        const a = argv[i];
        if (a === "--url") url = argv[++i];
        else if (a === "--out") out = argv[++i];
    }

    url = url || process.env.MW_URL;
    out = process.env.MW_OUT || out;

    if (!url) {
        console.error("No URL provided for Milky Way image. Set --url or MW_URL env var.");
        return usage();
    }
    console.log(`Downloading ${url} -> ${out}`);
    await download(url, out);
    console.log("Done");
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
