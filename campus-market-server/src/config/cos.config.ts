export default () => ({
  cos: {
    bucket: process.env.COS_BUCKET || "",
    region: process.env.COS_REGION || "",
    secretId: process.env.COS_SECRET_ID || "",
    secretKey: process.env.COS_SECRET_KEY || "",
  },
});
