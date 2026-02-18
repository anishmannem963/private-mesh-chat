import { Box, TextField, Button, Typography } from "@mui/material";

export default function Login() {
  return (
    <Box
      display="flex"
      flexDirection="column"
      width="300px"
      margin="auto"
      mt={10}
      gap={2}
    >
      <Typography variant="h5">Login</Typography>
      <TextField label="Username" />
      <TextField label="Password" type="password" />
      <Button variant="contained">Login</Button>
    </Box>
  );
}
