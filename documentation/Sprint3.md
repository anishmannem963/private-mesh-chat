# Sprint 3

## Frontend

### Integration with Backend Endpoints and Furthered Unit Testing

#### Overview
In Sprint 3, we focused primarily on continued integration with the backend. This includes logging in, fetching user groups, fetching group channels, and creating new group channels. We also addressed our lack of both unit and cypress tests to ensure that future changes will not inadvertently cause component failures. In addition, the following changes to the interface were made:

- Initial login screen rendering
- Successful login with credentials
- Server and Channel Interaction
- Displaying server list after authentication
- Server selection and channel display
- Adding new channels to existing servers
- Switching between channels
- Verifying correct message display for selected channels
- User profile management, can edit user status, Name, and description
- Servers and channels exist in the same state and messages are displayed appropriately for each selected channels

## Frontend Documentation

The frontend has two primary pages: the Login Page and the Main Page.

## Login
The login page consists of two forms: Username and Password. Currently, only the Username box must be filled to permit login as credentials have not been implemented. Upon sign in, a query is sent to the backend to fetch the user's data, before switching to the main page. We also intend to add a Register page in which the user can create a new account.

## Main
This is where the user will spend most of their time. It displays the user's groups, channels, messages, etc.

***Basic Anatomy***  
The main page is broken into two primary components: the Group List and the Active Server.

***Group List***  
Consists of the user's info, a server search bar, and a list of all the servers the client is in. When a server is selected, it becomes the 'active server'.

***Active Server***
Holds the messages of a selected channel in addition to a menu bar and member list.

## Unit Tests

**ActiveServer.test**
- Renders a placeholder when no server is selected
- Renders the main chat interface when a server is selected
- Passes the correct props to MenuBar
- Displays messages correctly
- Forwards channel selection from MenuBar
- Allows sending messages when a server and channel are selected
- Does not send empty messages
- Handles message sending via Enter key
- Does not call onChannelSelect when no channel is selected

**App.test**
- Renders without exceptions

**MainScreen.test**
- Renders without crashing
- Initializes with no selected server and channel
- Updates the selected server and channel when a server is selected
- Updates the selected channel when a channel is selected from the server list
- Updates the selected channel when a channel is selected from the dropdown menu
- Loads messages when a server and channel are selected
- Retains channel selection when changing between servers
- Handles state updates properly when changing channels

**MenuBar.test**
- Renders without crashing
- Renders ServerBadge with correct props
- Renders search component with correct label
- Renders menu button with icon
- Calls setVisible with opposite value when menu button is clicked
- Displays the selected channel name in the channel button
- Displays "select channel" when no channel is selected
- Opens the channel menu when the channel button is clicked
- Selects a channel when a menu item is clicked
- Marks the current selected channel as selected in the menu
- Handles the case when selected Server has no channels
- Handles the case when selectedServer is null

**ServerAndMembers.test**
- Renders without crashing
- Passes the correct props to ActiveServer
- Does not render Members by default (visible is false)
- Renders Members when visible state is true
- Forwards channel selection to parent component
- Handles null server and channel gracefully

**ServerBadge.test**
- Renders without exceptions
- Renders server name
- Renders default server icon
- Renders provided server icon

**ServerList.test**
- Renders without exceptions
- Server list renders all test servers
- Search filters servers returned
- Selecting a server calls onServerSelect and onChannelSelect with default channel
- Clicking on a channel calls onChannelSelect
- Adding a new channel works
- Visual indication is applied to the selected channel

**UserBadge.test**
- Renders without exceptions
- Renders server name
- Renders default server icon
- Renders provided server icon

## Cypress Tests

- Should display login screen on initial load
- Should require both username and password to login
- Should log in with valid credentials and show the main screen
- Should display server list with multiple servers
- Should select a server and display its channels
- Should allow adding a new channel to a server
- Should switch between channels and display correct messages
- Should send a new message in a channel
- Should open the user profile edit modal

## Backend

### Integration of Wails Framework

#### Overview
In Sprint 3, Integrating the [Wails framework](https://github.com/wailsapp/wails) has transformed Sector into a cross-platform desktop application, delivering a native experience on Windows, macOS, and Linux. By embedding the React frontend within the Go backend, Wails enables the creation of a single executable file, simplifying distribution and installation. This integration facilitates direct function calls between the frontend and backend, eliminating the need for HTTP requests and enhancing communication efficiency. However, in order to maintain the web interface's functionality, the team has decided that both the web and desktop versions will interact with the backend via HTTP requests for simplicity of development. Additionally, packaging the application as a unified executable streamlines deployment, reduces compatibility issues, and improves user accessibility.

Key implementation steps included:

- Restructuring the application to align with Wails' architecture.
- Configuring the embedding of frontend assets within the Go binary.
- Ensuring seamless communication between frontend and backend components.
- Updating the startup sequence to initialize both backend services and the frontend interface.
- Implementing robust context management to handle the application's lifecycle effectively.

This integration enhances Sector's functionality and user experience by leveraging Wails' capabilities to create a cohesive desktop application.

## Backend Unit Tests Overview

In Sprint 3, the unit tests have been leveled up by scaling test coverage across multiple modules:

### Account Management

- Creation, retrieval, updating, and deletion of user accounts, ensuring full lifecycle support.
- Searching accounts by criteria such as ID, creation date, and username, improving query validation.

### Group Management

- Operations for creating, retrieving, updating, and deleting groups, covering all core functionalities.
- Managing group memberships, including adding and removing members, to verify membership consistency.
- Searching groups based on ID, creation date, name, and membership, enhancing group discoverability.

### Channel Management

- Handling creation, retrieval, updating, and deletion of channels within groups, ensuring robust channel operations.
- Searching channels by ID, creation date, name, and associated group, validating channel relationships.

### Message Management

- Managing creation, retrieval, updating, and deletion of messages within channels, supporting complete message handling.
- Searching messages using criteria like ID, creation date, author, channel, pinned status, and content, ensuring comprehensive message filtering.

These unit tests are implemented using the Go testing framework and are located in the `backend/tests/api/v1/` directory of the repository. To run the tests, navigate to the `backend` directory and execute the following command:
```
go test -p 1 ./...
```

# Backend API Documentation

The following API documentation is **auto-generated** using **Swagger UI** for this project, which is hosted by the server.
A PDF printout of the Swagger UI has been inserted into the repository. Please view it here: [Sprint 3 Swagger UI.pdf](Swagger%20UI.pdf)

