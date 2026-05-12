export default () => ({
  app: {
    port: Number(process.env.PORT || 3000),
    jwtSecret: process.env.JWT_SECRET || "replace-me",
    adminUserNos: (process.env.ADMIN_USER_NOS || "").split(",").filter(Boolean),
  },
});
