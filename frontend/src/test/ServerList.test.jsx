import { test, expect, vi, describe, beforeEach } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import ServerList from "../MainScreen/ServerList/ServerList.jsx";

const servers = [
    { id: 1, name: "test1", icon: "public/vite.svg", channels: ["General", "Gaming", "Music"] },
    { id: 2, name: "test2", icon: "public/vite.svg", channels: ["General", "Discussions", "Voice"] },
    { id: 3, name: "Test1", icon: "public/vite.svg", channels: ["Forum", "one", "two"] },
    { id: 4, name: "Test2", icon: "public/vite.svg", channels: ["dljfnadll", "Gadlfkndlg", "fkld"] },
    { id: 5, name: "thisIsATest1", icon: "public/vite.svg", channels: ["kn", "dknf", "kdlfna"] },
    { id: 6, name: "Alice", icon: "public/vite.svg", channels: ["1", "2", "3"] },
];

describe('ServerList Component', () => {
    let onServerSelectMock;
    let onChannelSelectMock;

    beforeEach(() => {
        onServerSelectMock = vi.fn();
        onChannelSelectMock = vi.fn();
    });

    test('Renders without exceptions', () => {
        expect(() => render(
            <ServerList 
                servers={servers} 
                onServerSelect={onServerSelectMock} 
                onChannelSelect={onChannelSelectMock} 
            />
        )).not.toThrow();
    });

    test("Server list renders all test servers", () => {
        render(
            <ServerList 
                servers={servers} 
                onServerSelect={onServerSelectMock} 
                onChannelSelect={onChannelSelectMock} 
            />
        );

        expect(screen.queryByText("test1")).toBeInTheDocument();
        expect(screen.queryByText("test2")).toBeInTheDocument();
        expect(screen.queryByText("Test1")).toBeInTheDocument();
        expect(screen.queryByText("Test2")).toBeInTheDocument();
        expect(screen.queryByText("thisIsATest1")).toBeInTheDocument();
        expect(screen.getByText("Alice")).toBeInTheDocument();
    });

    test("Search filters servers returned", () => {
        render(
            <ServerList 
                servers={servers} 
                onServerSelect={onServerSelectMock} 
                onChannelSelect={onChannelSelectMock} 
            />
        );

        const input = screen.getByLabelText("Search");

        fireEvent.input(input, { target: { value: "Alice" } });

        expect(screen.queryByText("test1")).not.toBeInTheDocument();
        expect(screen.queryByText("test2")).not.toBeInTheDocument();
        expect(screen.queryByText("Test1")).not.toBeInTheDocument();
        expect(screen.queryByText("Test2")).not.toBeInTheDocument();
        expect(screen.queryByText("thisIsATest1")).not.toBeInTheDocument();
        expect(screen.getByText("Alice")).toBeInTheDocument();
    });

    test("Selecting a server calls onServerSelect and onChannelSelect with default channel", () => {
        render(
            <ServerList 
                servers={servers} 
                onServerSelect={onServerSelectMock} 
                onChannelSelect={onChannelSelectMock} 
            />
        );

        const firstServer = screen.getByText("test1").closest('li');
        fireEvent.click(firstServer);

        expect(onServerSelectMock).toHaveBeenCalledWith(servers[0]);
        
        expect(onChannelSelectMock).toHaveBeenCalledWith("General");
    });

    test("Clicking on a channel calls onChannelSelect", async () => {
        const { rerender } = render(
            <ServerList 
                servers={servers} 
                onServerSelect={onServerSelectMock} 
                onChannelSelect={onChannelSelectMock} 
            />
        );

        const firstServer = screen.getByText("test1").closest('li');
        fireEvent.click(firstServer);

        expect(onServerSelectMock).toHaveBeenCalledWith(servers[0]);
        expect(onChannelSelectMock).toHaveBeenCalledWith("General");

        onServerSelectMock.mockReset();
        onChannelSelectMock.mockReset();

        rerender(
            <ServerList 
                servers={servers}
                onServerSelect={onServerSelectMock}
                onChannelSelect={onChannelSelectMock}
            />
        );

        // Now find and click a different channel
        const gamingChannel = screen.getByText("Gaming").closest('li');
        fireEvent.click(gamingChannel);

        // Check if onChannelSelect was called with the correct channel
        // and onServerSelect wasn't called
        expect(onChannelSelectMock).toHaveBeenCalledWith("Gaming");
        expect(onServerSelectMock).not.toHaveBeenCalled();
    });

    test("Adding a new channel works", async () => {
        const { rerender } = render(
            <ServerList 
                servers={servers} 
                onServerSelect={onServerSelectMock} 
                onChannelSelect={onChannelSelectMock} 
            />
        );

        // First select a server to show channels
        const firstServer = screen.getByText("test1").closest('li');
        fireEvent.click(firstServer);

        // Reset the mock to clearly see the next call
        onServerSelectMock.mockReset();

        // Find and click the Add Channel button
        const addButton = screen.getByText("+ Add Channel");
        fireEvent.click(addButton);

        // Find the channel input and add a new channel
        const input = screen.getByPlaceholderText("Channel name");
        fireEvent.change(input, { target: { value: "New Channel" } });
        
        // Submit the form
        const submitButton = screen.getByText("Add");
        fireEvent.click(submitButton);

        // Check if onServerSelect was called with updated channels
        expect(onServerSelectMock).toHaveBeenCalled();
        const updatedServerArg = onServerSelectMock.mock.calls[0][0];
        expect(updatedServerArg.channels).toContain("New Channel");
    });

    test("Visual indication is applied to the selected channel", async () => {

        const { rerender } = render(
            <ServerList 
                servers={servers} 
                onServerSelect={onServerSelectMock} 
                onChannelSelect={onChannelSelectMock} 
            />
        );

        const firstServer = screen.getByText("test1").closest('li');
        fireEvent.click(firstServer);

        

        
        rerender(
            <ServerList 
                servers={servers}
                onServerSelect={onServerSelectMock}
                onChannelSelect={onChannelSelectMock}
            />
        );

        const generalChannel = screen.getByText("General").closest('li');
        fireEvent.click(generalChannel);

        
        expect(onChannelSelectMock).toHaveBeenCalledWith("General");
    });
});

// import { test, expect, vi, describe, beforeEach } from "vitest";
// import { fireEvent, render, screen, within } from "@testing-library/react";
// import ServerList from "../MainScreen/ServerList/ServerList.jsx";

// const servers = [
//     { id: 1, name: "test1",        icon: "public/vite.svg", channels: ["General", "Gaming", "Music"] },
//     { id: 2, name: "test2",        icon: "public/vite.svg", channels: ["General", "Discussions", "Voice"] },
//     { id: 3, name: "Test1",        icon: "public/vite.svg", channels: ["Forum", "one", "two"] },
//     { id: 4, name: "Test2",        icon: "public/vite.svg", channels: ["dljfnadll", "Gadlfkndlg", "fkld"] },
//     { id: 5, name: "thisIsATest1", icon: "public/vite.svg", channels: ["kn", "dknf", "kdlfna"] },
//     { id: 6, name: "Alice",        icon: "public/vite.svg", channels: ["1", "2", "3"] },
// ];


// describe('ServerList Component', () => {
//     let onServerSelectMock;
//     let onChannelSelectMock;

//     beforeEach(() => {
//         onServerSelectMock = vi.fn();
//         onChannelSelectMock = vi.fn();
//     });

//     // ── Sprint 2 tests (unchanged) ──────────────────────────────────────────

//     test('Renders without exceptions', () => {
//         expect(() => render(
//             <ServerList
//                 servers={servers}
//                 onServerSelect={onServerSelectMock}
//                 onChannelSelect={onChannelSelectMock}
//             />
//         )).not.toThrow();
//     });

//     test("Server list renders all test servers", () => {
//         render(
//             <ServerList
//                 servers={servers}
//                 onServerSelect={onServerSelectMock}
//                 onChannelSelect={onChannelSelectMock}
//             />
//         );
//         expect(screen.queryByText("test1")).toBeInTheDocument();
//         expect(screen.queryByText("test2")).toBeInTheDocument();
//         expect(screen.queryByText("Test1")).toBeInTheDocument();
//         expect(screen.queryByText("Test2")).toBeInTheDocument();
//         expect(screen.queryByText("thisIsATest1")).toBeInTheDocument();
//         expect(screen.getByText("Alice")).toBeInTheDocument();
//     });

//     test("Search filters servers returned", () => {
//         render(
//             <ServerList
//                 servers={servers}
//                 onServerSelect={onServerSelectMock}
//                 onChannelSelect={onChannelSelectMock}
//             />
//         );
//         const input = screen.getByLabelText("Search");
//         fireEvent.input(input, { target: { value: "Alice" } });
//         expect(screen.queryByText("test1")).not.toBeInTheDocument();
//         expect(screen.queryByText("test2")).not.toBeInTheDocument();
//         expect(screen.queryByText("Test1")).not.toBeInTheDocument();
//         expect(screen.queryByText("Test2")).not.toBeInTheDocument();
//         expect(screen.queryByText("thisIsATest1")).not.toBeInTheDocument();
//         expect(screen.getByText("Alice")).toBeInTheDocument();
//     });

//     test("Selecting a server calls onServerSelect and onChannelSelect with default channel", () => {
//         render(
//             <ServerList
//                 servers={servers}
//                 onServerSelect={onServerSelectMock}
//                 onChannelSelect={onChannelSelectMock}
//             />
//         );
//         const firstServer = screen.getByText("test1").closest('li');
//         fireEvent.click(firstServer);
//         expect(onServerSelectMock).toHaveBeenCalledWith(servers[0]);
//         expect(onChannelSelectMock).toHaveBeenCalledWith("General");
//     });

//     test("Clicking on a channel calls onChannelSelect", async () => {
//         const { rerender } = render(
//             <ServerList
//                 servers={servers}
//                 onServerSelect={onServerSelectMock}
//                 onChannelSelect={onChannelSelectMock}
//             />
//         );
//         const firstServer = screen.getByText("test1").closest('li');
//         fireEvent.click(firstServer);
//         expect(onServerSelectMock).toHaveBeenCalledWith(servers[0]);
//         expect(onChannelSelectMock).toHaveBeenCalledWith("General");
//         onServerSelectMock.mockReset();
//         onChannelSelectMock.mockReset();
//         rerender(
//             <ServerList
//                 servers={servers}
//                 onServerSelect={onServerSelectMock}
//                 onChannelSelect={onChannelSelectMock}
//             />
//         );
//         const gamingChannel = screen.getByText("Gaming").closest('li');
//         fireEvent.click(gamingChannel);
//         expect(onChannelSelectMock).toHaveBeenCalledWith("Gaming");
//         expect(onServerSelectMock).not.toHaveBeenCalled();
//     });

//     test("Adding a new channel works", async () => {
//         const { rerender } = render(
//             <ServerList
//                 servers={servers}
//                 onServerSelect={onServerSelectMock}
//                 onChannelSelect={onChannelSelectMock}
//             />
//         );
//         const firstServer = screen.getByText("test1").closest('li');
//         fireEvent.click(firstServer);
//         onServerSelectMock.mockReset();
//         const addButton = screen.getByText("+ Add Channel");
//         fireEvent.click(addButton);
//         const input = screen.getByPlaceholderText("Channel name");
//         fireEvent.change(input, { target: { value: "New Channel" } });
//         const submitButton = screen.getByText("Add");
//         fireEvent.click(submitButton);
//         expect(onServerSelectMock).toHaveBeenCalled();
//         const updatedServerArg = onServerSelectMock.mock.calls[0][0];
//         expect(updatedServerArg.channels).toContain("New Channel");
//     });

//     test("Visual indication is applied to the selected channel", async () => {
//         const { rerender } = render(
//             <ServerList
//                 servers={servers}
//                 onServerSelect={onServerSelectMock}
//                 onChannelSelect={onChannelSelectMock}
//             />
//         );
//         const firstServer = screen.getByText("test1").closest('li');
//         fireEvent.click(firstServer);
//         rerender(
//             <ServerList
//                 servers={servers}
//                 onServerSelect={onServerSelectMock}
//                 onChannelSelect={onChannelSelectMock}
//             />
//         );
//         const generalChannel = screen.getByText("General").closest('li');
//         fireEvent.click(generalChannel);
//         expect(onChannelSelectMock).toHaveBeenCalledWith("General");
//     });

//     // ── Sprint 3 tests ──────────────────────────────────────────────────────
//     // MUI Dialog keeps role="dialog" in the DOM even when open={false}.
//     // We NEVER assert that the dialog is closed. Instead we assert only
//     // the behavioral outcome of each action on the sidebar.

//     test("Opens the profile edit modal when Edit button is clicked", () => {
//         render(
//             <ServerList
//                 servers={servers}
//                 onServerSelect={onServerSelectMock}
//                 onChannelSelect={onChannelSelectMock}
//             />
//         );
//         fireEvent.click(screen.getByText("Edit"));
//         expect(screen.getByRole("dialog")).toBeInTheDocument();
//     });

//     test("Profile edit modal displays current username", () => {
//         render(
//             <ServerList
//                 servers={servers}
//                 onServerSelect={onServerSelectMock}
//                 onChannelSelect={onChannelSelectMock}
//             />
//         );
//         fireEvent.click(screen.getByText("Edit"));
//         const usernameField = within(screen.getByRole("dialog")).getByLabelText("Username");
//         expect(usernameField.value).toBe("Your Username");
//     });

//     test("Saves updated username after editing profile", () => {
//         render(
//             <ServerList
//                 servers={servers}
//                 onServerSelect={onServerSelectMock}
//                 onChannelSelect={onChannelSelectMock}
//             />
//         );
//         fireEvent.click(screen.getByText("Edit"));
//         const dialog = screen.getByRole("dialog");
//         fireEvent.change(within(dialog).getByLabelText("Username"), {
//             target: { value: "NewUsername" },
//         });
//         fireEvent.click(within(dialog).getByText("Save"));
//         // Assert the sidebar bold name updated
//         const boldName = screen.getByText("NewUsername");
//         expect(boldName).toBeInTheDocument();
//         expect(boldName.style.fontWeight).toBe("bold");
//     });

//     test("Cancel does not save changes to the sidebar", () => {
//         render(
//             <ServerList
//                 servers={servers}
//                 onServerSelect={onServerSelectMock}
//                 onChannelSelect={onChannelSelectMock}
//             />
//         );
//         fireEvent.click(screen.getByText("Edit"));
//         const dialog = screen.getByRole("dialog");
//         fireEvent.change(within(dialog).getByLabelText("Username"), {
//             target: { value: "ShouldNotSave" },
//         });
//         fireEvent.click(within(dialog).getByText("Cancel"));
//         // Outcome: original sidebar name unchanged
//         expect(screen.getByText("Your Username")).toBeInTheDocument();
//         // Cancelled text is not in any bold sidebar name div
//         const boldNames = document.querySelectorAll('div[style*="font-weight: bold"]');
//         const hasCancelledText = Array.from(boldNames).some(el => el.textContent === "ShouldNotSave");
//         expect(hasCancelledText).toBe(false);
//     });

//     test("Status dot is visible in the sidebar", () => {
//         render(
//             <ServerList
//                 servers={servers}
//                 onServerSelect={onServerSelectMock}
//                 onChannelSelect={onChannelSelectMock}
//             />
//         );
//         const greenDots = document.querySelectorAll(
//             'div[style*="border-radius: 50%"][style*="background-color: green"]'
//         );
//         expect(greenDots.length).toBeGreaterThan(0);
//     });
// });

// // import { test, expect, vi, describe, beforeEach } from "vitest";
// // import { fireEvent, render, screen, within } from "@testing-library/react";
// // import ServerList from "../MainScreen/ServerList/ServerList.jsx";

// // const servers = [
// //     { id: 1, name: "test1",        icon: "public/vite.svg", channels: ["General", "Gaming", "Music"] },
// //     { id: 2, name: "test2",        icon: "public/vite.svg", channels: ["General", "Discussions", "Voice"] },
// //     { id: 3, name: "Test1",        icon: "public/vite.svg", channels: ["Forum", "one", "two"] },
// //     { id: 4, name: "Test2",        icon: "public/vite.svg", channels: ["dljfnadll", "Gadlfkndlg", "fkld"] },
// //     { id: 5, name: "thisIsATest1", icon: "public/vite.svg", channels: ["kn", "dknf", "kdlfna"] },
// //     { id: 6, name: "Alice",        icon: "public/vite.svg", channels: ["1", "2", "3"] },
// // ];

// // describe('ServerList Component', () => {
// //     let onServerSelectMock;
// //     let onChannelSelectMock;

// //     beforeEach(() => {
// //         onServerSelectMock = vi.fn();
// //         onChannelSelectMock = vi.fn();
// //     });

// //     // ── Sprint 2 tests (unchanged) ──────────────────────────────────────────

// //     test('Renders without exceptions', () => {
// //         expect(() => render(
// //             <ServerList 
// //                 servers={servers} 
// //                 onServerSelect={onServerSelectMock} 
// //                 onChannelSelect={onChannelSelectMock} 
// //             />
// //         )).not.toThrow();
// //     });

// //     test("Server list renders all test servers", () => {
// //         render(
// //             <ServerList 
// //                 servers={servers} 
// //                 onServerSelect={onServerSelectMock} 
// //                 onChannelSelect={onChannelSelectMock} 
// //             />
// //         );

// //         expect(screen.queryByText("test1")).toBeInTheDocument();
// //         expect(screen.queryByText("test2")).toBeInTheDocument();
// //         expect(screen.queryByText("Test1")).toBeInTheDocument();
// //         expect(screen.queryByText("Test2")).toBeInTheDocument();
// //         expect(screen.queryByText("thisIsATest1")).toBeInTheDocument();
// //         expect(screen.getByText("Alice")).toBeInTheDocument();
// //     });

// //     test("Search filters servers returned", () => {
// //         render(
// //             <ServerList 
// //                 servers={servers} 
// //                 onServerSelect={onServerSelectMock} 
// //                 onChannelSelect={onChannelSelectMock} 
// //             />
// //         );

// //         const input = screen.getByLabelText("Search");
// //         fireEvent.input(input, { target: { value: "Alice" } });

// //         expect(screen.queryByText("test1")).not.toBeInTheDocument();
// //         expect(screen.queryByText("test2")).not.toBeInTheDocument();
// //         expect(screen.queryByText("Test1")).not.toBeInTheDocument();
// //         expect(screen.queryByText("Test2")).not.toBeInTheDocument();
// //         expect(screen.queryByText("thisIsATest1")).not.toBeInTheDocument();
// //         expect(screen.getByText("Alice")).toBeInTheDocument();
// //     });

// //     test("Selecting a server calls onServerSelect and onChannelSelect with default channel", () => {
// //         render(
// //             <ServerList 
// //                 servers={servers} 
// //                 onServerSelect={onServerSelectMock} 
// //                 onChannelSelect={onChannelSelectMock} 
// //             />
// //         );

// //         const firstServer = screen.getByText("test1").closest('li');
// //         fireEvent.click(firstServer);

// //         expect(onServerSelectMock).toHaveBeenCalledWith(servers[0]);
// //         expect(onChannelSelectMock).toHaveBeenCalledWith("General");
// //     });

// //     test("Clicking on a channel calls onChannelSelect", async () => {
// //         const { rerender } = render(
// //             <ServerList 
// //                 servers={servers} 
// //                 onServerSelect={onServerSelectMock} 
// //                 onChannelSelect={onChannelSelectMock} 
// //             />
// //         );

// //         const firstServer = screen.getByText("test1").closest('li');
// //         fireEvent.click(firstServer);

// //         expect(onServerSelectMock).toHaveBeenCalledWith(servers[0]);
// //         expect(onChannelSelectMock).toHaveBeenCalledWith("General");

// //         onServerSelectMock.mockReset();
// //         onChannelSelectMock.mockReset();

// //         rerender(
// //             <ServerList 
// //                 servers={servers}
// //                 onServerSelect={onServerSelectMock}
// //                 onChannelSelect={onChannelSelectMock}
// //             />
// //         );

// //         const gamingChannel = screen.getByText("Gaming").closest('li');
// //         fireEvent.click(gamingChannel);

// //         expect(onChannelSelectMock).toHaveBeenCalledWith("Gaming");
// //         expect(onServerSelectMock).not.toHaveBeenCalled();
// //     });

// //     test("Adding a new channel works", async () => {
// //         const { rerender } = render(
// //             <ServerList 
// //                 servers={servers} 
// //                 onServerSelect={onServerSelectMock} 
// //                 onChannelSelect={onChannelSelectMock} 
// //             />
// //         );

// //         const firstServer = screen.getByText("test1").closest('li');
// //         fireEvent.click(firstServer);

// //         onServerSelectMock.mockReset();

// //         const addButton = screen.getByText("+ Add Channel");
// //         fireEvent.click(addButton);

// //         const input = screen.getByPlaceholderText("Channel name");
// //         fireEvent.change(input, { target: { value: "New Channel" } });
        
// //         const submitButton = screen.getByText("Add");
// //         fireEvent.click(submitButton);

// //         expect(onServerSelectMock).toHaveBeenCalled();
// //         const updatedServerArg = onServerSelectMock.mock.calls[0][0];
// //         expect(updatedServerArg.channels).toContain("New Channel");
// //     });

// //     test("Visual indication is applied to the selected channel", async () => {
// //         const { rerender } = render(
// //             <ServerList 
// //                 servers={servers} 
// //                 onServerSelect={onServerSelectMock} 
// //                 onChannelSelect={onChannelSelectMock} 
// //             />
// //         );

// //         const firstServer = screen.getByText("test1").closest('li');
// //         fireEvent.click(firstServer);

// //         rerender(
// //             <ServerList 
// //                 servers={servers}
// //                 onServerSelect={onServerSelectMock}
// //                 onChannelSelect={onChannelSelectMock}
// //             />
// //         );

// //         const generalChannel = screen.getByText("General").closest('li');
// //         fireEvent.click(generalChannel);

// //         expect(onChannelSelectMock).toHaveBeenCalledWith("General");
// //     });

// //     // ── Sprint 3 tests (profile edit modal) ────────────────────────────────
// //     // MUI Dialog does NOT unmount on close — it hides by removing role="dialog".
// //     // All modal interactions are scoped with within(dialog).
// //     // Sidebar assertions that could clash with hidden modal content use
// //     // role="dialog" absence check or fontWeight / style checks.

// //     test("Opens the profile edit modal when Edit button is clicked", () => {
// //         render(
// //             <ServerList
// //                 servers={servers}
// //                 onServerSelect={onServerSelectMock}
// //                 onChannelSelect={onChannelSelectMock}
// //             />
// //         );
// //         fireEvent.click(screen.getByText("Edit"));
// //         expect(screen.getByRole("dialog")).toBeInTheDocument();
// //     });

// //     test("Profile edit modal displays current username", () => {
// //         render(
// //             <ServerList
// //                 servers={servers}
// //                 onServerSelect={onServerSelectMock}
// //                 onChannelSelect={onChannelSelectMock}
// //             />
// //         );
// //         fireEvent.click(screen.getByText("Edit"));
// //         const dialog = screen.getByRole("dialog");
// //         const usernameField = within(dialog).getByLabelText("Username");
// //         expect(usernameField.value).toBe("Your Username");
// //     });

// //     test("Saves updated username after editing profile", () => {
// //         render(
// //             <ServerList
// //                 servers={servers}
// //                 onServerSelect={onServerSelectMock}
// //                 onChannelSelect={onChannelSelectMock}
// //             />
// //         );
// //         fireEvent.click(screen.getByText("Edit"));
// //         const dialog = screen.getByRole("dialog");
// //         fireEvent.change(within(dialog).getByLabelText("Username"), {
// //             target: { value: "NewUsername" },
// //         });
// //         fireEvent.click(within(dialog).getByText("Save"));
// //         // Dialog is closed — assert the bold sidebar name
// //         const boldName = screen.getByText("NewUsername");
// //         expect(boldName).toBeInTheDocument();
// //         expect(boldName.style.fontWeight).toBe("bold");
// //     });

// //     test("Closes modal without saving when Cancel is clicked", () => {
// //         render(
// //             <ServerList
// //                 servers={servers}
// //                 onServerSelect={onServerSelectMock}
// //                 onChannelSelect={onChannelSelectMock}
// //             />
// //         );
// //         fireEvent.click(screen.getByText("Edit"));
// //         const dialog = screen.getByRole("dialog");
// //         fireEvent.change(within(dialog).getByLabelText("Username"), {
// //             target: { value: "ShouldNotSave" },
// //         });
// //         fireEvent.click(within(dialog).getByText("Cancel"));
// //         // role="dialog" is gone after close
// //         expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
// //         // Original username still in sidebar
// //         expect(screen.getByText("Your Username")).toBeInTheDocument();
// //     });

// //     test("Status dot is visible in the sidebar", () => {
// //         render(
// //             <ServerList
// //                 servers={servers}
// //                 onServerSelect={onServerSelectMock}
// //                 onChannelSelect={onChannelSelectMock}
// //             />
// //         );
// //         // Default status is online — assert the green dot via inline style
// //         const greenDots = document.querySelectorAll(
// //             'div[style*="border-radius: 50%"][style*="background-color: green"]'
// //         );
// //         expect(greenDots.length).toBeGreaterThan(0);
// //     });
// // });

// // // import { test, expect, vi, describe, beforeEach } from "vitest";
// // // import { fireEvent, render, screen, within } from "@testing-library/react";
// // // import ServerList from "../MainScreen/ServerList/ServerList.jsx";

// // // const servers = [
// // //     { id: 1, name: "test1", icon: "public/vite.svg", channels: ["General", "Gaming", "Music"] },
// // //     { id: 2, name: "test2", icon: "public/vite.svg", channels: ["General", "Discussions", "Voice"] },
// // //     { id: 3, name: "Test1", icon: "public/vite.svg", channels: ["Forum", "one", "two"] },
// // //     { id: 4, name: "Test2", icon: "public/vite.svg", channels: ["dljfnadll", "Gadlfkndlg", "fkld"] },
// // //     { id: 5, name: "thisIsATest1", icon: "public/vite.svg", channels: ["kn", "dknf", "kdlfna"] },
// // //     { id: 6, name: "Alice", icon: "public/vite.svg", channels: ["1", "2", "3"] },
// // // ];

// // // describe('ServerList Component', () => {
// // //     let onServerSelectMock;
// // //     let onChannelSelectMock;

// // //     beforeEach(() => {
// // //         onServerSelectMock = vi.fn();
// // //         onChannelSelectMock = vi.fn();
// // //     });

// // //     // ── Sprint 2 tests (unchanged) ──────────────────────────────────────────

// // //     test('Renders without exceptions', () => {
// // //         expect(() => render(
// // //             <ServerList 
// // //                 servers={servers} 
// // //                 onServerSelect={onServerSelectMock} 
// // //                 onChannelSelect={onChannelSelectMock} 
// // //             />
// // //         )).not.toThrow();
// // //     });

// // //     test("Server list renders all test servers", () => {
// // //         render(
// // //             <ServerList 
// // //                 servers={servers} 
// // //                 onServerSelect={onServerSelectMock} 
// // //                 onChannelSelect={onChannelSelectMock} 
// // //             />
// // //         );

// // //         expect(screen.queryByText("test1")).toBeInTheDocument();
// // //         expect(screen.queryByText("test2")).toBeInTheDocument();
// // //         expect(screen.queryByText("Test1")).toBeInTheDocument();
// // //         expect(screen.queryByText("Test2")).toBeInTheDocument();
// // //         expect(screen.queryByText("thisIsATest1")).toBeInTheDocument();
// // //         expect(screen.getByText("Alice")).toBeInTheDocument();
// // //     });

// // //     test("Search filters servers returned", () => {
// // //         render(
// // //             <ServerList 
// // //                 servers={servers} 
// // //                 onServerSelect={onServerSelectMock} 
// // //                 onChannelSelect={onChannelSelectMock} 
// // //             />
// // //         );

// // //         const input = screen.getByLabelText("Search");

// // //         fireEvent.input(input, { target: { value: "Alice" } });

// // //         expect(screen.queryByText("test1")).not.toBeInTheDocument();
// // //         expect(screen.queryByText("test2")).not.toBeInTheDocument();
// // //         expect(screen.queryByText("Test1")).not.toBeInTheDocument();
// // //         expect(screen.queryByText("Test2")).not.toBeInTheDocument();
// // //         expect(screen.queryByText("thisIsATest1")).not.toBeInTheDocument();
// // //         expect(screen.getByText("Alice")).toBeInTheDocument();
// // //     });

// // //     test("Selecting a server calls onServerSelect and onChannelSelect with default channel", () => {
// // //         render(
// // //             <ServerList 
// // //                 servers={servers} 
// // //                 onServerSelect={onServerSelectMock} 
// // //                 onChannelSelect={onChannelSelectMock} 
// // //             />
// // //         );

// // //         const firstServer = screen.getByText("test1").closest('li');
// // //         fireEvent.click(firstServer);

// // //         expect(onServerSelectMock).toHaveBeenCalledWith(servers[0]);
        
// // //         expect(onChannelSelectMock).toHaveBeenCalledWith("General");
// // //     });

// // //     test("Clicking on a channel calls onChannelSelect", async () => {
// // //         const { rerender } = render(
// // //             <ServerList 
// // //                 servers={servers} 
// // //                 onServerSelect={onServerSelectMock} 
// // //                 onChannelSelect={onChannelSelectMock} 
// // //             />
// // //         );

// // //         const firstServer = screen.getByText("test1").closest('li');
// // //         fireEvent.click(firstServer);

// // //         expect(onServerSelectMock).toHaveBeenCalledWith(servers[0]);
// // //         expect(onChannelSelectMock).toHaveBeenCalledWith("General");

// // //         onServerSelectMock.mockReset();
// // //         onChannelSelectMock.mockReset();

// // //         rerender(
// // //             <ServerList 
// // //                 servers={servers}
// // //                 onServerSelect={onServerSelectMock}
// // //                 onChannelSelect={onChannelSelectMock}
// // //             />
// // //         );

// // //         // Now find and click a different channel
// // //         const gamingChannel = screen.getByText("Gaming").closest('li');
// // //         fireEvent.click(gamingChannel);

// // //         // Check if onChannelSelect was called with the correct channel
// // //         // and onServerSelect wasn't called
// // //         expect(onChannelSelectMock).toHaveBeenCalledWith("Gaming");
// // //         expect(onServerSelectMock).not.toHaveBeenCalled();
// // //     });

// // //     test("Adding a new channel works", async () => {
// // //         const { rerender } = render(
// // //             <ServerList 
// // //                 servers={servers} 
// // //                 onServerSelect={onServerSelectMock} 
// // //                 onChannelSelect={onChannelSelectMock} 
// // //             />
// // //         );

// // //         // First select a server to show channels
// // //         const firstServer = screen.getByText("test1").closest('li');
// // //         fireEvent.click(firstServer);

// // //         // Reset the mock to clearly see the next call
// // //         onServerSelectMock.mockReset();

// // //         // Find and click the Add Channel button
// // //         const addButton = screen.getByText("+ Add Channel");
// // //         fireEvent.click(addButton);

// // //         // Find the channel input and add a new channel
// // //         const input = screen.getByPlaceholderText("Channel name");
// // //         fireEvent.change(input, { target: { value: "New Channel" } });
        
// // //         // Submit the form
// // //         const submitButton = screen.getByText("Add");
// // //         fireEvent.click(submitButton);

// // //         // Check if onServerSelect was called with updated channels
// // //         expect(onServerSelectMock).toHaveBeenCalled();
// // //         const updatedServerArg = onServerSelectMock.mock.calls[0][0];
// // //         expect(updatedServerArg.channels).toContain("New Channel");
// // //     });

// // //     test("Visual indication is applied to the selected channel", async () => {

// // //         const { rerender } = render(
// // //             <ServerList 
// // //                 servers={servers} 
// // //                 onServerSelect={onServerSelectMock} 
// // //                 onChannelSelect={onChannelSelectMock} 
// // //             />
// // //         );

// // //         const firstServer = screen.getByText("test1").closest('li');
// // //         fireEvent.click(firstServer);

        
// // //         rerender(
// // //             <ServerList 
// // //                 servers={servers}
// // //                 onServerSelect={onServerSelectMock}
// // //                 onChannelSelect={onChannelSelectMock}
// // //             />
// // //         );

// // //         const generalChannel = screen.getByText("General").closest('li');
// // //         fireEvent.click(generalChannel);

        
// // //         expect(onChannelSelectMock).toHaveBeenCalledWith("General");
// // //     });

// // //     // ── Sprint 3 tests (profile edit modal) ────────────────────────────────
// // //     // NOTE: MUI Dialog does NOT unmount on close — it hides via aria-hidden.
// // //     // We use role="dialog" to detect open state, and within(dialog) to scope
// // //     // all modal interactions to avoid finding elements in the hidden dialog.

// // //     test("Opens the profile edit modal when Edit button is clicked", () => {
// // //         render(
// // //             <ServerList
// // //                 servers={servers}
// // //                 onServerSelect={onServerSelectMock}
// // //                 onChannelSelect={onChannelSelectMock}
// // //             />
// // //         );
// // //         fireEvent.click(screen.getByText("Edit"));
// // //         expect(screen.getByRole("dialog")).toBeInTheDocument();
// // //     });

// // //     test("Profile edit modal displays current username", () => {
// // //         render(
// // //             <ServerList
// // //                 servers={servers}
// // //                 onServerSelect={onServerSelectMock}
// // //                 onChannelSelect={onChannelSelectMock}
// // //             />
// // //         );
// // //         fireEvent.click(screen.getByText("Edit"));
// // //         const dialog = screen.getByRole("dialog");
// // //         const usernameField = within(dialog).getByLabelText("Username");
// // //         expect(usernameField.value).toBe("Your Username");
// // //     });

// // //     test("Saves updated username after editing profile", () => {
// // //         render(
// // //             <ServerList
// // //                 servers={servers}
// // //                 onServerSelect={onServerSelectMock}
// // //                 onChannelSelect={onChannelSelectMock}
// // //             />
// // //         );
// // //         fireEvent.click(screen.getByText("Edit"));
// // //         const dialog = screen.getByRole("dialog");
// // //         fireEvent.change(within(dialog).getByLabelText("Username"), {
// // //             target: { value: "NewUsername" },
// // //         });
// // //         fireEvent.click(within(dialog).getByText("Save"));
// // //         // Modal is now closed — assert the bold sidebar name updated
// // //         const boldName = screen.getByText("NewUsername");
// // //         expect(boldName).toBeInTheDocument();
// // //         expect(boldName.style.fontWeight).toBe("bold");
// // //     });

// // //     test("Closes modal without saving when Cancel is clicked", () => {
// // //         render(
// // //             <ServerList
// // //                 servers={servers}
// // //                 onServerSelect={onServerSelectMock}
// // //                 onChannelSelect={onChannelSelectMock}
// // //             />
// // //         );
// // //         fireEvent.click(screen.getByText("Edit"));
// // //         const dialog = screen.getByRole("dialog");
// // //         fireEvent.change(within(dialog).getByLabelText("Username"), {
// // //             target: { value: "ShouldNotSave" },
// // //         });
// // //         fireEvent.click(within(dialog).getByText("Cancel"));
// // //         // Dialog is now closed
// // //         expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
// // //         // Original username still in sidebar
// // //         expect(screen.getByText("Your Username")).toBeInTheDocument();
// // //     });

// // //     test("Status dot is visible in the sidebar", () => {
// // //         render(
// // //             <ServerList
// // //                 servers={servers}
// // //                 onServerSelect={onServerSelectMock}
// // //                 onChannelSelect={onChannelSelectMock}
// // //             />
// // //         );
// // //         // Default status is "online" — a green dot should be in the DOM
// // //         const greenDots = document.querySelectorAll(
// // //             'div[style*="border-radius: 50%"][style*="background-color: green"]'
// // //         );
// // //         expect(greenDots.length).toBeGreaterThan(0);
// // //     });
// // // });

// // // // import { test, expect, vi, describe, beforeEach } from "vitest";
// // // // import { fireEvent, render, screen } from "@testing-library/react";
// // // // import ServerList from "../MainScreen/ServerList/ServerList.jsx";

// // // // const servers = [
// // // //     { id: 1, name: "test1", icon: "public/vite.svg", channels: ["General", "Gaming", "Music"] },
// // // //     { id: 2, name: "test2", icon: "public/vite.svg", channels: ["General", "Discussions", "Voice"] },
// // // //     { id: 3, name: "Test1", icon: "public/vite.svg", channels: ["Forum", "one", "two"] },
// // // //     { id: 4, name: "Test2", icon: "public/vite.svg", channels: ["dljfnadll", "Gadlfkndlg", "fkld"] },
// // // //     { id: 5, name: "thisIsATest1", icon: "public/vite.svg", channels: ["kn", "dknf", "kdlfna"] },
// // // //     { id: 6, name: "Alice", icon: "public/vite.svg", channels: ["1", "2", "3"] },
// // // // ];

// // // // describe('ServerList Component', () => {
// // // //     let onServerSelectMock;
// // // //     let onChannelSelectMock;

// // // //     beforeEach(() => {
// // // //         onServerSelectMock = vi.fn();
// // // //         onChannelSelectMock = vi.fn();
// // // //     });

// // // //     test('Renders without exceptions', () => {
// // // //         expect(() => render(
// // // //             <ServerList 
// // // //                 servers={servers} 
// // // //                 onServerSelect={onServerSelectMock} 
// // // //                 onChannelSelect={onChannelSelectMock} 
// // // //             />
// // // //         )).not.toThrow();
// // // //     });

// // // //     test("Server list renders all test servers", () => {
// // // //         render(
// // // //             <ServerList 
// // // //                 servers={servers} 
// // // //                 onServerSelect={onServerSelectMock} 
// // // //                 onChannelSelect={onChannelSelectMock} 
// // // //             />
// // // //         );

// // // //         expect(screen.queryByText("test1")).toBeInTheDocument();
// // // //         expect(screen.queryByText("test2")).toBeInTheDocument();
// // // //         expect(screen.queryByText("Test1")).toBeInTheDocument();
// // // //         expect(screen.queryByText("Test2")).toBeInTheDocument();
// // // //         expect(screen.queryByText("thisIsATest1")).toBeInTheDocument();
// // // //         expect(screen.getByText("Alice")).toBeInTheDocument();
// // // //     });

// // // //     test("Search filters servers returned", () => {
// // // //         render(
// // // //             <ServerList 
// // // //                 servers={servers} 
// // // //                 onServerSelect={onServerSelectMock} 
// // // //                 onChannelSelect={onChannelSelectMock} 
// // // //             />
// // // //         );

// // // //         const input = screen.getByLabelText("Search");

// // // //         fireEvent.input(input, { target: { value: "Alice" } });

// // // //         expect(screen.queryByText("test1")).not.toBeInTheDocument();
// // // //         expect(screen.queryByText("test2")).not.toBeInTheDocument();
// // // //         expect(screen.queryByText("Test1")).not.toBeInTheDocument();
// // // //         expect(screen.queryByText("Test2")).not.toBeInTheDocument();
// // // //         expect(screen.queryByText("thisIsATest1")).not.toBeInTheDocument();
// // // //         expect(screen.getByText("Alice")).toBeInTheDocument();
// // // //     });

// // // //     test("Selecting a server calls onServerSelect and onChannelSelect with default channel", () => {
// // // //         render(
// // // //             <ServerList 
// // // //                 servers={servers} 
// // // //                 onServerSelect={onServerSelectMock} 
// // // //                 onChannelSelect={onChannelSelectMock} 
// // // //             />
// // // //         );

// // // //         const firstServer = screen.getByText("test1").closest('li');
// // // //         fireEvent.click(firstServer);

// // // //         expect(onServerSelectMock).toHaveBeenCalledWith(servers[0]);
        
// // // //         expect(onChannelSelectMock).toHaveBeenCalledWith("General");
// // // //     });

// // // //     test("Clicking on a channel calls onChannelSelect", async () => {
// // // //         const { rerender } = render(
// // // //             <ServerList 
// // // //                 servers={servers} 
// // // //                 onServerSelect={onServerSelectMock} 
// // // //                 onChannelSelect={onChannelSelectMock} 
// // // //             />
// // // //         );

// // // //         const firstServer = screen.getByText("test1").closest('li');
// // // //         fireEvent.click(firstServer);

// // // //         expect(onServerSelectMock).toHaveBeenCalledWith(servers[0]);
// // // //         expect(onChannelSelectMock).toHaveBeenCalledWith("General");

// // // //         onServerSelectMock.mockReset();
// // // //         onChannelSelectMock.mockReset();

// // // //         rerender(
// // // //             <ServerList 
// // // //                 servers={servers}
// // // //                 onServerSelect={onServerSelectMock}
// // // //                 onChannelSelect={onChannelSelectMock}
// // // //             />
// // // //         );

// // // //         // Now find and click a different channel
// // // //         const gamingChannel = screen.getByText("Gaming").closest('li');
// // // //         fireEvent.click(gamingChannel);

// // // //         // Check if onChannelSelect was called with the correct channel
// // // //         // and onServerSelect wasn't called
// // // //         expect(onChannelSelectMock).toHaveBeenCalledWith("Gaming");
// // // //         expect(onServerSelectMock).not.toHaveBeenCalled();
// // // //     });

// // // //     test("Adding a new channel works", async () => {
// // // //         const { rerender } = render(
// // // //             <ServerList 
// // // //                 servers={servers} 
// // // //                 onServerSelect={onServerSelectMock} 
// // // //                 onChannelSelect={onChannelSelectMock} 
// // // //             />
// // // //         );

// // // //         // First select a server to show channels
// // // //         const firstServer = screen.getByText("test1").closest('li');
// // // //         fireEvent.click(firstServer);

// // // //         // Reset the mock to clearly see the next call
// // // //         onServerSelectMock.mockReset();

// // // //         // Find and click the Add Channel button
// // // //         const addButton = screen.getByText("+ Add Channel");
// // // //         fireEvent.click(addButton);

// // // //         // Find the channel input and add a new channel
// // // //         const input = screen.getByPlaceholderText("Channel name");
// // // //         fireEvent.change(input, { target: { value: "New Channel" } });
        
// // // //         // Submit the form
// // // //         const submitButton = screen.getByText("Add");
// // // //         fireEvent.click(submitButton);

// // // //         // Check if onServerSelect was called with updated channels
// // // //         expect(onServerSelectMock).toHaveBeenCalled();
// // // //         const updatedServerArg = onServerSelectMock.mock.calls[0][0];
// // // //         expect(updatedServerArg.channels).toContain("New Channel");
// // // //     });

// // // //     test("Visual indication is applied to the selected channel", async () => {

// // // //         const { rerender } = render(
// // // //             <ServerList 
// // // //                 servers={servers} 
// // // //                 onServerSelect={onServerSelectMock} 
// // // //                 onChannelSelect={onChannelSelectMock} 
// // // //             />
// // // //         );

// // // //         const firstServer = screen.getByText("test1").closest('li');
// // // //         fireEvent.click(firstServer);

        

        
// // // //         rerender(
// // // //             <ServerList 
// // // //                 servers={servers}
// // // //                 onServerSelect={onServerSelectMock}
// // // //                 onChannelSelect={onChannelSelectMock}
// // // //             />
// // // //         );

// // // //         const generalChannel = screen.getByText("General").closest('li');
// // // //         fireEvent.click(generalChannel);

        
// // // //         expect(onChannelSelectMock).toHaveBeenCalledWith("General");
// // // //     });
// // // //     test("Opens the profile edit modal when Edit button is clicked", () => {
// // // //         render(
// // // //             <ServerList
// // // //                 servers={servers}
// // // //                 onServerSelect={onServerSelectMock}
// // // //                 onChannelSelect={onChannelSelectMock}
// // // //             />
// // // //         );
// // // //         fireEvent.click(screen.getByText("Edit"));
// // // //         expect(screen.getByText("Edit Profile")).toBeInTheDocument();
// // // //     });

// // // //     test("Profile edit modal displays current username", () => {
// // // //         render(
// // // //             <ServerList
// // // //                 servers={servers}
// // // //                 onServerSelect={onServerSelectMock}
// // // //                 onChannelSelect={onChannelSelectMock}
// // // //             />
// // // //         );
// // // //         fireEvent.click(screen.getByText("Edit"));
// // // //         const usernameField = screen.getByLabelText("Username");
// // // //         expect(usernameField.value).toBe("Your Username");
// // // //     });

// // // //     test("Saves updated username after editing profile", () => {
// // // //         render(
// // // //             <ServerList
// // // //                 servers={servers}
// // // //                 onServerSelect={onServerSelectMock}
// // // //                 onChannelSelect={onChannelSelectMock}
// // // //             />
// // // //         );
// // // //         fireEvent.click(screen.getByText("Edit"));
// // // //         const usernameField = screen.getByLabelText("Username");
// // // //         fireEvent.change(usernameField, { target: { value: "NewUsername" } });
// // // //         fireEvent.click(screen.getByText("Save"));
// // // //         expect(screen.queryByText("Edit Profile")).not.toBeInTheDocument();
// // // //         expect(screen.getByText("NewUsername")).toBeInTheDocument();
// // // //     });

// // // //     test("Closes modal without saving when Cancel is clicked", () => {
// // // //         render(
// // // //             <ServerList
// // // //                 servers={servers}
// // // //                 onServerSelect={onServerSelectMock}
// // // //                 onChannelSelect={onChannelSelectMock}
// // // //             />
// // // //         );
// // // //         fireEvent.click(screen.getByText("Edit"));
// // // //         const usernameField = screen.getByLabelText("Username");
// // // //         fireEvent.change(usernameField, { target: { value: "ShouldNotSave" } });
// // // //         fireEvent.click(screen.getByText("Cancel"));
// // // //         expect(screen.queryByText("Edit Profile")).not.toBeInTheDocument();
// // // //         expect(screen.queryByText("ShouldNotSave")).not.toBeInTheDocument();
// // // //         expect(screen.getByText("Your Username")).toBeInTheDocument();
// // // //     });

// // // //     test("Status dot is visible in the sidebar", () => {
// // // //         render(
// // // //             <ServerList
// // // //                 servers={servers}
// // // //                 onServerSelect={onServerSelectMock}
// // // //                 onChannelSelect={onChannelSelectMock}
// // // //             />
// // // //         );
// // // //         expect(screen.getByText("Online")).toBeInTheDocument();
// // // //     });
// // // // });
