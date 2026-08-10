import { createHash } from "node:crypto";
import { appendFileSync, createReadStream, readFileSync, statSync } from "node:fs";
import { basename, join, resolve } from "node:path";
import { S3Client, HeadObjectCommand } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";

const [releaseDirArg = "packages/0.7", bucket = "wayfarers-archive-releases", prefix = "releases/0.7"] = process.argv.slice(2);
const releaseDir = resolve(releaseDirArg);
const manifestPath = join(releaseDir, "release-manifest.json");
const manifest = JSON.parse(readFileSync(manifestPath, "utf8").replace(/^\uFEFF/, ""));
const logPath = process.env.R2_LOG_PATH;

function log(message) {
  const line = `${new Date().toISOString()} ${message}`;
  if (logPath) appendFileSync(logPath, `${line}\n`, "utf8");
  else console.log(line);
}

function logFailure(label, error) {
  const detail = error?.stack || String(error);
  log(`${label} ${detail}`);
}

process.on("uncaughtException", (error) => {
  logFailure("FATAL", error);
  process.exitCode = 1;
});
process.on("unhandledRejection", (error) => {
  logFailure("FATAL", error);
  process.exitCode = 1;
});

if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
  throw new Error("AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY are required.");
}

const client = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const objects = [
  ...manifest.packages.map((item) => ({
    path: join(releaseDir, item.fileName),
    key: `${prefix}/${item.fileName}`,
    bytes: Number(item.bytes),
    sha256: item.sha256.toLowerCase(),
    contentType: "application/x-7z-compressed",
  })),
  ...manifest.bootstrap.map((item) => ({
    path: join(releaseDir, "bootstrap", item.fileName),
    key: `${prefix}/bootstrap/${item.fileName}`,
    bytes: Number(item.bytes),
    sha256: item.sha256.toLowerCase(),
    contentType: item.fileName.endsWith(".exe") ? "application/vnd.microsoft.portable-executable" : "text/plain; charset=utf-8",
  })),
];

function sha256File(path) {
  return new Promise((resolveHash, reject) => {
    const hash = createHash("sha256");
    const stream = createReadStream(path);
    stream.on("error", reject);
    stream.on("data", (chunk) => hash.update(chunk));
    stream.on("end", () => resolveHash(hash.digest("hex")));
  });
}

async function alreadyVerified(item) {
  try {
    const head = await client.send(new HeadObjectCommand({ Bucket: bucket, Key: item.key }));
    return Number(head.ContentLength) === item.bytes && head.Metadata?.sha256 === item.sha256;
  } catch (error) {
    if (error?.$metadata?.httpStatusCode === 404 || error?.name === "NotFound") return false;
    throw error;
  }
}

let completedBytes = 0;
const totalBytes = objects.reduce((sum, item) => sum + item.bytes, 0);

for (const [index, item] of objects.entries()) {
  const actualBytes = statSync(item.path).size;
  if (actualBytes !== item.bytes) throw new Error(`Size mismatch for ${item.path}: ${actualBytes} != ${item.bytes}`);

  if (await alreadyVerified(item)) {
    completedBytes += item.bytes;
    log(`SKIP ${index + 1}/${objects.length} ${basename(item.path)} already verified`);
    continue;
  }

  const localHash = await sha256File(item.path);
  if (localHash !== item.sha256) throw new Error(`SHA256 mismatch for ${item.path}`);

  log(`UPLOAD ${index + 1}/${objects.length} ${basename(item.path)} ${(item.bytes / 1e9).toFixed(2)} GB`);
  let lastReported = -1;
  const upload = new Upload({
    client,
    params: {
      Bucket: bucket,
      Key: item.key,
      Body: createReadStream(item.path),
      ContentLength: item.bytes,
      ContentType: item.contentType,
      CacheControl: "public, max-age=31536000, immutable",
      Metadata: { sha256: item.sha256 },
    },
    queueSize: 16,
    partSize: 32 * 1024 * 1024,
    leavePartsOnError: false,
  });
  upload.on("httpUploadProgress", ({ loaded = 0 }) => {
    const percent = Math.floor((loaded / item.bytes) * 100);
    if (percent >= lastReported + 10 || percent === 100) {
      lastReported = percent;
      const overall = ((completedBytes + loaded) / totalBytes) * 100;
      log(`PROGRESS ${percent}% file, ${overall.toFixed(1)}% release`);
    }
  });
  await upload.done();
  if (!(await alreadyVerified(item))) throw new Error(`Remote verification failed for ${item.key}`);
  completedBytes += item.bytes;
  log(`VERIFIED ${item.key}`);
}

log(`COMPLETE objects=${objects.length} bytes=${completedBytes}`);
