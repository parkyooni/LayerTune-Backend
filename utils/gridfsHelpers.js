const { GridFSBucket } = require("mongodb");
const mongoose = require("mongoose");
const conn = mongoose.connection;

let gfsBucket;
conn.once("open", () => {
  gfsBucket = new GridFSBucket(conn.db, {
    bucketName: "snapshots",
  });
});

async function getSnapshotFromGridFS(snapshotId) {
  return new Promise((resolve, reject) => {
    const downloadStream = gfsBucket.openDownloadStream(snapshotId);
    let data = "";
    downloadStream.on("data", (chunk) => {
      data += chunk;
    });
    downloadStream.on("end", () => {
      resolve(JSON.parse(data));
    });
    downloadStream.on("error", (err) => {
      reject(err);
    });
  });
}

async function saveSnapshotsIfLarge(doc) {
  const originalSnapshotString = JSON.stringify(doc.originalDOMSnapshot);
  const modifiedSnapshotString = JSON.stringify(doc.modifiedDOMSnapshot);
  const originalSnapshotSize = Buffer.byteLength(
    originalSnapshotString,
    "utf8"
  );
  const modifiedSnapshotSize = Buffer.byteLength(
    modifiedSnapshotString,
    "utf8"
  );

  const THRESHOLD_SIZE = 16 * 1024 * 1024;

  if (originalSnapshotSize > THRESHOLD_SIZE && !doc.originalDOMSnapshotId) {
    const snapshotStream = gfsBucket.openUploadStream("originalSnapshot");
    snapshotStream.end(originalSnapshotString);
    const result = await snapshotStream;
    doc.originalDOMSnapshotId = result._id;
    doc.originalDOMSnapshot = undefined;
  }

  if (modifiedSnapshotSize > THRESHOLD_SIZE && !doc.modifiedDOMSnapshotId) {
    const modifiedSnapshotStream =
      gfsBucket.openUploadStream("modifiedSnapshot");
    modifiedSnapshotStream.end(modifiedSnapshotString);
    const result = await modifiedSnapshotStream;
    doc.modifiedDOMSnapshotId = result._id;
    doc.modifiedDOMSnapshot = undefined;
  }

  if (originalSnapshotSize <= THRESHOLD_SIZE) {
    doc.originalDOMSnapshotId = undefined;
  }

  if (modifiedSnapshotSize <= THRESHOLD_SIZE) {
    doc.modifiedDOMSnapshotId = undefined;
  }
}

module.exports = {
  getSnapshotFromGridFS,
  saveSnapshotsIfLarge,
};
