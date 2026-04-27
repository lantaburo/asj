import type { PublicProgramDto } from "@/features/programs/program.types";

export type PublicProgramsApiResponse = {
  success: boolean;
  message: string | null;
  data: {
    programs: PublicProgramDto[];
  };
};
