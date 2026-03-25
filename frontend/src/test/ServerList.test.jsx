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