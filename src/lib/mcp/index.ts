import { auth, defineMcp } from "@lovable.dev/mcp-js";
import listCoursesTool from "./tools/list-courses";
import listAssignmentsTool from "./tools/list-assignments";
import listAssignmentsNeedingGradingTool from "./tools/list-assignments-needing-grading";

// Build the Supabase Auth issuer from the project ref so the manifest stays
// import-safe. VITE_SUPABASE_PROJECT_ID is inlined by Vite at build time.
const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "allen-canvas-mcp",
  title: "Allen for Canvas",
  version: "0.1.0",
  instructions:
    "Tools for the Allen for Canvas grading assistant. Use `list_courses` to see the signed-in teacher's Canvas courses, `list_assignments` to browse assignments in one course, and `list_assignments_needing_grading` to find submissions that still need grading.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [listCoursesTool, listAssignmentsTool, listAssignmentsNeedingGradingTool],
});
