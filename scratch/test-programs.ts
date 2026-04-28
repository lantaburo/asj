import { listProgramsAdmin } from "../src/features/programs/program.repository";

async function main() {
  try {
    const result = await listProgramsAdmin();
    console.log("listProgramsAdmin Success! count:", result.length);
  } catch (err: any) {
    console.error("listProgramsAdmin Failed:", err.message);
  }
}

main();
