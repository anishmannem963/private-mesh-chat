import UserBadge from "../../../UserBadge/UserBadge.jsx";
import {List, Paper} from "@mui/material";

function Members() {

    const serverUsers = [
        //Temporarily declared until synced with backend.
        { id: 1, name: "Alice", status: "Hi", online: true, icon: "public/vite.svg"},
        { id: 2, name: "Bob", status: "Hey", online: true},
        { id: 3, name: "Charlie", status: ":3", online: false},
        { id: 3, name: "Charlie", status: ":3", online: false},
        { id: 3, name: "Charlie", status: ":3", online: false},
        { id: 3, name: "Charlie", status: ":3", online: false},
        { id: 3, name: "Charlie", status: ":3", online: false},
        { id: 3, name: "Charlie", status: ":3", online: false},
        { id: 3, name: "Charlie", status: ":3", online: false},
        { id: 3, name: "Charlie", status: ":3", online: false},
        { id: 3, name: "Charlie", status: ":3", online: false},
        { id: 3, name: "Charlie", status: ":3", online: false},
        { id: 3, name: "Charlie", status: ":3", online: false},
        { id: 3, name: "Charlie", status: ":3", online: false},
        { id: 3, name: "Charlie", status: ":3", online: false},
        { id: 3, name: "Charlie", status: ":3", online: false},
        { id: 3, name: "Charlie", status: ":3", online: false},
        { id: 3, name: "Charlie", status: ":3", online: false},
        { id: 3, name: "Charlie", status: ":3", online: false},
        { id: 3, name: "Charlie", status: ":3", online: false},
        { id: 3, name: "Charlie", status: ":3", online: false},
        { id: 3, name: "Charlie", status: ":3", online: false},
        { id: 3, name: "Charlie", status: ":3", online: false},
        { id: 3, name: "Charlie", status: ":3", online: false},
        { id: 3, name: "Charlie", status: ":3", online: false},
        { id: 3, name: "Charlie", status: ":3", online: false},
        { id: 3, name: "Charlie", status: ":3", online: false},
        { id: 3, name: "Charlie", status: ":3", online: false},
        // Add more users...
    ];

    return (
        <div style={{ display: "flex", width: "15rem", height: "100%", margin: "0"}}>

            <Paper elevation={24} sx={{
                borderRadius: 7.5,
                borderBottomLeftRadius: 0,
                borderTopLeftRadius: 0
            }} style={{ display: "flex", width: "15rem", height: "100%", margin: "0", marginRight: "0", overflow: "hidden"}}>


                <List
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        margin: "0",
                        width: "100%",
                        height: "calc(100% - .5rem)",
                        position: 'relative',
                        overflow: 'auto',
                        '& ul': { padding: 0 },
                    }}
                    subheader={<li />}
                >
                    {serverUsers.map((user) => (
                        <li key={`section-${user}`}>
                            <UserBadge user={user.name} status={user.status} online ={user.online} img={user.icon} />
                        </li>
                    ))}
                </List>

            </Paper>
        </div>
    )
}

export default Members;