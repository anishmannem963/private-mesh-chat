import { Box } from "@mui/material";
import ServerSelectionWindow from "../components/ServerSelectionWindow";
import MessageWindow from "../components/MessageWindow";

export default function Main() {
  return (
    <Box display="flex">
      <ServerSelectionWindow />
      <MessageWindow />
    </Box>
  );
}
