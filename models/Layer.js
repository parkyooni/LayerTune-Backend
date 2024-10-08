const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { saveSnapshotsIfLarge } = require("../utils/gridfsHelpers");

const elementChangeSchema = new Schema({
  elementId: { type: String, required: true },
  newPosition: {
    parentId: { type: String, default: null },
    previousSiblingId: { type: String, default: null },
    XPath: { type: String, required: true },
  },
  originalPosition: {
    parentId: { type: String, default: null },
    previousSiblingId: { type: String, default: null },
    XPath: { type: String, required: true },
  },
  attributesChanged: [
    {
      attributeName: { type: String, required: true },
      originalValue: { type: String, required: false, default: "" },
      newValue: { type: String, required: false, default: "" },
      originalStyles: { type: [String], required: false, default: [] },
      newStyles: { type: [String], required: false, default: [] },
    },
  ],
  changeType: { type: String, required: true },
});

const domChangeSchema = new Schema({
  userId: { type: String, required: true },
  url: { type: String, required: true },
  customName: { type: String, required: true },
  originalDOMSnapshot: { type: Array, required: false },
  modifiedDOMSnapshot: { type: Array, required: false },
  originalDOMSnapshotId: { type: Schema.Types.ObjectId, required: false },
  modifiedDOMSnapshotId: { type: Schema.Types.ObjectId, required: false },
  elementChanges: [elementChangeSchema],
  timestamp: { type: Date, default: Date.now },
});

function filterDynamicAttributes(attributes) {
  const dynamicAttributes = ["timestamp", "session-id", "counter"];
  return attributes.filter(
    (attr) => !dynamicAttributes.includes(attr.attributeName)
  );
}

domChangeSchema.pre("save", async function (next) {
  const doc = this;

  await saveSnapshotsIfLarge(doc);

  doc.elementChanges.forEach((change) => {
    change.attributesChanged = filterDynamicAttributes(
      change.attributesChanged
    );
  });

  next();
});

module.exports = mongoose.model("DOMChange", domChangeSchema);
