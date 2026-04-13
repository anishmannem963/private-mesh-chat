import { TextField } from "@mui/material";

function Search(props) {
    return (
        <TextField
            id={props.id || "Search"}
            sx={{
                display: "flex",
                width: "calc(100% - 1rem)",
                margin: ".5rem",
                alignSelf: "center",
            }}
            label={props.label || "Search"}
            type="search"
            size="small"
            onChange={props.return}
        />
    );
}

export default Search;
