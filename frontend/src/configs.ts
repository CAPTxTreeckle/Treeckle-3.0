export const isProduction = false; // process.env.NODE_ENV === "production";

if (isProduction) {
  console.log = () => {};
}
