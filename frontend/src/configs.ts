export const isProduction = import.meta.env.PROD;

if (isProduction) {
  console.log = () => {};
}
