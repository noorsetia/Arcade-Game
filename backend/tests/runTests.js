import { runAllTests } from "./backend.test.js";
runAllTests().then(() => {
  console.log("All backend test suites finished successfully.");
  process.exit(0);
}).catch((err) => {
  console.error("Test suite failed with unexpected error:", err);
  process.exit(1);
});
