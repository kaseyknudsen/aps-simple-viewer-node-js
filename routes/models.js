const express = require("express");
const formidable = require("express-formidable");
const {
  listObjects,
  uploadObject,
  translateObject,
  getManifest,
  urnify,
} = require("../services/aps.js");

let router = express.Router();

//when client wants to get the list of all models available for viewing
router.get("/api/models", async function (req, res, next) {
  try {
    const objects = await listObjects();
    res.json(
      objects.map((o) => ({
        name: o.objectKey,
        urn: urnify(o.objectId),
      }))
    );
  } catch (err) {
    next(err);
  }
});

//used to check the status of the conversion
router.get("/api/models/:urn/status", async function (req, res, next) {
  try {
    const manifest = await getManifest(req.params.urn);
    if (manifest) {
      let messages = [];
      if (manifest.derivatives) {
        for (const derivative of manifest.derivatives) {
          messages = messages.concat(derivative.messages || []);
          if (derivative.children) {
            for (const child of derivative.children) {
              messages.concat(child.messages || []);
            }
          }
        }
      }
      res.json({
        status: manifest.status,
        progress: manifest.progress,
        messages,
      });
    } else {
      res.json({ status: "n/a" });
    }
  } catch (err) {
    next(err);
  }
});

//when the client wants to upload a new model and start it's translation
router.post("/api/models", formidable(), async function (req, res, next) {
  const file = req.files["model-file"];
  if (!file) {
    res.status(400).send('The required field ("model-file") is missing.');
    return;
  }
  try {
    const obj = await uploadObject(file.name, file.path);
    await translateObject(
      urnify(obj.objectId),
      req.fields["model-zip-entrypoint"]
    );
    res.json({
      name: obj.objectKey,
      urn: urnify(obj.objectId),
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
