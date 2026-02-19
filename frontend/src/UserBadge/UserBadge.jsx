import './UserBadge.css'
import {Avatar, Badge, Button, Paper, Stack} from "@mui/material";
import {useState} from "react";



function GetUserInfo(){
    alert("I am an alert box!");
}

function UserBadge(props) {

    const [hovered, setHovered] = useState(false);

    return (
        <Button onClick={GetUserInfo} sx={{
            display: "flex", width: "calc(100% - 1rem)", margin: ".5rem", padding: "0", borderRadius: 10,
        color: "orange", textTransform: "none", }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            <Paper elevation={hovered ? 24 : 7} className="UserBadgeContainer" sx={{
                display: "flex", width: "100%", height: "fit-content", margin: "0", borderRadius: 10
            }}>
                <Stack direction = "row" spacing ={2}>
                    <Badge invisible={!props.online} color="primary" variant ="dot">
                        <Avatar src ={props.img || "userDefault.png"} sx={{margin: ".25rem"}} alt = "UserBadgeIcon" ></Avatar>
                    </Badge>

                    <div>
                        <h3>{props.user || ""}</h3>

                        <h6>{props.status || ""}</h6>
                    </div>
                </Stack>
            </Paper>

        </Button>
    )

}

export default UserBadge;