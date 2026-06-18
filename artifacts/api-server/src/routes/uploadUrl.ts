import { Router } from "express";
import { requireAuth } from "@clerk/express";
import { Storage } from "@google-cloud/storage";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";

const router = Router();

const bucketId = process.env.DEFAULT_OBJECT_STORAGE_BUCKET_ID;

router.post("/storage/upload-url", requireAuth(), async (req, res) => {
  try {
    if (!bucketId) {
      return res.status(500).json({ error: "Object storage not configured" });
    }
    const schema = z.object({
      filename: z.string().min(1),
      contentType: z.string().min(1),
    });
    const { filename, contentType } = schema.parse(req.body);
    const ext = filename.split(".").pop() ?? "bin";
    const objectKey = `items/${uuidv4()}.${ext}`;

    const storage = new Storage();
    const bucket = storage.bucket(bucketId);
    const file = bucket.file(objectKey);

    const [uploadUrl] = await file.generateSignedPostPolicyV4({
      expires: Date.now() + 15 * 60 * 1000,
      conditions: [["content-length-range", 0, 10 * 1024 * 1024]],
    });

    const objectUrl = `https://storage.googleapis.com/${bucketId}/${objectKey}`;
    res.json({ uploadUrl: uploadUrl.url, objectUrl });
  } catch (err) {
    req.log.error({ err }, "Failed to generate upload URL");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
