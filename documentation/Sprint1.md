## Sprint 1 : SECTOR

## User Stories :

Our user stories, progress, and goals are stored in our repository's issues section (https://github.com/Sn00pyW00dst0ck/CEN5035-Project/issues). For your convenience, a summary has been provided below :

1. **Search Bar**  
   *As a user, I would like to be able to search for a particular message or content within the application to quickly find relevant information.*  

2. **Toggle between Light and Dark Mode**  
   *As a user, I would like to switch between light and dark modes for better visual comfort and accessibility.*  

3. **User Profile and Customization**  
   *As a user, I would like to customize my profile by updating my name, avatar, and other personal details to personalize my experience.*  

4. **User Personalized Status**  
   *As a user, I would like to set a personalized status so others can see my current availability or custom message.*  

5. **Block Users**  
   *As a user, I would like to block other users to prevent unwanted interactions and maintain my privacy.*  

6. **Read Receipt**  
   *As a user, I would like to see when my messages have been read by the recipient to confirm communication status.*  

7. **See other Online Group Members**  
   *As a user, I would like to see which members of my group are currently online to know who is available for conversation.*  

8. **Multimedia Support in Messages**  
   *As a user, I would like to send and receive multimedia content, such as images and videos, within messages to enhance communication.*  

9. **Group Sharing via QR Code**  
   *As a user, I would like to generate and scan QR codes to easily invite others to my group.*  

10. **"Login" to same account from multiple devices**  
   *As a user, I would like to log in to my account from multiple devices so I can access my messages and settings from anywhere.*  

11. **Login**  
   *As a user, I would like to securely log into the application to access my account and personalized settings.*  

12. **Message Verification**  
   *As a user, I would like to verify the authenticity of messages to ensure they have not been tampered with.*  

13. **Group Chats**  
   *As a user, I would like to participate in group chats so I can communicate with multiple people at once.*  

14. **Login Capabilities**  
   *As a user, I would like a reliable login system that securely authenticates my credentials and grants access to my account.*  


## Frontend:

Sprint 1 focused on defining and beginning to implement the frontend. We had three major objectives: identify what features Sector should provide users, create wireframes for how the application should appear to users, and begin implementation of said pages in React. Being that the backend needed to be built largely before we could implement communication between the two, we decided to save frontend-backend interaction until sprint 2. 

In the first week, we met with the backend engineers and discussed user stories (https://github.com/Sn00pyW00dst0ck/CEN5035-Project/issues?q=label%3A%22user%20story%22). Using these stories, we designed wireframe representations of the main and login pages (https://github.com/Sn00pyW00dst0ck/CEN5035-Project/issues/3). After discussion in a second meeting with the team, we were satisfied with the main page wireframe and began building it in React. 

In a frontend only meeting, we discussed which React component libraries we wanted to use and settled on MUI due to its comprehensiveness and simplicity. A default React template was built, followed by the definition of page layout and elements. Modularity was prioritized so that common elements like user badges could be reused in several contexts, such as the local user's badge and in the member list for servers. It currently features a server selection window, message window, and server member window. Although not complete, the main page closely follows our wireframe designs and scales appropriately to various desktop environments (https://github.com/Sn00pyW00dst0ck/CEN5035-Project/issues/30#issuecomment-2649268217). In addition, we have spoken with the backend developers on what information we want to be available at endpoints and how to access them.

## Backend: 

The backend Sprint 1 efforts focused primarily on evaluation of tooling & available libraries, determining what technologies we wanted to build the functionality upon, and the development of an initial schema for the various objects which will need to appear in the database to support application functionality. These were all pre-requisites to being able to serve functionality to the frontend application, which the backend team decided would be an end goal (albiet an ambitious one).

In the first week, we met with the frontend engineers and discussed user stories (https://github.com/Sn00pyW00dst0ck/CEN5035-Project/issues?q=label%3A%22user%20story%22). Using these stories, we determined a set of common functionality which would be needed for nearly all of the user stories to be implemented. These were common setup things, such as determining and setting up a database system, determining which libraries (if any) to utilize, and setting up a scalable, maintainable, and easy to utilize development system to support development. To this end, we created some issues (viewable [here](https://github.com/Sn00pyW00dst0ck/CEN5035-Project/issues?q=is%3Aissue%20milestone%3A%22Sprint%201%22%20label%3Abackend)) to serve as the end goal for sprint 1's backend development. 

Within backend only meetings, we compared the available libraries that were available and could potentially support our application. Ultimately, due to limitations and the incompleteness of the main P2P messaging library available for Go (called [wesh](https://wesh.network/)), we have decided to build our solution primarily off of [go-orbit-db](https://github.com/berty/go-orbit-db), which is a Go version of [OrbitDB](https://github.com/orbitdb/orbitdb/tree/main). This library will provide a nice way to handle data persistence between users, provide automatic peer discovery, and simplify data consistency issues immensely. 

Additionally, we decided to generate the gorilla mux backend servers via [oapi-codegen](https://github.com/oapi-codegen/oapi-codegen), which will allow for rapid development of the backend REST-like architecture. Furthermore, the tool [openapi-typescript](https://www.npmjs.com/package/openapi-typescript) is able to generate frontend TypeScript data models from the same specification that oapi-codegen is using to help simplify the integration process between the front and backends. The team meat with the frontend developers to determine what the needs of the system would be and have begun basic implmentations for the data models and routes. Further development efforts will focus primarily on expanding the available routes and documenting these routes. 

Unfortunately, due to the nature of experimenting with and determining the quality of external libraries, quite a lot of time was lost to these efforts. This explains why [Login Capabilities](https://github.com/Sn00pyW00dst0ck/CEN5035-Project/issues/9) were not implemented this sprint, we wanted to have a solid foundation for development and rushing into login implementation without a solid foundation was bound to backfire. We will include this user story as a goal when planning for sprint 2.  
