import { Avatar, Typography, Box } from "@mui/material";

export default function UserBadge({ username }) {
  return (
    <Box display="flex" alignItems="center" gap={2} padding={1}>
      <Avatar />
      <Typography variant="body1">{username}</Typography>
    </Box>
  );
}
