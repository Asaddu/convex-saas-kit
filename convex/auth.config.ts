export default {
  providers: [
    {
      domain: process.env.CONVEX_SITE_URL as string,
      applicationID: "convex",
    },
    {
      domain: "https://api.workos.com/",
      applicationID: "workos",
    },
  ],
};
